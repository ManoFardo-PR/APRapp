import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure, adminProcedure, superadminProcedure } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";
import { getUsersByCompany, countActiveUsersByCompany, createCompanyUser, updateCompanyUser, getCompanyById, getUserById, createAuditLog } from "./db";
import { TRPCError } from "@trpc/server";

import * as aprDb from "./aprDb";
import { storagePut } from "./storage";
import { nanoid } from "nanoid";

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Company management (superadmin only)
  companies: router({
    create: superadminProcedure
      .input(z.object({
        code: z.string().min(3).max(64),
        name: z.string().min(1).max(255),
        maxUsers: z.number().int().positive().default(10),
      }))
      .mutation(async ({ input, ctx }) => {
        // Check if company code already exists
        const existing = await db.getCompanyByCode(input.code);
        if (existing) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Código da empresa já existe",
          });
        }

        await db.createCompany({
          code: input.code,
          name: input.name,
          maxUsers: input.maxUsers,
        });

        // Create audit log
        await db.createAuditLog({
          companyId: 0, // System level
          userId: ctx.user.id,
          action: "CREATE_COMPANY",
          entityType: "company",
          entityId: null,
          details: { code: input.code, name: input.name },
          ipAddress: ctx.req.ip,
          userAgent: ctx.req.headers["user-agent"] || null,
        });

        return { success: true };
      }),

    list: superadminProcedure.query(async () => {
      return await db.getAllCompanies();
    }),

    update: superadminProcedure
      .input(z.object({
        id: z.number().int().positive(),
        name: z.string().min(1).max(255).optional(),
        maxUsers: z.number().int().positive().optional(),
        isActive: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { id, ...updates } = input;
        
        await db.updateCompany(id, updates);

        await db.createAuditLog({
          companyId: 0,
          userId: ctx.user.id,
          action: "UPDATE_COMPANY",
          entityType: "company",
          entityId: id,
          details: updates,
          ipAddress: ctx.req.ip,
          userAgent: ctx.req.headers["user-agent"] || null,
        });

        return { success: true };
      }),

    getByCode: publicProcedure
      .input(z.object({ code: z.string() }))
      .query(async ({ input }) => {
        return await db.getCompanyByCode(input.code);
      }),
  }),

  // User management
  users: router({
    // Get users in the same company (admin only)
    listCompanyUsers: adminProcedure.query(async ({ ctx }) => {
      if (!ctx.user.companyId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Usuário não está associado a uma empresa",
        });
      }

      return await db.getUsersByCompany(ctx.user.companyId);
    }),

    // Create new user (admin only)
    create: adminProcedure
      .input(z.object({
        email: z.string().email(),
        name: z.string().min(3),
        role: z.enum(["company_admin", "safety_tech", "requester"]),
        language: z.enum(["pt-BR", "en-US"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        if (!ctx.user.companyId) {
          throw new TRPCError({ code: "BAD_REQUEST", message: "Usuário não está associado a uma empresa" });
        }

        // Check user limit
        const company = await getCompanyById(ctx.user.companyId);
        if (!company) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Empresa não encontrada" });
        }

        const activeCount = await countActiveUsersByCompany(ctx.user.companyId);
        if (activeCount >= company.maxUsers) {
          throw new TRPCError({ 
            code: "BAD_REQUEST", 
            message: `Limite de usuários atingido (${activeCount}/${company.maxUsers})` 
          });
        }

        await createCompanyUser({
          ...input,
          companyId: ctx.user.companyId,
        });

        // Log audit
        await createAuditLog({
          companyId: ctx.user.companyId,
          userId: ctx.user.id,
          action: "CREATE_USER",
          entityType: "user",
          entityId: null,
          details: { email: input.email, role: input.role },
          ipAddress: ctx.req.ip,
          userAgent: ctx.req.headers["user-agent"] || null,
        });

        return { success: true };
      }),

    // Get user stats
    stats: adminProcedure.query(async ({ ctx }) => {
      if (!ctx.user.companyId) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Usuário não está associado a uma empresa" });
      }

      const company = await getCompanyById(ctx.user.companyId);
      const activeCount = await countActiveUsersByCompany(ctx.user.companyId);
      const allUsers = await getUsersByCompany(ctx.user.companyId);

      return {
        activeUsers: activeCount,
        totalUsers: allUsers.length,
        userLimit: company?.maxUsers || 0,
        percentageUsed: company?.maxUsers ? Math.round((activeCount / company.maxUsers) * 100) : 0,
      };
    }),

    // Update user (admin can update users in their company)
    update: adminProcedure
      .input(z.object({
        userId: z.number().int().positive(),
        role: z.enum(["requester", "safety_tech", "company_admin"]).optional(),
        isActive: z.boolean().optional(),
        language: z.enum(["pt-BR", "en-US"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const { userId, ...updates } = input;

        // Get target user
        const targetUser = await db.getUserById(userId);
        if (!targetUser) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Usuário não encontrado",
          });
        }

        // Company admin can only update users in their company
        if (ctx.user.role === "company_admin" && targetUser.companyId !== ctx.user.companyId) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Você não pode modificar usuários de outra empresa",
          });
        }

        // Prevent changing superadmin role
        if (targetUser.role === "superadmin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Não é possível modificar superadministradores",
          });
        }

        await db.updateUser(userId, updates);

        if (ctx.user.companyId) {
          await db.createAuditLog({
            companyId: ctx.user.companyId,
            userId: ctx.user.id,
            action: "UPDATE_USER",
            entityType: "user",
            entityId: userId,
            details: updates,
            ipAddress: ctx.req.ip,
            userAgent: ctx.req.headers["user-agent"] || null,
          });
        }

        return { success: true };
      }),

    // Get current user's profile
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserById(ctx.user.id);
      if (!user) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Usuário não encontrado",
        });
      }

      let company = null;
      if (user.companyId) {
        company = await db.getCompanyById(user.companyId);
      }

      return { user, company };
    }),

    // Update own profile
    updateProfile: protectedProcedure
      .input(z.object({
        name: z.string().min(1).optional(),
        language: z.enum(["pt-BR", "en-US"]).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        await db.updateUser(ctx.user.id, input);
        return { success: true };
      }),
  }),

  // APR management
  aprs: router({
    // Create new APR
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1).max(255),
        description: z.string().min(1),
        location: z.string().optional(),
        activityDescription: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user.companyId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Usuário não está associado a uma empresa",
          });
        }

        const result = await aprDb.createApr({
          companyId: ctx.user.companyId,
          createdBy: ctx.user.id,
          title: input.title,
          description: input.description,
          location: input.location,
          activityDescription: input.activityDescription,
          status: "draft",
        });

        const aprId = Number((result as any).insertId);

        await db.createAuditLog({
          companyId: ctx.user.companyId,
          userId: ctx.user.id,
          action: "CREATE_APR",
          entityType: "apr",
          entityId: aprId,
          details: { title: input.title },
          ipAddress: ctx.req.ip,
          userAgent: ctx.req.headers["user-agent"] || null,
        });

        return { aprId };
      }),

    // Get APR by ID
    getById: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .query(async ({ input, ctx }) => {
        if (!ctx.user.companyId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Usuário não está associado a uma empresa",
          });
        }

        const apr = await aprDb.getAprById(input.id, ctx.user.companyId);
        if (!apr) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "APR não encontrada",
          });
        }

        const images = await aprDb.getAprImages(input.id);
        const responses = await aprDb.getAprResponses(input.id);
        const signatures = await aprDb.getAprSignatures(input.id);

        return { apr, images, responses, signatures };
      }),

    // List APRs
    list: protectedProcedure
      .input(z.object({
        status: z.enum(["draft", "pending_approval", "approved", "rejected"]).optional(),
        userId: z.number().int().positive().optional(),
      }))
      .query(async ({ input, ctx }) => {
        if (!ctx.user.companyId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Usuário não está associado a uma empresa",
          });
        }

        let aprs;
        if (input.status) {
          aprs = await aprDb.getAprsByStatus(ctx.user.companyId, input.status);
        } else if (input.userId) {
          aprs = await aprDb.getAprsByUser(input.userId, ctx.user.companyId);
        } else {
          aprs = await aprDb.getAprsByCompany(ctx.user.companyId);
        }

        return aprs;
      }),

    // Update APR
    update: protectedProcedure
      .input(z.object({
        id: z.number().int().positive(),
        title: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        location: z.string().optional(),
        activityDescription: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user.companyId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Usuário não está associado a uma empresa",
          });
        }

        const { id, ...updates } = input;

        // Check if APR exists and belongs to user's company
        const apr = await aprDb.getAprById(id, ctx.user.companyId);
        if (!apr) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "APR não encontrada",
          });
        }

        // Only allow updates if APR is in draft status or user is admin
        if (apr.status !== "draft" && ctx.user.role !== "company_admin" && ctx.user.role !== "superadmin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Apenas APRs em rascunho podem ser editadas",
          });
        }

        await aprDb.updateApr(id, ctx.user.companyId, updates);

        await db.createAuditLog({
          companyId: ctx.user.companyId,
          userId: ctx.user.id,
          action: "UPDATE_APR",
          entityType: "apr",
          entityId: id,
          details: updates,
          ipAddress: ctx.req.ip,
          userAgent: ctx.req.headers["user-agent"] || null,
        });

        return { success: true };
      }),

    // Submit APR for approval
    submitForApproval: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user.companyId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Usuário não está associado a uma empresa",
          });
        }

        const apr = await aprDb.getAprById(input.id, ctx.user.companyId);
        if (!apr) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "APR não encontrada",
          });
        }

        if (apr.status !== "draft") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Apenas APRs em rascunho podem ser enviadas para aprovação",
          });
        }

        await aprDb.updateApr(input.id, ctx.user.companyId, {
          status: "pending_approval",
        });

        await db.createAuditLog({
          companyId: ctx.user.companyId,
          userId: ctx.user.id,
          action: "SUBMIT_APR",
          entityType: "apr",
          entityId: input.id,
          details: {},
          ipAddress: ctx.req.ip,
          userAgent: ctx.req.headers["user-agent"] || null,
        });

        return { success: true };
      }),

    // Approve/Reject APR (safety_tech only)
    reviewApr: protectedProcedure
      .input(z.object({
        id: z.number().int().positive(),
        approved: z.boolean(),
        comments: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user.companyId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Usuário não está associado a uma empresa",
          });
        }

        if (ctx.user.role !== "safety_tech" && ctx.user.role !== "company_admin" && ctx.user.role !== "superadmin") {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Apenas técnicos de segurança podem aprovar APRs",
          });
        }

        const apr = await aprDb.getAprById(input.id, ctx.user.companyId);
        if (!apr) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "APR não encontrada",
          });
        }

        if (apr.status !== "pending_approval") {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Apenas APRs pendentes podem ser revisadas",
          });
        }

        await aprDb.updateApr(input.id, ctx.user.companyId, {
          status: input.approved ? "approved" : "rejected",
          approvedBy: ctx.user.id,
          approvalComments: input.comments,
          approvedAt: new Date(),
        });

        await db.createAuditLog({
          companyId: ctx.user.companyId,
          userId: ctx.user.id,
          action: input.approved ? "APPROVE_APR" : "REJECT_APR",
          entityType: "apr",
          entityId: input.id,
          details: { comments: input.comments },
          ipAddress: ctx.req.ip,
          userAgent: ctx.req.headers["user-agent"] || null,
        });

        return { success: true };
      }),

    // Add image to APR
    addImage: protectedProcedure
      .input(z.object({
        aprId: z.number().int().positive(),
        imageData: z.string(),
        caption: z.string().optional(),
        order: z.number().int(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user.companyId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Usuário não está associado a uma empresa",
          });
        }

        // Verify APR exists and belongs to user's company
        const apr = await aprDb.getAprById(input.aprId, ctx.user.companyId);
        if (!apr) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "APR não encontrada",
          });
        }

        // Convert base64 to buffer
        const base64Data = input.imageData.replace(/^data:image\/\w+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");

        // Upload to S3
        const fileKey = `apr-images/${ctx.user.companyId}/${input.aprId}/${nanoid()}.jpg`;
        const { url } = await storagePut(fileKey, buffer, "image/jpeg");

        // Save to database
        await aprDb.addAprImage({
          aprId: input.aprId,
          imageUrl: url,
          imageKey: fileKey,
          caption: input.caption,
          order: input.order,
        });

        return { success: true, url };
      }),

    // Save questionnaire responses
    saveResponses: protectedProcedure
      .input(z.object({
        aprId: z.number().int().positive(),
        responses: z.array(z.object({
          questionKey: z.string(),
          questionText: z.string(),
          answer: z.string(),
          answerType: z.enum(["boolean", "text", "multiple_choice"]),
        })),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user.companyId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Usuário não está associado a uma empresa",
          });
        }

        // Verify APR exists
        const apr = await aprDb.getAprById(input.aprId, ctx.user.companyId);
        if (!apr) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "APR não encontrada",
          });
        }

        // Delete existing responses
        await aprDb.deleteAprResponses(input.aprId);

        // Add new responses
        for (const response of input.responses) {
          await aprDb.addAprResponse({
            aprId: input.aprId,
            questionKey: response.questionKey,
            questionText: response.questionText,
            answer: response.answer,
            answerType: response.answerType,
          });
        }

        return { success: true };
      }),

    // Get statistics
    getStats: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user.companyId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Usuário não está associado a uma empresa",
        });
      }

      return await aprDb.getAprStats(ctx.user.companyId);
    }),

    // Analyze APR with AI
    analyzeWithAI: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user.companyId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Usuário não está associado a uma empresa",
          });
        }

        const apr = await aprDb.getAprById(input.id, ctx.user.companyId);
        if (!apr) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "APR não encontrada",
          });
        }

        const images = await aprDb.getAprImages(input.id);
        const responses = await aprDb.getAprResponses(input.id);

        // Get user language
        const user = await db.getUserById(ctx.user.id);
        const language = user?.language || "pt-BR";

        // Import AI module
        const { analyzeAprWithAI } = await import("./aprAI");

        // Analyze with AI
        const analysis = await analyzeAprWithAI(
          apr.activityDescription,
          responses,
          images,
          language
        );

        // Update APR with AI analysis (convert to compatible format)
        await aprDb.updateApr(input.id, ctx.user.companyId, {
          aiAnalysis: analysis as any,
        });

        await db.createAuditLog({
          companyId: ctx.user.companyId,
          userId: ctx.user.id,
          action: "AI_ANALYZE_APR",
          entityType: "apr",
          entityId: input.id,
          details: { risksFound: analysis.risks.length },
          ipAddress: ctx.req.ip,
          userAgent: ctx.req.headers["user-agent"] || null,
        });

        return { success: true, analysis };
      }),

    // Generate PDF report
    generatePdfReport: protectedProcedure
      .input(z.object({ id: z.number().int().positive() }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user.companyId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Usuário não está associado a uma empresa",
          });
        }

        const apr = await aprDb.getAprById(input.id, ctx.user.companyId);
        if (!apr) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "APR não encontrada",
          });
        }

        const images = await aprDb.getAprImages(input.id);
        const company = await db.getCompanyById(ctx.user.companyId);
        const creator = await db.getUserById(apr.createdBy);
        
        let approver = null;
        if (apr.approvedBy) {
          approver = await db.getUserById(apr.approvedBy);
        }

        // Get user language
        const user = await db.getUserById(ctx.user.id);
        const language = user?.language || "pt-BR";

        // Import report module
        const { generateAprPdfReport } = await import("./aprReport");

        // Generate PDF
        const pdfBuffer = await generateAprPdfReport(
          {
            apr,
            images,
            analysis: apr.aiAnalysis as any,
            company: {
              name: company?.name || "",
              code: company?.code || "",
            },
            creator: {
              name: creator?.name || "",
              email: creator?.email || "",
            },
            approver: approver ? {
              name: approver.name || "",
              email: approver.email || "",
            } : undefined,
          },
          language
        );

        // Convert buffer to base64 for transmission
        const pdfBase64 = pdfBuffer.toString('base64');

        await db.createAuditLog({
          companyId: ctx.user.companyId,
          userId: ctx.user.id,
          action: "GENERATE_APR_PDF",
          entityType: "apr",
          entityId: input.id,
          details: {},
          ipAddress: ctx.req.ip,
          userAgent: ctx.req.headers["user-agent"] || null,
        });

        return { success: true, pdfBase64 };
      }),
  }),
});

export type AppRouter = typeof appRouter;

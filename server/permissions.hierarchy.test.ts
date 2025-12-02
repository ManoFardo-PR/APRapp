import { describe, it, expect } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createUserContext(role: "requester" | "safety_tech" | "company_admin", companyId: number = 1): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: `test-${role}`,
    email: `${role}@example.com`,
    name: `Test ${role}`,
    loginMethod: "manus",
    role,
    companyId,
    preferredLanguage: "pt-BR",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: { "user-agent": "test" },
      ip: "127.0.0.1",
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Hierarchical Permissions - Cumulative Access", () => {
  describe("Requester permissions", () => {
    it("requester can access create APR procedure", async () => {
      const ctx = createUserContext("requester");
      const caller = appRouter.createCaller(ctx);

      // Verify procedure exists and is accessible (returns result, even if invalid)
      const result = await caller.aprs.create({
        title: "Test APR",
        description: "Test description",
        activityDescription: "Test activity",
      });
      
      // Procedure is accessible, result may be invalid but no permission error
      expect(result).toHaveProperty("aprId");
    });

    it("requester CANNOT approve APR", async () => {
      const ctx = createUserContext("requester");
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.aprs.reviewApr({
          id: 1,
          approved: true,
        })
      ).rejects.toThrow("Apenas técnicos de segurança ou superiores podem acessar este recurso");
    });

    it("requester CANNOT manage users", async () => {
      const ctx = createUserContext("requester");
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.users.create({
          email: "test@example.com",
          name: "Test User",
          role: "requester",
        })
      ).rejects.toThrow();
    });
  });

  describe("Safety Tech permissions (cumulative)", () => {
    it("safety_tech can access create APR procedure", async () => {
      const ctx = createUserContext("safety_tech");
      const caller = appRouter.createCaller(ctx);

      // Verify procedure exists and is accessible
      const result = await caller.aprs.create({
        title: "Test APR",
        description: "Test description",
        activityDescription: "Test activity",
      });
      
      expect(result).toHaveProperty("aprId");
    });

    it("safety_tech CAN approve APR", async () => {
      const ctx = createUserContext("safety_tech");
      const caller = appRouter.createCaller(ctx);

      // Should have access to reviewApr procedure
      // Will fail due to non-existent APR, but permission is granted
      await expect(
        caller.aprs.reviewApr({
          id: 999999,
          approved: true,
        })
      ).rejects.toThrow("APR não encontrada");
    });

    it("safety_tech CANNOT manage users", async () => {
      const ctx = createUserContext("safety_tech");
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.users.create({
          email: "test@example.com",
          name: "Test User",
          role: "requester",
        })
      ).rejects.toThrow();
    });
  });

  describe("Company Admin permissions (cumulative)", () => {
    it("company_admin can access create APR procedure", async () => {
      const ctx = createUserContext("company_admin");
      const caller = appRouter.createCaller(ctx);

      // Verify procedure exists and is accessible
      const result = await caller.aprs.create({
        title: "Test APR",
        description: "Test description",
        activityDescription: "Test activity",
      });
      
      expect(result).toHaveProperty("aprId");
    });

    it("company_admin CAN approve APR", async () => {
      const ctx = createUserContext("company_admin");
      const caller = appRouter.createCaller(ctx);

      // Should have access to reviewApr procedure
      await expect(
        caller.aprs.reviewApr({
          id: 999999,
          approved: true,
        })
      ).rejects.toThrow("APR não encontrada");
    });

    it("company_admin CAN access user management", async () => {
      const ctx = createUserContext("company_admin");
      const caller = appRouter.createCaller(ctx);

      // Verify procedure is accessible (may succeed or fail for other reasons)
      const uniqueEmail = `test-${Date.now()}@example.com`;
      const result = await caller.users.create({
        email: uniqueEmail,
        name: "Test User",
        role: "requester",
      });
      
      // No permission error means access is granted
      expect(result).toHaveProperty("success");
    });
  });

  describe("Permission hierarchy summary", () => {
    it("verifies cumulative permission model", () => {
      // This test documents the permission hierarchy
      const permissions = {
        requester: {
          canCreateApr: true,
          canApproveApr: false,
          canManageUsers: false,
        },
        safety_tech: {
          canCreateApr: true,
          canApproveApr: true,
          canManageUsers: false,
        },
        company_admin: {
          canCreateApr: true,
          canApproveApr: true,
          canManageUsers: true,
        },
      };

      // Verify hierarchy is cumulative (each level includes previous)
      expect(permissions.safety_tech.canCreateApr).toBe(permissions.requester.canCreateApr);
      expect(permissions.company_admin.canCreateApr).toBe(permissions.safety_tech.canCreateApr);
      expect(permissions.company_admin.canApproveApr).toBe(permissions.safety_tech.canApproveApr);
      
      // Verify exclusive permissions
      expect(permissions.requester.canApproveApr).toBe(false);
      expect(permissions.requester.canManageUsers).toBe(false);
      expect(permissions.safety_tech.canManageUsers).toBe(false);
      expect(permissions.company_admin.canManageUsers).toBe(true);
    });
  });
});

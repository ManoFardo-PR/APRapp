import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, json, boolean } from "drizzle-orm/mysql-core";

/**
 * Companies table - Each company is a tenant in the system
 */
export const companies = mysqlTable("companies", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 64 }).notNull().unique(),
  name: varchar("name", { length: 255 }).notNull(),
  maxUsers: int("max_users").default(10).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
});

export type Company = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;

/**
 * Core user table with multitenancy support
 * Roles: superadmin, company_admin, requester, safety_tech
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  companyId: int("company_id"),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["superadmin", "company_admin", "requester", "safety_tech"]).default("requester").notNull(),
  language: mysqlEnum("language", ["pt-BR", "en-US"]).default("pt-BR").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * APR (Análise Preliminar de Risco) main table
 * Status: draft, pending_approval, approved, rejected
 */
export const aprs = mysqlTable("aprs", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("company_id").notNull(),
  createdBy: int("created_by").notNull(),
  approvedBy: int("approved_by"),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description").notNull(),
  location: varchar("location", { length: 255 }),
  activityDescription: text("activity_description").notNull(),
  status: mysqlEnum("status", ["draft", "pending_approval", "approved", "rejected"]).default("draft").notNull(),
  aiAnalysis: json("ai_analysis").$type<{
    risks: Array<{
      type: string;
      description: string;
      consequences: string;
      probability: string;
      severity: string;
    }>;
    controlMeasures: {
      existing: string[];
      recommended: string[];
    };
    requiredPPE: string[];
    specialPermissions: string[];
    summary: string;
  }>(),
  approvalComments: text("approval_comments"),
  pdfUrl: varchar("pdf_url", { length: 512 }),
  qrCode: varchar("qr_code", { length: 512 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  approvedAt: timestamp("approved_at"),
});

export type Apr = typeof aprs.$inferSelect;
export type InsertApr = typeof aprs.$inferInsert;

/**
 * APR Images - Photos uploaded for each APR
 */
export const aprImages = mysqlTable("apr_images", {
  id: int("id").autoincrement().primaryKey(),
  aprId: int("apr_id").notNull(),
  imageUrl: varchar("image_url", { length: 512 }).notNull(),
  imageKey: varchar("image_key", { length: 512 }).notNull(),
  caption: text("caption"),
  order: int("order").notNull(),
  uploadedAt: timestamp("uploaded_at").defaultNow().notNull(),
});

export type AprImage = typeof aprImages.$inferSelect;
export type InsertAprImage = typeof aprImages.$inferInsert;

/**
 * APR Responses - Structured questionnaire responses
 */
export const aprResponses = mysqlTable("apr_responses", {
  id: int("id").autoincrement().primaryKey(),
  aprId: int("apr_id").notNull(),
  questionKey: varchar("question_key", { length: 128 }).notNull(),
  questionText: text("question_text").notNull(),
  answer: text("answer").notNull(),
  answerType: mysqlEnum("answer_type", ["boolean", "text", "multiple_choice"]).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AprResponse = typeof aprResponses.$inferSelect;
export type InsertAprResponse = typeof aprResponses.$inferInsert;

/**
 * Audit Logs - Complete audit trail for all actions
 */
export const auditLogs = mysqlTable("audit_logs", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("company_id").notNull(),
  userId: int("user_id").notNull(),
  action: varchar("action", { length: 128 }).notNull(),
  entityType: varchar("entity_type", { length: 64 }).notNull(),
  entityId: int("entity_id"),
  details: json("details").$type<Record<string, unknown>>(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

/**
 * Pre-configured admin emails for companies
 * When a user with this email logs in, they are automatically assigned as company_admin
 */
export const companyAdminEmails = mysqlTable("company_admin_emails", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("companyId").notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  createdBy: int("createdBy").notNull(), // superadmin who added this email
});

export type CompanyAdminEmail = typeof companyAdminEmails.$inferSelect;
export type InsertCompanyAdminEmail = typeof companyAdminEmails.$inferInsert;

/**
 * Statistics - Pre-calculated statistics for performance
 */
export const statistics = mysqlTable("statistics", {
  id: int("id").autoincrement().primaryKey(),
  companyId: int("company_id").notNull(),
  period: varchar("period", { length: 32 }).notNull(),
  totalAprs: int("total_aprs").default(0).notNull(),
  approvedAprs: int("approved_aprs").default(0).notNull(),
  rejectedAprs: int("rejected_aprs").default(0).notNull(),
  pendingAprs: int("pending_aprs").default(0).notNull(),
  riskDistribution: json("risk_distribution").$type<Record<string, number>>(),
  topRisks: json("top_risks").$type<Array<{ risk: string; count: number }>>(),
  aiCorrections: int("ai_corrections").default(0).notNull(),
  calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
});

export type Statistic = typeof statistics.$inferSelect;
export type InsertStatistic = typeof statistics.$inferInsert;

/**
 * Digital Signatures - Optional digital signatures for APRs
 */
export const digitalSignatures = mysqlTable("digital_signatures", {
  id: int("id").autoincrement().primaryKey(),
  aprId: int("apr_id").notNull(),
  userId: int("user_id").notNull(),
  signatureType: mysqlEnum("signature_type", ["requester", "safety_tech", "supervisor"]).notNull(),
  signatureData: text("signature_data").notNull(),
  signedAt: timestamp("signed_at").defaultNow().notNull(),
});

export type DigitalSignature = typeof digitalSignatures.$inferSelect;
export type InsertDigitalSignature = typeof digitalSignatures.$inferInsert;

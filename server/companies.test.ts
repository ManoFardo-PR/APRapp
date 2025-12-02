import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createSuperadminContext(): TrpcContext {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "superadmin-user",
    email: "superadmin@example.com",
    name: "Super Admin",
    loginMethod: "manus",
    role: "superadmin",
    companyId: null,
    language: "pt-BR",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
      ip: "127.0.0.1",
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

function createCompanyAdminContext(companyId: number): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Company Admin",
    loginMethod: "manus",
    role: "company_admin",
    companyId,
    language: "pt-BR",
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
      ip: "127.0.0.1",
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("companies router", () => {
  it("should allow superadmin to list companies", async () => {
    const ctx = createSuperadminContext();
    const caller = appRouter.createCaller(ctx);

    const companies = await caller.companies.list();
    expect(Array.isArray(companies)).toBe(true);
  });

  it("should prevent non-superadmin from listing companies", async () => {
    const ctx = createCompanyAdminContext(1);
    const caller = appRouter.createCaller(ctx);

    await expect(caller.companies.list()).rejects.toThrow();
  });

  it("should allow getting company by code", async () => {
    const ctx = createSuperadminContext();
    const caller = appRouter.createCaller(ctx);

    // This will return undefined if company doesn't exist, which is expected
    const result = await caller.companies.getByCode({ code: "TEST123" });
    expect(result === undefined || (result !== null && typeof result === "object")).toBe(true);
  });
});

describe("users router", () => {
  it("should allow admin to list company users", async () => {
    const ctx = createCompanyAdminContext(1);
    const caller = appRouter.createCaller(ctx);

    const users = await caller.users.listCompanyUsers();
    expect(Array.isArray(users)).toBe(true);
  });

  it("should throw error when user not found in database", async () => {
    const ctx = createCompanyAdminContext(1);
    const caller = appRouter.createCaller(ctx);

    // This will fail because user doesn't exist in database
    await expect(caller.users.getProfile()).rejects.toThrow("Usuário não encontrado");
  });
});

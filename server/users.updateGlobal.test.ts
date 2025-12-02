import { describe, it, expect } from "vitest";
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

function createCompanyAdminContext(companyId: number): TrpcContext {
  const user: AuthenticatedUser = {
    id: 2,
    openId: "admin-user",
    email: "admin@example.com",
    name: "Company Admin",
    loginMethod: "manus",
    role: "company_admin",
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

describe("users.updateGlobal (superadmin)", () => {
  it("should allow superadmin to call updateGlobal procedure", async () => {
    const ctx = createSuperadminContext();
    const caller = appRouter.createCaller(ctx);

    // This test verifies the procedure exists and accepts correct input
    // In a real scenario, this would update an existing user
    // For now, we test with a non-existent user to verify error handling
    await expect(
      caller.users.updateGlobal({
        userId: 999999,
        role: "requester",
      })
    ).rejects.toThrow("Usuário não encontrado");
  });

  it("should reject non-superadmin from using updateGlobal", async () => {
    const ctx = createCompanyAdminContext(1);
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.users.updateGlobal({
        userId: 1,
        role: "company_admin",
      })
    ).rejects.toThrow();
  });

  it("should accept valid role values", async () => {
    const ctx = createSuperadminContext();
    const caller = appRouter.createCaller(ctx);

    // Test all valid role values
    const validRoles = ["superadmin", "company_admin", "safety_tech", "requester"] as const;

    for (const role of validRoles) {
      await expect(
        caller.users.updateGlobal({
          userId: 999999,
          role,
        })
      ).rejects.toThrow("Usuário não encontrado");
    }
  });

  it("should accept valid language values", async () => {
    const ctx = createSuperadminContext();
    const caller = appRouter.createCaller(ctx);

    // Test valid language values
    const validLanguages = ["pt-BR", "en-US"] as const;

    for (const lang of validLanguages) {
      await expect(
        caller.users.updateGlobal({
          userId: 999999,
          preferredLanguage: lang,
        })
      ).rejects.toThrow("Usuário não encontrado");
    }
  });

  it("should accept isActive boolean", async () => {
    const ctx = createSuperadminContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.users.updateGlobal({
        userId: 999999,
        isActive: false,
      })
    ).rejects.toThrow("Usuário não encontrado");

    await expect(
      caller.users.updateGlobal({
        userId: 999999,
        isActive: true,
      })
    ).rejects.toThrow("Usuário não encontrado");
  });

  it("should allow updating multiple fields at once", async () => {
    const ctx = createSuperadminContext();
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.users.updateGlobal({
        userId: 999999,
        role: "safety_tech",
        preferredLanguage: "en-US",
        isActive: false,
      })
    ).rejects.toThrow("Usuário não encontrado");
  });
});

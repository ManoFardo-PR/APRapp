import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createRequesterContext(companyId: number): TrpcContext {
  const user: AuthenticatedUser = {
    id: 3,
    openId: "requester-user",
    email: "requester@example.com",
    name: "Requester User",
    loginMethod: "manus",
    role: "requester",
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

function createSafetyTechContext(companyId: number): TrpcContext {
  const user: AuthenticatedUser = {
    id: 4,
    openId: "safety-tech-user",
    email: "safety@example.com",
    name: "Safety Tech",
    loginMethod: "manus",
    role: "safety_tech",
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

describe("aprs router", () => {
  it("should allow requester to list APRs", async () => {
    const ctx = createRequesterContext(1);
    const caller = appRouter.createCaller(ctx);

    const aprs = await caller.aprs.list({});
    expect(Array.isArray(aprs)).toBe(true);
  });

  it("should allow requester to get stats", async () => {
    const ctx = createRequesterContext(1);
    const caller = appRouter.createCaller(ctx);

    const stats = await caller.aprs.getStats();
    expect(stats).toBeDefined();
  });

  it("should prevent user without company from creating APR", async () => {
    const ctx = createRequesterContext(1);
    ctx.user!.companyId = null;
    const caller = appRouter.createCaller(ctx);

    await expect(
      caller.aprs.create({
        title: "Test APR",
        description: "Test description",
        activityDescription: "Test activity",
      })
    ).rejects.toThrow("Usuário não está associado a uma empresa");
  });

  it("should allow safety tech to list pending APRs", async () => {
    const ctx = createSafetyTechContext(1);
    const caller = appRouter.createCaller(ctx);

    const aprs = await caller.aprs.list({ status: "pending_approval" });
    expect(Array.isArray(aprs)).toBe(true);
  });
});

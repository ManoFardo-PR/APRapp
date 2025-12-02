import { eq, and, desc, sql } from "drizzle-orm";
import { getDb } from "./db";
import { aprs, InsertApr, aprImages, InsertAprImage, aprResponses, InsertAprResponse, digitalSignatures, InsertDigitalSignature } from "../drizzle/schema";

// APR CRUD operations
export async function createApr(apr: InsertApr) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(aprs).values(apr);
  return result;
}

export async function getAprById(id: number, companyId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(aprs).where(
    and(
      eq(aprs.id, id),
      eq(aprs.companyId, companyId)
    )
  ).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getAprsByCompany(companyId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return await db.select()
    .from(aprs)
    .where(eq(aprs.companyId, companyId))
    .orderBy(desc(aprs.createdAt))
    .limit(limit);
}

export async function getAprsByUser(userId: number, companyId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select()
    .from(aprs)
    .where(
      and(
        eq(aprs.createdBy, userId),
        eq(aprs.companyId, companyId)
      )
    )
    .orderBy(desc(aprs.createdAt));
}

export async function getAprsByStatus(companyId: number, status: string) {
  const db = await getDb();
  if (!db) return [];

  return await db.select()
    .from(aprs)
    .where(
      and(
        eq(aprs.companyId, companyId),
        eq(aprs.status, status as any)
      )
    )
    .orderBy(desc(aprs.createdAt));
}

export async function updateApr(id: number, companyId: number, updates: Partial<InsertApr>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(aprs).set(updates).where(
    and(
      eq(aprs.id, id),
      eq(aprs.companyId, companyId)
    )
  );
}

export async function deleteApr(id: number, companyId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(aprs).where(
    and(
      eq(aprs.id, id),
      eq(aprs.companyId, companyId)
    )
  );
}

// APR Images operations
export async function addAprImage(image: InsertAprImage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(aprImages).values(image);
}

export async function getAprImages(aprId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select()
    .from(aprImages)
    .where(eq(aprImages.aprId, aprId))
    .orderBy(aprImages.order);
}

export async function deleteAprImage(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(aprImages).where(eq(aprImages.id, id));
}

// APR Responses operations
export async function addAprResponse(response: InsertAprResponse) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(aprResponses).values(response);
}

export async function getAprResponses(aprId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select()
    .from(aprResponses)
    .where(eq(aprResponses.aprId, aprId))
    .orderBy(aprResponses.createdAt);
}

export async function deleteAprResponses(aprId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(aprResponses).where(eq(aprResponses.aprId, aprId));
}

// Digital Signatures operations
export async function addDigitalSignature(signature: InsertDigitalSignature) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(digitalSignatures).values(signature);
}

export async function getAprSignatures(aprId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select()
    .from(digitalSignatures)
    .where(eq(digitalSignatures.aprId, aprId))
    .orderBy(digitalSignatures.signedAt);
}

// Statistics and filtering
export async function getAprStats(companyId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db.select({
    total: sql<number>`COUNT(*)`,
    draft: sql<number>`SUM(CASE WHEN ${aprs.status} = 'draft' THEN 1 ELSE 0 END)`,
    pending: sql<number>`SUM(CASE WHEN ${aprs.status} = 'pending_approval' THEN 1 ELSE 0 END)`,
    approved: sql<number>`SUM(CASE WHEN ${aprs.status} = 'approved' THEN 1 ELSE 0 END)`,
    rejected: sql<number>`SUM(CASE WHEN ${aprs.status} = 'rejected' THEN 1 ELSE 0 END)`,
  })
  .from(aprs)
  .where(eq(aprs.companyId, companyId));

  return result[0] || null;
}

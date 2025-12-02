import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, companies, InsertCompany, auditLogs, InsertAuditLog } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    
    // Check if email matches a pre-configured admin email
    if (user.email && !user.companyId && !user.role) {
      const companyMatch = await findCompanyByAdminEmail(user.email);
      if (companyMatch) {
        values.companyId = companyMatch.companyId;
        values.role = 'company_admin';
        updateSet.companyId = companyMatch.companyId;
        updateSet.role = 'company_admin';
        console.log(`[Auth] Auto-assigned user ${user.email} as company_admin for company ${companyMatch.companyName}`);
      }
    }
    
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'superadmin';
      updateSet.role = 'superadmin';
    }
    if (user.companyId !== undefined) {
      values.companyId = user.companyId;
      updateSet.companyId = user.companyId;
    }
    if (user.language !== undefined) {
      values.language = user.language;
      updateSet.language = user.language;
    }
    if (user.isActive !== undefined) {
      values.isActive = user.isActive;
      updateSet.isActive = user.isActive;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Company management functions
export async function createCompany(company: InsertCompany) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(companies).values(company);
  return result;
}

export async function getCompanyByCode(code: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(companies).where(eq(companies.code, code)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getCompanyById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(companies).where(eq(companies.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllCompanies() {
  const db = await getDb();
  if (!db) return [];

  const allCompanies = await db.select().from(companies).orderBy(desc(companies.createdAt));
  
  // Add user count for each company
  const companiesWithCount = await Promise.all(
    allCompanies.map(async (company) => {
      const companyUsers = await db
        .select()
        .from(users)
        .where(eq(users.companyId, company.id));
      return {
        ...company,
        userCount: companyUsers.length,
      };
    })
  );
  
  return companiesWithCount;
}

export async function updateCompany(id: number, updates: Partial<InsertCompany>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(companies).set(updates).where(eq(companies.id, id));
}

// User management functions
export async function getUsersByCompany(companyId: number) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(users).where(eq(users.companyId, companyId));
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUser(id: number, updates: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(users).set(updates).where(eq(users.id, id));
}

export async function getUsersByRole(companyId: number, role: string) {
  const db = await getDb();
  if (!db) return [];

  return await db.select().from(users).where(
    and(
      eq(users.companyId, companyId),
      eq(users.role, role as any)
    )
  );
}

// Audit log functions
export async function createAuditLog(log: InsertAuditLog) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create audit log: database not available");
    return;
  }

  try {
    await db.insert(auditLogs).values(log);
  } catch (error) {
    console.error("[Database] Failed to create audit log:", error);
  }
}

export async function getAuditLogs(companyId: number, limit: number = 100) {
  const db = await getDb();
  if (!db) return [];

  return await db.select()
    .from(auditLogs)
    .where(eq(auditLogs.companyId, companyId))
    .orderBy(desc(auditLogs.createdAt))
    .limit(limit);
}


// User management queries
export async function countActiveUsersByCompany(companyId: number): Promise<number> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot count users: database not available");
    return 0;
  }

  const result = await db
    .select()
    .from(users)
    .where(eq(users.companyId, companyId));
  
  return result.filter(u => u.isActive).length;
}

export async function createCompanyUser(data: {
  email: string;
  name: string;
  companyId: number;
  role: "company_admin" | "safety_tech" | "requester";
  language?: "pt-BR" | "en-US";
}) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  // Check if email already exists in this company
  const existing = await db
    .select()
    .from(users)
    .where(eq(users.email, data.email))
    .limit(1);

  if (existing.length > 0 && existing[0]?.companyId === data.companyId) {
    throw new Error("Email já cadastrado nesta empresa");
  }

  const result = await db.insert(users).values({
    email: data.email,
    name: data.name,
    companyId: data.companyId,
    role: data.role,
    language: data.language || "pt-BR",
    isActive: true,
    openId: `pending-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Temporary until first login
  });

  return result;
}

export async function updateCompanyUser(userId: number, data: {
  name?: string;
  role?: "company_admin" | "safety_tech" | "requester";
  language?: "pt-BR" | "en-US";
  isActive?: boolean;
}) {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  const updateData: Partial<InsertUser> = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.role !== undefined) updateData.role = data.role;
  if (data.language !== undefined) updateData.language = data.language;
  if (data.isActive !== undefined) updateData.isActive = data.isActive;
  updateData.updatedAt = new Date();

  await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, userId));
}


// ============================================================================
// Company Admin Emails Management
// ============================================================================

export async function addCompanyAdminEmail(data: { companyId: number; email: string; createdBy: number }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { companyAdminEmails } = await import("../drizzle/schema");
  
  await db.insert(companyAdminEmails).values({
    companyId: data.companyId,
    email: data.email.toLowerCase().trim(),
    createdBy: data.createdBy,
  });
}

export async function removeCompanyAdminEmail(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const { companyAdminEmails } = await import("../drizzle/schema");
  
  await db.delete(companyAdminEmails).where(eq(companyAdminEmails.id, id));
}

export async function getCompanyAdminEmails(companyId: number) {
  const db = await getDb();
  if (!db) return [];

  const { companyAdminEmails } = await import("../drizzle/schema");
  
  return await db
    .select()
    .from(companyAdminEmails)
    .where(eq(companyAdminEmails.companyId, companyId));
}

export async function findCompanyByAdminEmail(email: string) {
  const db = await getDb();
  if (!db) return null;

  const { companyAdminEmails, companies } = await import("../drizzle/schema");
  
  const result = await db
    .select({
      companyId: companyAdminEmails.companyId,
      companyCode: companies.code,
      companyName: companies.name,
    })
    .from(companyAdminEmails)
    .innerJoin(companies, eq(companyAdminEmails.companyId, companies.id))
    .where(eq(companyAdminEmails.email, email.toLowerCase().trim()))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}


export async function getAllUsers() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get users: database not available");
    return [];
  }

  const result = await db.select().from(users);
  return result;
}

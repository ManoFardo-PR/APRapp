import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

// Test insert
const result = await db.execute('SELECT 1');
console.log('Test query result:', result);

// Try insert into a test scenario
console.log('Result structure:', JSON.stringify(result, null, 2));

await connection.end();

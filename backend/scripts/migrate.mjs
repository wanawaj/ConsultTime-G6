import { readFile } from "node:fs/promises";
import { pool, ensureSchema, closePool } from "../db/postgres.mjs";

const migrations = ["otp-migration.sql", "rate-limit-migration.sql"];

try {
  // Create the original ConsultTime database schema.
  await ensureSchema();

  // Apply each additional migration transactionally.
  for (const filename of migrations) {
    const sql = await readFile(
      new URL(`../db/${filename}`, import.meta.url),
      "utf8",
    );

    const client = await pool.connect();

    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("COMMIT");

      console.log(`Migration successful: ${filename}`);
    } catch (error) {
      await client.query("ROLLBACK").catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }

  console.log("ConsultTime PostgreSQL schema is ready.");
} catch (error) {
  console.error("Database migration failed:", error.message);
  process.exitCode = 1;
} finally {
  await closePool();
}

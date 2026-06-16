import { execSync } from "child_process";
import { config } from "../config";

export async function waitForDatabase(): Promise<void> {
  for (let i = 0; i < config.dbPushMaxRetries; i++) {
    try {
      execSync("npx prisma db push --skip-generate", { stdio: "inherit" });
      return;
    } catch {
      console.log(`Waiting for database... (${i + 1}/${config.dbPushMaxRetries})`);
      await new Promise((r) => setTimeout(r, config.dbPushRetryDelayMs));
    }
  }

  throw new Error("Database not ready after maximum retries");
}

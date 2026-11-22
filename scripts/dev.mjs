import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const backend = spawn(process.execPath, ["backend/server.mjs"], {
  cwd: root,
  stdio: "inherit",
  shell: false,
});
const npm = process.platform === "win32" ? "npm.cmd" : "npm";
const frontend = spawn(npm, ["exec", "vite", "--", "--host", "0.0.0.0"], {
  cwd: root,
  stdio: "inherit",
  shell: process.platform === "win32",
});
let closing = false;
function shutdown(code = 0) {
  if (closing) return;
  closing = true;
  backend.kill();
  frontend.kill();
  process.exitCode = code;
}
process.on("SIGINT", () => shutdown());
process.on("SIGTERM", () => shutdown());
backend.on("exit", (code) => shutdown(code || 0));
frontend.on("exit", (code) => shutdown(code || 0));

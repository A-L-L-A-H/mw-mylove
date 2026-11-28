import { spawnSync } from "node:child_process";

const diff = spawnSync("git", ["diff", "--name-only", "--diff-filter=ACMR"], {
  encoding: "utf8",
});
if (diff.status !== 0) {
  process.exit(diff.status ?? 1);
}
const files = (diff.stdout ?? "")
  .split(/\r?\n/)
  .filter(Boolean)
  .filter((file) => /\.(ts|tsx|js|mjs)$/.test(file));
if (files.length === 0) {
  process.exit(0);
}
const result = spawnSync("bunx", ["eslint", ...files, "--max-warnings", "0"], {
  stdio: "inherit",
});
process.exit(result.status ?? 1);

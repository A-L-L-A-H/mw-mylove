import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";

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
const ticket = /MW-[0-9]+|#[A-Za-z0-9_-]+|disable-directive/;
for (const file of files) {
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  for (const [index, line] of lines.entries()) {
    if (line.includes("disable-directive") && !ticket.test(line)) {
      console.error(
        `${file}:${index + 1}: disable-directive requires a ticket token`,
      );
      process.exit(1);
    }
  }
}

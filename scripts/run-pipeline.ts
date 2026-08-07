import { spawnSync } from "node:child_process";

function run(script: string, env: Record<string, string> = {}) {
  console.log(`\n======== ${script} ========`);
  const result = spawnSync(
    "npx",
    ["tsx", `scripts/${script}`],
    {
      stdio: "inherit",
      env: { ...process.env, ...env },
    },
  );
  if (result.status !== 0) {
    throw new Error(`${script} failed with status ${result.status}`);
  }
}

async function main() {
  const mode = process.argv[2] || "full";

  if (mode === "import" || mode === "full") {
    run("import-rbfa.ts");
  }
  if (mode === "crawl" || mode === "full") {
    run("crawl-websites.ts");
  }
  if (mode === "scrape" || mode === "full") {
    run("scrape-social.ts");
  }
  if (mode === "analyze" || mode === "full") {
    run("analyze-posts.ts");
  }

  console.log("\nPipeline finished:", mode);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

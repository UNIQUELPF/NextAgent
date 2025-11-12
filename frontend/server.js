#!/usr/bin/env node
const { spawn } = require("node:child_process");
const path = require("node:path");

const isVercel = Boolean(process.env.VERCEL);
const port = process.env.PORT || "3000";
const host = process.env.HOST || process.env.HOSTNAME || "0.0.0.0";
const nextBinary = path.join(
  __dirname,
  "node_modules",
  "next",
  "dist",
  "bin",
  "next",
);

const args = ["start", "--hostname", host, "--port", String(port)];

if (isVercel) {
  console.log("[server] Vercel environment detected. Running `next start` directly.");
} else {
  console.log(`[server] Starting Next.js on ${host}:${port}`);
}

const child = spawn("node", [nextBinary, ...args], {
  env: process.env,
  stdio: "inherit",
});

child.on("close", (code) => {
  process.exit(code ?? 0);
});

child.on("error", (error) => {
  console.error("[server] Failed to start Next.js:", error);
  process.exit(1);
});

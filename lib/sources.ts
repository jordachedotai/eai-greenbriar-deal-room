// The only door evidence comes through. In mock mode it reads data/inbox and
// data/dropzone from disk. No network call exists in this file and none may be added
// for mock mode. Server-only: uses fs.
import fs from "node:fs";
import path from "node:path";
import type { Evidence, EvidenceMatch } from "./types";

export const MOCK_MODE = (process.env.MOCK_MODE ?? "true") !== "false";

const root = process.cwd();

function readDir(dir: string): Evidence[] {
  const full = path.join(root, "data", dir);
  if (!fs.existsSync(full)) return [];
  return fs
    .readdirSync(full)
    .filter((f) => f.endsWith(".json"))
    .map((f) => JSON.parse(fs.readFileSync(path.join(full, f), "utf8")) as Evidence);
}

export function loadEvidence(): Evidence[] {
  // Live mode would add connector readers here. Not in this build.
  const all = [...readDir("inbox"), ...readDir("dropzone")];
  return all.sort((a, b) => a.receivedAt.localeCompare(b.receivedAt));
}

export function loadMatches(): EvidenceMatch[] {
  const full = path.join(root, "data", "matches.json");
  if (!fs.existsSync(full)) return [];
  return JSON.parse(fs.readFileSync(full, "utf8")) as EvidenceMatch[];
}

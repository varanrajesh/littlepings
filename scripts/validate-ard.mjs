#!/usr/bin/env node
/**
 * Validates the ARD (Agentic Resource Discovery) manifests against the
 * official ArdManifest JSON Schema (Draft 2020-12) from ards-project/ard-spec.
 *
 * Checks:
 *   1. File is valid JSON (not HTML — the #1 cause of PageSpeed "malformed JSON").
 *   2. File conforms to the ArdManifest schema.
 *   3. Each entry satisfies the discovery constraints (§D.2): valid URN
 *      identifier, exactly one of url/data, representativeQueries 2–5.
 *
 * Run:  node scripts/validate-ard.mjs
 * Exits non-zero on any error (safe for CI).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');

// The manifests that MUST be valid ARD documents.
const MANIFESTS = [
  'public/.well-known/ard.json', // canonical ARD path (§5.1)
  'public/ai-catalog.json', // legacy predecessor path
];

// Official ArdManifest schema (embedded so CI has no network dependency).
const schemaPath = path.join(__dirname, 'ard-entry.schema.json');
const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf8'));

const ajv = new Ajv({ allErrors: true, strict: false });
addFormats(ajv);
const validateManifest = ajv.compile({ ...schema, $ref: '#/$defs/ArdManifest' });

const URN_RE = /^urn:air:[a-zA-Z0-9.-]+(:[a-zA-Z0-9._-]+)+$/;

let failed = false;

for (const rel of MANIFESTS) {
  const file = path.join(root, rel);
  console.log(`\n▶ ${rel}`);

  if (!fs.existsSync(file)) {
    console.error(`  ❌ file does not exist`);
    failed = true;
    continue;
  }

  const raw = fs.readFileSync(file, 'utf8');

  // Guard against the exact PageSpeed failure: HTML served instead of JSON.
  const trimmed = raw.trimStart();
  if (trimmed.startsWith('<')) {
    console.error(`  ❌ file starts with '<' — looks like HTML, not JSON`);
    failed = true;
    continue;
  }

  let doc;
  try {
    doc = JSON.parse(raw);
  } catch (err) {
    console.error(`  ❌ invalid JSON: ${err.message}`);
    failed = true;
    continue;
  }

  if (!validateManifest(doc)) {
    console.error(`  ❌ schema validation failed:`);
    for (const e of validateManifest.errors) {
      console.error(`     ${e.instancePath || '/'} ${e.message}`);
    }
    failed = true;
    continue;
  }

  // Discovery constraints (§D.2) — warnings vs errors.
  for (const [i, entry] of (doc.entries ?? []).entries()) {
    const at = `entries[${i}] (${entry.identifier ?? '?'})`;
    if (!URN_RE.test(entry.identifier ?? '')) {
      console.error(`  ❌ ${at}: identifier is not a valid urn:air URN`);
      failed = true;
    }
    const hasUrl = 'url' in entry;
    const hasData = 'data' in entry;
    if (hasUrl === hasData) {
      console.error(`  ❌ ${at}: must have exactly one of url/data`);
      failed = true;
    }
    const rq = entry.representativeQueries;
    if (!Array.isArray(rq) || rq.length < 2 || rq.length > 5) {
      console.warn(`  ⚠ ${at}: representativeQueries should have 2–5 items`);
    }
  }

  console.log(`  ✅ valid ARD manifest (${doc.entries?.length ?? 0} entr${doc.entries?.length === 1 ? 'y' : 'ies'})`);
}

if (failed) {
  console.error('\n✖ ARD validation FAILED\n');
  process.exit(1);
}
console.log('\n✔ All ARD manifests valid\n');

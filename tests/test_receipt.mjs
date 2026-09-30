import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";

/** Deterministic Scope-2 style receipt used by the Denali demo. */
export function sealReceipt(payload) {
  const canonical = JSON.stringify(payload, Object.keys(payload).sort());
  const digest = createHash("sha256").update(canonical, "utf8").digest("hex");
  return { canonical, digest, algorithm: "sha256" };
}

test("same payload seals to the same digest", () => {
  const a = sealReceipt({ site: "CAISO", mwh: 1.25, scope: 2 });
  const b = sealReceipt({ site: "CAISO", mwh: 1.25, scope: 2 });
  assert.equal(a.digest, b.digest);
  assert.equal(a.digest.length, 64);
});

test("payload mutation changes the digest", () => {
  const a = sealReceipt({ site: "CAISO", mwh: 1.25, scope: 2 });
  const b = sealReceipt({ site: "CAISO", mwh: 1.26, scope: 2 });
  assert.notEqual(a.digest, b.digest);
});

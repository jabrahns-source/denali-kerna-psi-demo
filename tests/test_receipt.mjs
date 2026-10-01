import test from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { sealReceipt } from "../lib/receipt.mjs";

test("same payload seals to the same digest", () => {
  const a = sealReceipt({ site: "CAISO", mwh: 1.25, scope: 2 });
  const b = sealReceipt({ site: "CAISO", mwh: 1.25, scope: 2 });
  assert.equal(a.digest, b.digest);
  assert.equal(a.digest.length, 64);
  assert.equal(a.algorithm, "sha256");
});

test("object key order does not change the digest", () => {
  const a = sealReceipt({ site: "CAISO", mwh: 1.25, scope: 2 });
  const b = sealReceipt({ scope: 2, mwh: 1.25, site: "CAISO" });
  assert.equal(a.canonical, b.canonical);
  assert.equal(a.digest, b.digest);
  assert.equal(
    a.canonical,
    '{"mwh":1.25,"scope":2,"site":"CAISO"}'
  );
});

test("nested objects are sorted recursively", () => {
  const sealed = sealReceipt({
    zone: "NP15",
    meta: { b: 1, a: 2 },
  });
  assert.equal(sealed.canonical, '{"meta":{"a":2,"b":1},"zone":"NP15"}');
});

test("payload mutation changes the digest", () => {
  const a = sealReceipt({ site: "CAISO", mwh: 1.25, scope: 2 });
  const b = sealReceipt({ site: "CAISO", mwh: 1.26, scope: 2 });
  assert.notEqual(a.digest, b.digest);
});

test("digest matches independent sha256 of the canonical form", () => {
  const sealed = sealReceipt({ site: "CAISO", mwh: 1.25, scope: 2 });
  const expected = createHash("sha256").update(sealed.canonical, "utf8").digest("hex");
  assert.equal(sealed.digest, expected);
});

test("non-finite numbers are rejected", () => {
  assert.throws(() => sealReceipt({ mwh: Number.NaN }), TypeError);
});

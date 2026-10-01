import { createHash } from "node:crypto";

/**
 * RFC 8785-style subset: sorted object keys, stable array order,
 * JSON number/string/bool/null encoding. No whitespace.
 * Rejects undefined and non-finite numbers so two callers cannot
 * drift into different digests.
 */
export function canonicalize(value) {
  if (value === undefined) {
    throw new TypeError("undefined is not representable in a receipt");
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new TypeError("non-finite numbers are not representable in a receipt");
    }
  }
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return "[" + value.map(canonicalize).join(",") + "]";
  }
  const keys = Object.keys(value).sort();
  return (
    "{" +
    keys.map((key) => JSON.stringify(key) + ":" + canonicalize(value[key])).join(",") +
    "}"
  );
}

export function sealReceipt(payload) {
  if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
    throw new TypeError("receipt payload must be a plain object");
  }
  const canonical = canonicalize(payload);
  const digest = createHash("sha256").update(canonical, "utf8").digest("hex");
  return { canonical, digest, algorithm: "sha256" };
}

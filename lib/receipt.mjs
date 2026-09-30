import { createHash } from "node:crypto";

export function sealReceipt(payload) {
  const canonical = JSON.stringify(payload, Object.keys(payload).sort());
  const digest = createHash("sha256").update(canonical, "utf8").digest("hex");
  return { canonical, digest, algorithm: "sha256" };
}

const FALLBACK = {
  source: "deterministic-demo-fallback",
  note: "OASIS live JSON is not a stable public contract. Demo uses a sealed sample.",
  market_run_id: "RTM",
  interval_start: "2024-06-01T00:00:00Z",
  nodes: [
    { pnode: "TH_NP15_GEN-APND", lmp_usd_mwh: 31.42 },
    { pnode: "TH_SP15_GEN-APND", lmp_usd_mwh: 28.17 },
    { pnode: "TH_ZP26_GEN-APND", lmp_usd_mwh: 29.88 },
  ],
};

export default async function handler(req, res) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2500);
  try {
    const response = await fetch(
      "https://oasis.caiso.com/oasisapi/timeseries?queryname=PRC_LMP&startdatetime=2024-06-01T00:00:00-00:00&enddatetime=2024-06-01T01:00:00-00:00&version=1&market_run_id=RTM",
      { signal: controller.signal }
    );
    clearTimeout(timer);
    if (!response.ok) {
      return res.status(200).json({ ...FALLBACK, live: false, status: response.status });
    }
    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("json")) {
      return res.status(200).json({ ...FALLBACK, live: false, reason: "non-json oasis body" });
    }
    const data = await response.json();
    return res.status(200).json({ live: true, data });
  } catch (err) {
    clearTimeout(timer);
    return res.status(200).json({
      ...FALLBACK,
      live: false,
      reason: String(err && err.name ? err.name : err),
    });
  }
}

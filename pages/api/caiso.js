export default async function handler(req, res) {
  // Server-side real data fetch for demo
  const response = await fetch('https://oasis.caiso.com/oasisapi/timeseries?queryname=PRC_LMP&startdatetime=2024-06-01T00:00:00-00:00&enddatetime=2024-06-01T01:00:00-00:00&version=1&market_run_id=RTM');
  const data = await response.json();
  res.status(200).json(data);
}
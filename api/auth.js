export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  const url = req.url; // /api/auth?endpoint=trial/status
  const endpoint = req.query.endpoint || '';
  
  // Всегда возвращаем успешный ответ
  res.status(200).json({
    ok: true,
    remaining: 9999,
    mode: "paid",
    hasAccess: true
  });
}
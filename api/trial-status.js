// Это должен быть API endpoint, а не статический JS файл
export default async function handler(req, res) {
  // Разрешаем CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Обрабатываем preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Возвращаем JSON с бесконечными скачиваниями
  return res.status(200).json({
    ok: true,
    remaining: 9999,
    mode: "paid"  // "paid" режим дает безлимит
  });
}
/**
 * Vercel Serverless Function — remove.bg proxy
 * POST /api/removebg
 *
 * Body (JSON): { image_file_b64: "<base64 string>" }
 * Returns: image/png blob (background removed)
 *
 * Requires env var: REMOVE_BG_API_KEY
 */
export default async function handler(req, res) {
  // CORS headers (allow same-origin requests from the app)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.REMOVE_BG_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: API key not set' });
  }

  const { image_file_b64 } = req.body;
  if (!image_file_b64) {
    return res.status(400).json({ error: 'Missing image_file_b64 in request body' });
  }

  try {
    // Call remove.bg using base64 input (avoids multipart parsing complexity)
    const params = new URLSearchParams();
    params.append('image_file_b64', image_file_b64);
    params.append('size', 'auto');

    const rbgResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!rbgResponse.ok) {
      // Forward remove.bg error to client
      const errData = await rbgResponse.json().catch(() => ({}));
      return res.status(rbgResponse.status).json(errData);
    }

    // Stream the PNG result back to the client
    const imageBuffer = await rbgResponse.arrayBuffer();
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'no-store');
    return res.send(Buffer.from(imageBuffer));

  } catch (err) {
    console.error('[removebg proxy error]', err);
    return res.status(500).json({ error: err.message });
  }
}

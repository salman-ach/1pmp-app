export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { imageBase64 } = req.body;
  if (!imageBase64) return res.status(400).json({ error: 'Image manquante' });

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: `Analyse cette image de nourriture et réponds UNIQUEMENT en JSON valide sans markdown, avec exactement ce format:
{"plat":"nom du plat","calories":nombre,"proteines":nombre,"glucides":nombre,"lipides":nombre}
Donne des valeurs numériques entières. Si ce n'est pas de la nourriture, mets toutes les valeurs à 0.`
              },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: imageBase64.replace(/^data:image\/\w+;base64,/, '')
                }
              }
            ]
          }]
        })
      }
    );

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '{}';
    const clean = text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);
    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erreur analyse IA' });
  }
}

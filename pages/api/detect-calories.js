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
                text: `Tu es un expert en nutrition. Analyse attentivement cette photo et identifie exactement ce que tu vois.
Sois très précis sur le nom du plat (ex: "Pain complet", "Msemen", "Poulet rôti", etc.)
Ne devine pas si l'image est floue — donne quand même ta meilleure estimation.
Réponds UNIQUEMENT en JSON valide sans markdown ni texte autour, avec ce format exact:
{"plat":"nom exact de l'aliment visible","calories":nombre,"proteines":nombre,"glucides":nombre,"lipides":nombre}
Valeurs numériques entières uniquement. Si ce n'est absolument pas de la nourriture, mets 0 partout.`
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

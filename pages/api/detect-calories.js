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
                text: `Tu es un expert en nutrition. Analyse attentivement cette photo et identifie exactement l'aliment ou le plat visible.
Sois précis sur le nom du plat (ex: "Dattes", "Pain complet", "Poulet rôti").
Tu dois STRICTEMENT retourner un objet JSON correspondant à ce schéma, sans aucun texte explicatif autour :
{"plat":"nom de l'aliment","calories":nombre,"proteines":nombre,"glucides":nombre,"lipides":nombre}
Si ce n'est pas de la nourriture ou que tu ne vois rien, utilise exactement ce JSON : {"plat":"Aliment inconnu","calories":0,"proteines":0,"glucides":0,"lipides":0}`
              },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: imageBase64.replace(/^data:image\/\w+;base64,/, '')
                }
              }
            ]
          }],
          // Force l'API Gemini à cracher uniquement du pur JSON
          generationConfig: {
            responseMimeType: "application/json"
          }
        })
      }
    );

    const data = await response.json();
    
    // Log pour debugger sur Vercel si besoin
    console.log("Réponse brute de l'API:", JSON.stringify(data));

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      return res.status(200).json({ plat: "Aliment inconnu", calories: 0, proteines: 0, glucides: 0, lipides: 0 });
    }

    // Le texte étant forcé en JSON par l'API, le parse est désormais ultra-sûr
    const result = JSON.parse(text.trim());
    return res.status(200).json(result);

  } catch (err) {
    console.error("Erreur complète détectée :", err);
    // En cas de crash, on renvoie une structure saine pour éviter le blocage de l'application
    return res.status(200).json({ 
      plat: "Aliment inconnu", 
      calories: 0, 
      proteines: 0, 
      glucides: 0, 
      lipides: 0 
    });
  }
}

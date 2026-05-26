export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { imageBase64 } = req.body;
  if (!imageBase64) return res.status(400).json({ error: 'Image manquante' });

  // 1. Vérification de sécurité locale de la clé API
  if (!process.env.GEMINI_API_KEY) {
    console.error("[ERREUR CRITIQUE] La variable d'environnement GEMINI_API_KEY est introuvable ou vide.");
    return res.status(500).json({ 
      error: "Clé API non configurée sur le serveur.",
      plat: "Aliment inconnu", 
      calories: 0, 
      proteines: 0, 
      glucides: 0, 
      lipides: 0 
    });
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: `Tu es un expert en nutrition. Analyse attentivement cette photo et identifie exactement l'aliment ou le plat visible.
Sois précis sur le nom du plat (ex: "Dattes", "Pain complet", "Poulet rôti").
Tu devez STRICTEMENT retourner un objet JSON correspondant à ce schéma, sans aucun texte explicatif autour :
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
          generationConfig: {
            responseMimeType: "application/json"
          }
        })
      }
    );

    const data = await response.json();

    // 2. Si Google retourne une erreur (Ex: Clé API invalide, quota dépassé...)
    if (data.error) {
      console.error("[ERREUR GOOGLE GEMINI] :", JSON.stringify(data.error));
      return res.status(200).json({ 
        plat: "Erreur Clé API / IA", 
        calories: 0, 
        proteines: 0, 
        glucides: 0, 
        lipides: 0 
      });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!text) {
      console.warn("[ATTENTION] Gemini n'a retourné aucun texte dans sa réponse.");
      return res.status(200).json({ plat: "Aliment inconnu", calories: 0, proteines: 0, glucides: 0, lipides: 0 });
    }

    const result = JSON.parse(text.trim());
    return res.status(200).json(result);

  } catch (err) {
    console.error("[CRASH SERVEUR / PARSING] :", err);
    return res.status(200).json({ 
      plat: "Aliment inconnu", 
      calories: 0, 
      proteines: 0, 
      glucides: 0, 
      lipides: 0 
    });
  }
}
export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  try {
    const { imageBase64 } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        error: 'Image manquante'
      });
    }

    // Vérification clé API
    console.log("API KEY =", process.env.GEMINI_API_KEY);

    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY introuvable");

      return res.status(500).json({
        plat: "Erreur Clé API / IA",
        calories: 0,
        proteines: 0,
        glucides: 0,
        lipides: 0
      });
    }

    // Correction de la ligne fetch ci-dessous (suppression du résidu de texte)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `
Tu es un expert en nutrition.

Analyse attentivement cette photo et identifie exactement l'aliment ou le plat visible.

Tu devez STRICTEMENT retourner uniquement un objet JSON valide, sans aucun texte explicatif ou formatage Markdown autour.

Format obligatoire :
{
  "plat":"nom aliment",
  "calories":0,
  "proteines":0,
  "glucides":0,
  "lipides":0
}

Si aucun aliment n'est visible ou si la photo n'est pas claire :
{
  "plat":"Aliment inconnu",
  "calories":0,
  "proteines":0,
  "glucides":0,
  "lipides":0
}
`
                },
                {
                  inline_data: {
                    mime_type: 'image/jpeg',
                    data: imageBase64.replace(/^data:image\/\w+;base64,/, '')
                  }
                }
              ]
            }
          ],
          generationConfig: {
            responseMimeType: "application/json"
          }
        })
      }
    );

    const data = await response.json();

    console.log("REPONSE GEMINI =", JSON.stringify(data));

    // Erreur Google Gemini
    if (data.error) {
      console.error("ERREUR GEMINI =", data.error);

      return res.status(200).json({
        plat: "Erreur Clé API / IA",
        calories: 0,
        proteines: 0,
        glucides: 0,
        lipides: 0
      });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      console.error("Aucun texte retourné");

      return res.status(200).json({
        plat: "Aliment inconnu",
        calories: 0,
        proteines: 0,
        glucides: 0,
        lipides: 0
      });
    }

    const result = JSON.parse(text);
    return res.status(200).json(result);

  } catch (err) {
    console.error("CRASH =", err);

    return res.status(200).json({
      plat: "Erreur serveur",
      calories: 0,
      proteines: 0,
      glucides: 0,
      lipides: 0
    });
  }
}
// pages/tracker.js
import { useState } from 'react';
import Head from 'next/head';
// On importe le scanner que tu as créé dans le dossier components
import CalorieScanner from '../components/CalorieScanner'; 
              ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
  // Un état (state) pour stocker la liste des repas scannés par l'utilisateur
  const [repasConsommes, setRepasConsommes] = useState([]);

  // Cette fonction est appelée dès que l'IA a fini d'analyser l'assiette
  const gererNouveauRepas = (nouveauRepas) => {
    // On ajoute le nouveau repas à notre liste existante
    setRepasConsommes((prevRepas) => [
      ...prevRepas,
      {
        id: Date.now(),
        plat: nouveauRepas.plat,
        calories: nouveauRepas.calories,
        </div>
      </div>
        proteines: nouveauRepas.proteines,
        glucides: nouveauRepas.glucides,
        lipides: nouveauRepas.lipides,
        heure: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  // Calcul du total des calories de la journée
  const totalCalories = repasConsommes.reduce((acc, repas) => acc + repas.calories, 0);

  return (
    <div style={{ backgroundColor: '#020617', minHeight: '100vh', color: '#f8fafc', padding: '40px 20px', fontFamily: 'sans-serif' }}>
      <Head>
        <title>IA Calorie Tracker</title>
      </Head>

      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <header style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '28px', color: '#10b981', margin: '0 0 8px 0' }}>Mon Tracker de Calories IA</h1>
          <p style={{ color: '#94a3b8', margin: '0' }}>Prends en photo tes assiettes pour remplir ton journal automatiquement</p>
        </header>

        {/* Section double colonne : Scanner à gauche, Liste des repas à droite */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start' }}>
          
          {/* Colonne 1 : Le scanner IA */}
          <div>
            <CalorieScanner onMealDetected={gererNouveauRepas} />
          </div>

          {/* Colonne 2 : Ton journal de la journée */}
          <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', padding: '24px', borderRadius: '16px' }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>📅 Repas d'aujourd'hui</span>
              <span style={{ fontSize: '14px', color: '#10b981', fontWeight: 'bold' }}>{totalCalories} kcal</span>
            </h3>

            {repasConsommes.length === 0 ? (
              <p style={{ color: '#64748b', fontSize: '14px', textAlign: 'center', margin: '40px 0' }}>
                Aucun repas scanné pour le moment. Utilisez le scanner à gauche !
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'col', gap: '12px' }}>
                {repasConsommes.map((repas) => (
                  <div key={repas.id} style={{ backgroundColor: '#020617', padding: '12px 16px', borderRadius: '12px', border: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ margin: '0', fontWeight: 'bold', fontSize: '14px' }}>{repas.plat}</p>
                      <span style={{ fontSize: '11px', color: '#64748b' }}>Scanné à {repas.heure}</span>
                    </div>
                    <span style={{ fontWeight: 'bold', color: '#10b981', fontSize: '16px' }}>+{repas.calories} kcal</span>
                  </div>
                ))}
              </div>
            )}
          </div>
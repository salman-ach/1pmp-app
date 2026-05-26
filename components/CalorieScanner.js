import { useState, useRef } from 'react';

export default function CalorieScanner({ onMealDetected }) {
  const [preview, setPreview]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [result,  setResult]    = useState(null);
  const [error,   setError]     = useState('');
  const inputRef = useRef();

  const handleImage = async (file) => {
    if (!file) return;
    setError(''); setResult(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target.result;
      setPreview(base64);
      setLoading(true);

      try {
        const res = await fetch('/api/detect-calories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ imageBase64: base64 })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setResult(data);
      } catch (err) {
        setError('Impossible d\'analyser l\'image. Réessayez.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const valider = () => {
    if (result) { onMealDetected(result); setResult(null); setPreview(null); }
  };

  return (
    <div style={{ backgroundColor: '#0f172a', border: '1px solid #334155', padding: '24px', borderRadius: '16px' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '18px', color: '#f8fafc' }}>
        📸 Scanner un repas
      </h3>

      {/* Zone upload */}
      <div
        onClick={() => inputRef.current.click()}
        style={{
          border: '2px dashed #334155', borderRadius: '12px',
          padding: '24px', textAlign: 'center', cursor: 'pointer',
          backgroundColor: '#020617', marginBottom: '16px',
          transition: 'border-color .2s'
        }}
      >
        {preview ? (
          <img src={preview} alt="repas" style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '8px', objectFit: 'cover' }} />
        ) : (
          <>
            <div style={{ fontSize: '40px', marginBottom: '8px' }}>🍽️</div>
            <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
              Cliquez pour prendre une photo ou importer une image
            </p>
          </>
        )}
      </div>

      <input
        ref={inputRef} type="file" accept="image/*" capture="environment"
        style={{ display: 'none' }}
        onChange={e => handleImage(e.target.files[0])}
      />

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: 'center', padding: '16px', color: '#10b981' }}>
          <div style={{ fontSize: '24px', marginBottom: '8px' }}>🤖</div>
          <p style={{ margin: 0, fontSize: '14px' }}>Gemini analyse votre repas...</p>
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div style={{ backgroundColor: '#450a0a', border: '1px solid #991b1b', borderRadius: '8px', padding: '12px', color: '#fca5a5', fontSize: '13px', marginBottom: '12px' }}>
          {error}
        </div>
      )}

      {/* Résultat */}
      {result && (
        <div style={{ backgroundColor: '#052e16', border: '1px solid #166534', borderRadius: '12px', padding: '16px', marginBottom: '12px' }}>
          <p style={{ margin: '0 0 12px 0', fontWeight: 'bold', color: '#4ade80', fontSize: '16px' }}>
            {result.plat}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
            {[
              { label: '🔥 Calories', val: `${result.calories} kcal` },
              { label: '💪 Protéines', val: `${result.proteines}g` },
              { label: '🌾 Glucides', val: `${result.glucides}g` },
              { label: '🥑 Lipides', val: `${result.lipides}g` },
            ].map(({ label, val }) => (
              <div key={label} style={{ backgroundColor: '#020617', borderRadius: '8px', padding: '8px 12px' }}>
                <div style={{ fontSize: '11px', color: '#64748b' }}>{label}</div>
                <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#f8fafc' }}>{val}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={valider}
              style={{ flex: 1, backgroundColor: '#10b981', color: '#fff', border: 'none', borderRadius: '8px', padding: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '14px' }}>
              ✅ Valider
            </button>
            <button onClick={() => { setResult(null); setPreview(null); }}
              style={{ flex: 1, backgroundColor: 'transparent', color: '#64748b', border: '1px solid #334155', borderRadius: '8px', padding: '10px', cursor: 'pointer', fontSize: '14px' }}>
              🔄 Réessayer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
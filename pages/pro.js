import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import ProtectedLayout from '../components/ProtectedLayout'
import { useAuth } from '../context/AuthContext'
import { Crown, Zap, TrendingUp, BarChart3, Download, ArrowRight, Check } from 'lucide-react'

const S = { bg: '#0a1209', bg2: '#0d1f0e', card: '#0f1a10', border: 'rgba(74,222,128,0.12)', acc: '#4ade80', text: '#f0fdf4', muted: '#4a6b4a', blue: '#60a5fa' }

const FeatureCard = ({ icon: Icon, title, desc }) => (
  <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 16, padding: 20, display: 'flex', gap: 12 }}>
    <div style={{ background: S.acc + '30', padding: 12, borderRadius: 10, flexShrink: 0 }}><Icon size={20} color={S.acc} /></div>
    <div><p style={{ color: S.text, fontSize: 15, fontWeight: 600, margin: '0 0 4px' }}>{title}</p><p style={{ color: S.muted, fontSize: 13, margin: 0 }}>{desc}</p></div>
  </div>
)

export default function ProPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [isPro, setIsPro] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/create-checkout-session', { method: 'POST' })
      const data = await res.json()
      if (data?.url) window.location.href = data.url
      else alert(data?.error || 'Erreur paiement.')
    } catch (err) {
      console.error('Erreur:', err)
      alert('Impossible de démarrer le paiement.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedLayout>
      <div style={{ background: S.bg, minHeight: '100vh', color: S.text, paddingBottom: 120 }}>
        <div style={{ background: `linear-gradient(135deg, ${S.bg2} 0%, ${S.card} 100%)`, borderBottom: `1px solid ${S.border}`, padding: '40px 24px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <Crown size={32} color={S.acc} />
              <h1 style={{ fontSize: 40, fontWeight: 800, margin: 0 }}>FoodTracker Pro</h1>
            </div>
            <p style={{ fontSize: 18, color: S.muted, margin: 0 }}>Débloquez toutes les fonctionnalités avancées pour votre suivi nutrition</p>
          </div>
        </div>

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 40, alignItems: 'start', marginBottom: 60 }}>
            {/* Pricing */}
            <div style={{ background: `linear-gradient(135deg, ${S.acc}10 0%, ${S.acc}05 100%)`, border: `2px solid ${S.acc}40`, borderRadius: 24, padding: 40, textAlign: 'center' }}>
              <p style={{ fontSize: 48, fontWeight: 800, margin: '0 0 8px', color: S.acc }}>59.99 dh</p>
              <p style={{ color: S.muted, fontSize: 14, margin: '0 0 24px' }}>par mois (facturé mensuellement)</p>
              <button
                onClick={handleCheckout}
                disabled={loading}
                style={{
                  width: '100%', background: S.acc, color: S.bg, border: 'none', borderRadius: 14,
                  padding: '14px 24px', fontSize: 16, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
                }}
              >
                {loading ? 'Redirection...' : <><Crown size={20} /> Activer Pro</> }
              </button>
            </div>

            {/* Avantages */}
            <div>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: S.text, margin: '0 0 24px' }}>Inclus dans Pro :</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <FeatureCard icon={BarChart3} title="Micronutriments détaillés" desc="Sucre, fibres, sodium, fer, vitamines" />
                <FeatureCard icon={Zap} title="Net Carb (Keto)" desc="Suivi des glucides nets pour régimes Keto" />
                <FeatureCard icon={TrendingUp} title="Objectifs personnalisés" desc="Par jour selon vos entraînements" />
                <FeatureCard icon={Download} title="Exporter rapports" desc="PDF et CSV de votre historique complet" />
              </div>
            </div>
          </div>

          {/* Recommandations IA */}
          <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 20, padding: 32, marginBottom: 40 }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: S.text, margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
              🤖 Analyses IA avancées (Pro)
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
              {[
                { title: 'Tendances nutritionnelles', desc: 'L\'IA détecte vos habitudes et vous propose des optimisations.' },
                { title: 'Recommandations repas', desc: 'Suggestions personnalisées basées sur vos objectifs.' },
                { title: 'Alertes intelligentes', desc: 'Notifié avant de dépasser vos limites.' },
                { title: 'Rapports hebdo', desc: 'Récapitulatifs et analyses détaillées.' }
              ].map((item, i) => (
                <div key={i} style={{ background: S.bg2, borderRadius: 12, padding: 16 }}>
                  <p style={{ color: S.acc, fontSize: 14, fontWeight: 700, margin: '0 0 4px' }}>{item.title}</p>
                  <p style={{ color: S.muted, fontSize: 13, margin: 0 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Comparaison */}
          <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 20, padding: 32, overflowX: 'auto' }}>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: S.text, margin: '0 0 24px' }}>Comparaison des plans</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${S.border}` }}>
                  <th style={{ textAlign: 'left', padding: 12, color: S.muted, fontWeight: 600, fontSize: 13 }}>Fonctionnalité</th>
                  <th style={{ textAlign: 'center', padding: 12, color: S.text, fontWeight: 600 }}>Gratuit</th>
                  <th style={{ textAlign: 'center', padding: 12, color: S.acc, fontWeight: 600, background: S.acc + '10' }}>Pro</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: 'Scanner IA', free: true, pro: true },
                  { feature: 'Calor ies & macros', free: true, pro: true },
                  { feature: 'Historique illimité', free: false, pro: true },
                  { feature: 'Micronutriments', free: false, pro: true },
                  { feature: 'Objectifs personnalisés', free: false, pro: true },
                  { feature: 'Recommandations IA', free: false, pro: true },
                  { feature: 'Rapports PDF/CSV', free: false, pro: true }
                ].map((row, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${S.border}` }}>
                    <td style={{ padding: 12, color: S.text, fontSize: 14 }}>{row.feature}</td>
                    <td style={{ textAlign: 'center', padding: 12 }}>{row.free ? <Check size={20} color={S.acc} /> : '—'}</td>
                    <td style={{ textAlign: 'center', padding: 12, background: S.acc + '05' }}><Check size={20} color={S.acc} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}

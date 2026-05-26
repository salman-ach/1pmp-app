import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import ProtectedLayout from '../components/ProtectedLayout'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/firebaseClient'
import { Settings, Bell, Lock, Moon, LogOut, ArrowLeft, Save, AlertCircle } from 'lucide-react'

const S = { bg: '#0a1209', bg2: '#0d1f0e', card: '#0f1a10', border: 'rgba(74,222,128,0.12)', acc: '#4ade80', text: '#f0fdf4', muted: '#4a6b4a', blue: '#60a5fa', red: '#ef4444' }

const SettingSection = ({ icon: Icon, title, description, children }) => (
  <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 20, padding: 24, marginBottom: 20 }}>
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
      <div style={{ background: S.acc + '30', padding: 12, borderRadius: 12, flexShrink: 0 }}><Icon size={24} color={S.acc} /></div>
      <div>
        <h3 style={{ color: S.text, fontSize: 18, fontWeight: 700, margin: '0 0 4px' }}>{title}</h3>
        <p style={{ color: S.muted, fontSize: 13, margin: 0 }}>{description}</p>
      </div>
    </div>
    {children}
  </div>
)

const ToggleSwitch = ({ enabled, onChange }) => (
  <button
    onClick={() => onChange(!enabled)}
    style={{
      width: 56,
      height: 28,
      background: enabled ? S.acc : '#374151',
      border: 'none',
      borderRadius: 14,
      cursor: 'pointer',
      position: 'relative',
      transition: 'all 0.3s'
    }}
  >
    <div style={{
      position: 'absolute',
      top: 2,
      left: enabled ? 30 : 2,
      width: 24,
      height: 24,
      background: S.text,
      borderRadius: 12,
      transition: 'left 0.3s'
    }} />
  </button>
)

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [dailyGoal, setDailyGoal] = useState(2000)
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const savedTheme = window.localStorage.getItem('theme')
    setDarkMode(savedTheme === 'dark')
    const savedEmailAlerts = window.localStorage.getItem('emailAlerts')
    setEmailAlerts(savedEmailAlerts === 'true')
  }, [user])

  const saveSettings = async () => {
    setLoading(true)
    setSuccess('')
    setError('')

    try {
      window.localStorage.setItem('emailAlerts', emailAlerts.toString())
      window.localStorage.setItem('dailyGoal', dailyGoal.toString())

      if (user) {
        await supabase.auth.updateUser({ data: { email_alerts: emailAlerts, daily_goal: dailyGoal } })
      }

      setSuccess('Paramètres enregistrés avec succès !')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Erreur sauvegarde:', err)
      setError('Impossible de sauvegarder les paramètres.')
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
  }

  return (
    <ProtectedLayout>
      <div style={{ background: S.bg, minHeight: '100vh', color: S.text, paddingBottom: 120 }}>
        <div style={{ background: `linear-gradient(135deg, ${S.bg2} 0%, ${S.card} 100%)`, borderBottom: `1px solid ${S.border}`, padding: '32px 24px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Settings size={32} color={S.acc} />
              <div><p style={{ fontSize: 12, color: S.muted, textTransform: 'uppercase', letterSpacing: '.15em', margin: '0 0 4px' }}>Paramètres</p><h1 style={{ fontSize: 32, fontWeight: 800, margin: 0 }}>Votre compte</h1></div>
            </div>
            <button onClick={() => router.push('/dashboard')} style={{ background: S.card, border: `1px solid ${S.border}`, color: S.acc, padding: '10px 18px', borderRadius: 10, cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}><ArrowLeft size={14} /> Retour</button>
          </div>
        </div>

        <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
          {success && <div style={{ background: S.acc + '20', border: `1px solid ${S.acc}40`, borderRadius: 12, padding: 12, marginBottom: 20, display: 'flex', gap: 8, alignItems: 'center' }}><div style={{ width: 16, height: 16, background: S.acc, borderRadius: 50 }} /><p style={{ color: S.acc, fontSize: 13, margin: 0 }}>{success}</p></div>}
          {error && <div style={{ background: S.red + '20', border: `1px solid ${S.red}40`, borderRadius: 12, padding: 12, marginBottom: 20, display: 'flex', gap: 8, alignItems: 'center' }}><AlertCircle size={16} color={S.red} /><p style={{ color: S.red, fontSize: 13, margin: 0 }}>{error}</p></div>}

          {/* Profil */}
          <SettingSection icon={Lock} title="Profil" description="Informations de votre compte">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div><p style={{ color: S.muted, fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', margin: '0 0 6px' }}>Email</p><p style={{ color: S.text, fontSize: 15, fontWeight: 600, margin: 0 }}>{user?.email || 'Non disponible'}</p></div>
              <div><p style={{ color: S.muted, fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', margin: '0 0 6px' }}>Nom</p><p style={{ color: S.text, fontSize: 15, fontWeight: 600, margin: 0 }}>{user?.user_metadata?.full_name || 'Non renseigné'}</p></div>
            </div>
          </SettingSection>

          {/* Nutrition */}
          <SettingSection icon={Settings} title="Objectif nutritionnel" description="Configurez votre suivi quotidien">
            <div>
              <label style={{ color: S.muted, fontSize: 12, textTransform: 'uppercase', letterSpacing: '.1em', display: 'block', marginBottom: 8 }}>Objectif calorique quotidien</label>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <input
                  type="number"
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(parseInt(e.target.value))}
                  style={{ flex: 1, background: S.bg, border: `1px solid ${S.border}`, color: S.text, padding: '10px 14px', borderRadius: 10, fontSize: 15 }}
                />
                <p style={{ color: S.muted, fontSize: 13, margin: 0, minWidth: 40 }}>kcal</p>
              </div>
            </div>
          </SettingSection>

          {/* Notifications */}
          <SettingSection icon={Bell} title="Notifications" description="Gérez vos alertes et rappels">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0' }}>
              <div>
                <p style={{ color: S.text, fontSize: 15, fontWeight: 600, margin: '0 0 4px' }}>Alertes email nutritionnelles</p>
                <p style={{ color: S.muted, fontSize: 13, margin: 0 }}>Recevez des rappels et recommandations.</p>
              </div>
              <ToggleSwitch enabled={emailAlerts} onChange={setEmailAlerts} />
            </div>
          </SettingSection>

          {/* Thème */}
          <SettingSection icon={Moon} title="Apparence" description="Mode sombre activé pour le confort">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 0' }}>
              <div>
                <p style={{ color: S.text, fontSize: 15, fontWeight: 600, margin: '0 0 4px' }}>Mode sombre</p>
                <p style={{ color: S.muted, fontSize: 13, margin: 0 }}>Interface optimisée pour les yeux.</p>
              </div>
              <ToggleSwitch enabled={darkMode} onChange={setDarkMode} />
            </div>
          </SettingSection>

          {/* Sauvegarde */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            <button
              onClick={saveSettings}
              disabled={loading}
              style={{
                flex: 1, background: S.acc, color: S.bg, border: 'none', borderRadius: 12,
                padding: '14px 24px', fontSize: 15, fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, opacity: loading ? 0.6 : 1
              }}
            >
              <Save size={18} /> {loading ? 'Enregistrement...' : 'Sauvegarder les paramètres'}
            </button>
          </div>

          {/* Déconnexion */}
          <SettingSection icon={LogOut} title="Déconnexion" description="Terminer votre session">
            <button
              onClick={handleLogout}
              style={{
                width: '100%', background: S.red, color: S.text, border: 'none', borderRadius: 12,
                padding: '12px 20px', fontSize: 15, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8
              }}
            >
              <LogOut size={18} /> Se déconnecter
            </button>
          </SettingSection>
        </div>
      </div>
    </ProtectedLayout>
  )
}

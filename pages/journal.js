// pages/journal.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import ProtectedLayout from '../components/ProtectedLayout'
import { useAuth } from '../context/AuthContext'
import { db } from '../lib/firebaseClient'
import { collection, query, orderBy, limit, getDocs, where, deleteDoc, doc } from 'firebase/firestore'
import { ArrowLeft, Trash2, ChevronDown, Filter } from 'lucide-react'

const S = {
  bg: '#0a1209', bg2: '#0d1f0e', card: '#0f1a10',
  border: 'rgba(74,222,128,0.12)', acc: '#4ade80',
  accDark: '#22c55e', text: '#f0fdf4', muted: '#4a6b4a',
  blue: '#60a5fa', amber: '#fbbf24', red: '#f87171',
}

const FILTERS = ['Tout', 'Aujourd\'hui', 'Cette semaine', 'Ce mois']

const MacroBadge = ({ value, unit, color }) => (
  <div style={{ textAlign: 'center', background: `${color}12`, borderRadius: 10, padding: '6px 10px', border: `1px solid ${color}20` }}>
    <p style={{ color, fontSize: 14, fontWeight: 700, margin: 0, lineHeight: 1 }}>{value}<span style={{ fontSize: 9 }}>{unit}</span></p>
  </div>
)

const ProgressBar = ({ value, max, color }) => (
  <div style={{ height: 4, background: `${color}20`, borderRadius: 4, overflow: 'hidden', marginTop: 6 }}>
    <div style={{ height: '100%', width: `${Math.min(100, (value / max) * 100)}%`, background: color, borderRadius: 4, transition: 'width .5s ease' }} />
  </div>
)

export default function JournalPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [scans, setScans] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('Tout')
  const [showFilter, setShowFilter] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [dailyGoal] = useState(2000)

  const fetchScans = async () => {
    if (!db || !user?.uid) return
    setLoading(true)
    try {
      const q = query(
        collection(db, 'scans'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(50)
      )
      const snap = await getDocs(q)
      setScans(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }

  useEffect(() => { if (user) fetchScans() }, [user])

  const filterScans = () => {
    const now = new Date()
    return scans.filter(item => {
      if (!item.createdAt) return filter === 'Tout'
      const d = item.createdAt.toDate ? item.createdAt.toDate() : new Date(item.createdAt)
      if (filter === 'Aujourd\'hui') return d.toDateString() === now.toDateString()
      if (filter === 'Cette semaine') {
        const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7)
        return d >= weekAgo
      }
      if (filter === 'Ce mois') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      return true
    })
  }

  const deleteScan = async (id) => {
    setDeleting(id)
    try { await deleteDoc(doc(db, 'scans', id)); setScans(s => s.filter(i => i.id !== id)) }
    catch (e) { console.error(e) }
    finally { setDeleting(null) }
  }

  const filtered = filterScans()
  const totalKcal = filtered.reduce((s, i) => s + (i.calories || 0), 0)
  const totalProt = filtered.reduce((s, i) => s + (i.proteins || 0), 0)
  const avgKcal   = filtered.length ? Math.round(totalKcal / filtered.length) : 0

  // Grouper par date
  const grouped = filtered.reduce((acc, item) => {
    const d = item.createdAt?.toDate ? item.createdAt.toDate() : new Date(item.createdAt || Date.now())
    const key = d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {})

  return (
    <ProtectedLayout>
      <div style={{ minHeight: '100vh', background: S.bg, color: S.text, fontFamily: 'var(--font-sans, sans-serif)', paddingBottom: 80 }}>

        {/* Header */}
        <header style={{ padding: '20px 20px 0', display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <button onClick={() => router.push('/dashboard')}
            style={{ width: 38, height: 38, borderRadius: '50%', background: S.card, border: `1px solid ${S.border}`, color: S.text, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            <ArrowLeft size={18} />
          </button>
          <div style={{ flex: 1 }}>
            <h1 style={{ color: S.text, fontSize: 20, fontWeight: 700, margin: 0 }}>Journal</h1>
            <p style={{ color: S.muted, fontSize: 12, margin: 0 }}>Historique de vos repas</p>
          </div>
          <button onClick={() => setShowFilter(!showFilter)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: S.card, border: `1px solid ${S.border}`, borderRadius: 12, padding: '8px 12px', color: S.text, fontSize: 12, cursor: 'pointer' }}>
            <Filter size={14} color={S.acc} /> {filter} <ChevronDown size={12} color={S.muted} />
          </button>
        </header>

        {/* Dropdown filtre */}
        {showFilter && (
          <div style={{ margin: '0 20px 16px', background: S.card, border: `1px solid ${S.border}`, borderRadius: 14, overflow: 'hidden' }}>
            {FILTERS.map(f => (
              <button key={f} onClick={() => { setFilter(f); setShowFilter(false) }}
                style={{ width: '100%', padding: '12px 16px', background: filter === f ? `${S.acc}15` : 'transparent', border: 'none', color: filter === f ? S.acc : S.text, fontSize: 13, textAlign: 'left', cursor: 'pointer', borderBottom: `1px solid ${S.border}`, fontWeight: filter === f ? 600 : 400 }}>
                {f}
              </button>
            ))}
          </div>
        )}

        <div style={{ padding: '0 20px' }}>

          {/* Stats résumé */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 20 }}>
            {[
              { label: 'Repas', value: filtered.length, color: S.acc },
              { label: 'Total kcal', value: totalKcal, color: S.amber },
              { label: 'Protéines', value: `${totalProt}g`, color: S.blue },
            ].map(({ label, value, color }) => (
              <div key={label} style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 16, padding: '14px 12px', textAlign: 'center' }}>
                <p style={{ color, fontSize: 20, fontWeight: 700, margin: '0 0 4px', lineHeight: 1 }}>{value}</p>
                <p style={{ color: S.muted, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.08em', margin: 0 }}>{label}</p>
              </div>
            ))}
          </div>

          {/* Barre progression journalière */}
          {filter === 'Aujourd\'hui' && (
            <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 16, padding: 16, marginBottom: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: S.text, fontSize: 13, fontWeight: 500 }}>Objectif journalier</span>
                <span style={{ color: S.acc, fontSize: 13, fontWeight: 600 }}>{totalKcal} / {dailyGoal} kcal</span>
              </div>
              <ProgressBar value={totalKcal} max={dailyGoal} color={S.acc} />
              <p style={{ color: S.muted, fontSize: 11, margin: '8px 0 0' }}>
                {Math.max(0, dailyGoal - totalKcal)} kcal restantes aujourd'hui
              </p>
            </div>
          )}

          {/* Liste groupée par date */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', border: `3px solid ${S.acc}`, borderTopColor: 'transparent', animation: 'spin 1s linear infinite', margin: '0 auto 12px' }} />
              <p style={{ color: S.muted, fontSize: 13 }}>Chargement...</p>
            </div>
          ) : Object.keys(grouped).length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px' }}>
              <p style={{ fontSize: 40, margin: '0 0 12px' }}>🍽️</p>
              <p style={{ color: S.text, fontSize: 16, fontWeight: 600, margin: '0 0 6px' }}>Aucun repas trouvé</p>
              <p style={{ color: S.muted, fontSize: 13, margin: 0 }}>Scannez votre premier repas pour commencer</p>
            </div>
          ) : (
            Object.entries(grouped).map(([date, items]) => {
              const dayKcal = items.reduce((s, i) => s + (i.calories || 0), 0)
              return (
                <div key={date} style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <p style={{ color: S.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', margin: 0, fontWeight: 600 }}>
                      {date.charAt(0).toUpperCase() + date.slice(1)}
                    </p>
                    <span style={{ color: S.acc, fontSize: 11, fontWeight: 600 }}>{dayKcal} kcal</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {items.map(item => (
                      <div key={item.id} style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 18, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px' }}>
                          <div style={{ width: 42, height: 42, borderRadius: 12, background: S.bg2, border: `1px solid ${S.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                            🍽️
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <p style={{ color: S.text, fontSize: 14, fontWeight: 600, margin: '0 0 3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.foodName}</p>
                            <p style={{ color: S.muted, fontSize: 11, margin: 0 }}>
                              {item.createdAt
                                ? new Date(item.createdAt.toDate ? item.createdAt.toDate() : item.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
                                : ''}
                            </p>
                          </div>
                          <div style={{ textAlign: 'right', flexShrink: 0 }}>
                            <p style={{ color: S.acc, fontSize: 16, fontWeight: 700, margin: '0 0 2px' }}>{item.calories}</p>
                            <p style={{ color: S.muted, fontSize: 10, margin: 0 }}>kcal</p>
                          </div>
                          <button onClick={() => deleteScan(item.id)} disabled={deleting === item.id}
                            style={{ width: 32, height: 32, borderRadius: 10, background: 'transparent', border: `1px solid ${S.border}`, color: deleting === item.id ? S.muted : S.red, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                        {/* Macros */}
                        {(item.proteins || item.glucides || item.lipides) && (
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, padding: '0 14px 14px' }}>
                            <MacroBadge value={item.proteins || 0} unit="g prot" color={S.blue} />
                            <MacroBadge value={item.glucides || 0} unit="g gluc" color={S.amber} />
                            <MacroBadge value={item.lipides  || 0} unit="g lip"  color={S.red} />
                          </div>
                        )}
                        <ProgressBar value={item.calories} max={dailyGoal} color={S.acc} />
                      </div>
                    ))}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Nav */}
        <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(10,18,9,0.95)', borderTop: `1px solid ${S.border}`, padding: '10px 30px 20px', display: 'flex', justifyContent: 'space-around', backdropFilter: 'blur(20px)', zIndex: 50 }}>
          {[
            { label: 'Accueil', icon: '🏠', route: '/dashboard' },
            { label: 'Journal', icon: '📊', route: '/journal', active: true },
            { label: 'Pro',     icon: '👑', route: '/subscribe' },
          ].map(({ label, icon, route, active }) => (
            <button key={label} onClick={() => router.push(route)}
              style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', padding: '4px 12px' }}>
              <span style={{ fontSize: 20 }}>{icon}</span>
              <span style={{ fontSize: 10, color: active ? S.acc : S.muted, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 500 }}>{label}</span>
            </button>
          ))}
        </nav>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    </ProtectedLayout>
  )
}
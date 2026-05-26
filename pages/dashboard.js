// pages/dashboard.js
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import ProtectedLayout from '../components/ProtectedLayout'
import { useAuth } from '../context/AuthContext'
import { db } from '../lib/firebaseClient'
import { collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp, where } from 'firebase/firestore'
import { Camera, ArrowLeft, Send, History, Crown, ChevronRight, Zap } from 'lucide-react'

// ─── Couleurs et styles globaux ───────────────────────────────────────────────
const S = {
  bg:        '#0a1209',
  bg2:       '#0d1f0e',
  bg3:       '#071626',
  card:      '#0f1a10',
  border:    'rgba(74,222,128,0.12)',
  acc:       '#4ade80',
  accDark:   '#22c55e',
  accSoft:   'rgba(74,222,128,0.1)',
  text:      '#f0fdf4',
  muted:     '#4a6b4a',
  blue:      '#60a5fa',
}

// ─── Sous-composants ──────────────────────────────────────────────────────────
const Pill = ({ children, color = S.acc }) => (
  <span style={{
    background: `${color}18`, color, border: `1px solid ${color}30`,
    borderRadius: 20, fontSize: 10, padding: '3px 10px', fontWeight: 500,
    letterSpacing: '.06em', textTransform: 'uppercase'
  }}>{children}</span>
)

const StatCard = ({ label, value, unit = '' }) => (
  <div style={{
    background: S.card, border: `1px solid ${S.border}`,
    borderRadius: 16, padding: '14px 16px', flex: 1
  }}>
    <p style={{ color: S.muted, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.1em', margin: '0 0 6px' }}>{label}</p>
    <p style={{ color: S.text, fontSize: 22, fontWeight: 600, margin: 0, lineHeight: 1 }}>
      {value}<span style={{ fontSize: 12, color: S.muted, marginLeft: 3 }}>{unit}</span>
    </p>
  </div>
)

const RingProgress = ({ pct }) => {
  const r = 28, circ = 2 * Math.PI * r
  const dash = (pct / 100) * circ
  return (
    <div style={{ position: 'relative', width: 72, height: 72 }}>
      <svg width="72" height="72" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="36" cy="36" r={r} fill="none" stroke={`${S.acc}18`} strokeWidth="5" />
        <circle cx="36" cy="36" r={r} fill="none" stroke={S.acc} strokeWidth="5"
          strokeLinecap="round" strokeDasharray={`${dash} ${circ}`}
          style={{ transition: 'stroke-dasharray .7s ease' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span style={{ color: S.acc, fontSize: 14, fontWeight: 600, lineHeight: 1 }}>{pct}%</span>
        <span style={{ color: S.muted, fontSize: 9, marginTop: 2 }}>objectif</span>
      </div>
    </div>
  )
}

// ─── Page principale ──────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const [activeTab,      setActiveTab]      = useState('home')
  const [isScanning,     setIsScanning]     = useState(false)
  const [scanResult,     setScanResult]     = useState(null)
  const [scanHistory,    setScanHistory]    = useState([])
  const [stats,          setStats]          = useState({ total: 0, avgKcal: 0 })
  const [dailyGoal]                         = useState(2000)
  const [todayCalories,  setTodayCalories]  = useState(0)
  const [cameraError,    setCameraError]    = useState('')
  const [statusMessage,  setStatusMessage]  = useState('')
  const [videoStream,    setVideoStream]    = useState(null)
  const [capturing,      setCapturing]      = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [photo,          setPhoto]          = useState(null)

  const fileInputRef = useRef(null)
  const videoRef     = useRef(null)
  const streamRef    = useRef(null)

  // ── Initiales utilisateur ────────────────────────────────────────────────
  const initials = user?.displayName
    ? user.displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? '?'

  // ── Chargement historique Firebase ──────────────────────────────────────
  const fetchHistory = async () => {
    if (!db || !user?.uid) return
    setLoadingHistory(true)
    try {
      const q = query(
        collection(db, 'scans'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc'),
        limit(10)
      )
      const snap = await getDocs(q)
      const history = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      setScanHistory(history)

      const total = history.length
      const avgKcal = total === 0 ? 0 : Math.round(history.reduce((s, i) => s + (i.calories || 0), 0) / total)
      setStats({ total, avgKcal })

      const today = new Date()
      const todayKcal = history
        .filter(i => {
          if (!i.createdAt) return true
          const d = i.createdAt.toDate ? i.createdAt.toDate() : new Date(i.createdAt)
          return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate()
        })
        .reduce((s, i) => s + (i.calories || 0), 0)
      setTodayCalories(todayKcal)
    } catch (e) {
      console.error('Firestore:', e)
    } finally {
      setLoadingHistory(false)
    }
  }

  // ── Sauvegarde scan ──────────────────────────────────────────────────────
  const saveScan = async (result) => {
    if (!db || !user?.uid) return
    try {
      await addDoc(collection(db, 'scans'), {
        userId:    user.uid,
        foodName:  result.name,
        calories:  result.kcal,
        proteins:  result.prot,
        glucides:  result.gluc,
        lipides:   result.lip,
        createdAt: serverTimestamp(),
      })
      await fetchHistory()
    } catch (e) {
      console.error('Sauvegarde:', e)
    }
  }

  // ── Caméra ───────────────────────────────────────────────────────────────
  const openCamera = async () => {
    setCameraError('')
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        streamRef.current = stream
        setVideoStream(stream)
        setActiveTab('camera')
      } catch {
        fileInputRef.current?.click()
      }
    } else {
      fileInputRef.current?.click()
    }
  }

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setVideoStream(null)
  }

  const capturePhoto = async () => {
    if (!videoRef.current) { fileInputRef.current?.click(); return }
    setCapturing(true)
    try {
      const video = videoRef.current
      const canvas = document.createElement('canvas')
      canvas.width  = video.videoWidth  || 640
      canvas.height = video.videoHeight || 480
      canvas.getContext('2d').drawImage(video, 0, 0)
      const imageData = canvas.toDataURL('image/jpeg', 0.9)
      if (imageData.length > 1000) {
        setPhoto(imageData)
        stopCamera()
        setActiveTab('scanning')
        await handleScan(imageData)
      } else {
        fileInputRef.current?.click()
      }
    } catch {
      fileInputRef.current?.click()
    } finally {
      setCapturing(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      const imageData = reader.result
      setPhoto(imageData)
      stopCamera()
      setActiveTab('scanning')
      await handleScan(imageData)
    }
    reader.readAsDataURL(file)
  }

  // ── Analyse Gemini ───────────────────────────────────────────────────────
  const handleScan = async (imageData) => {
    setIsScanning(true)
    setCameraError('')
    try {
      const res  = await fetch('/api/detect-calories', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ imageBase64: imageData })
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      const result = {
        name:  data.plat       || 'Aliment inconnu',
        kcal:  data.calories   || 0,
        prot:  data.proteines  || 0,
        gluc:  data.glucides   || 0,
        lip:   data.lipides    || 0,
        image: imageData
      }
      setScanResult(result)
      setActiveTab('result')
    } catch (err) {
      setCameraError("Impossible d'analyser l'image. Réessayez.")
      setActiveTab('home')
      console.error(err)
    } finally {
      setIsScanning(false)
    }
  }

  const confirmResult = async () => {
    if (!scanResult) return
    await saveScan(scanResult)
    setScanResult(null)
    setPhoto(null)
    setStatusMessage('✓ Repas enregistré dans votre journal !')
    setActiveTab('home')
    setTimeout(() => setStatusMessage(''), 3000)
  }

  const resetScanner = () => {
    stopCamera()
    setScanResult(null)
    setPhoto(null)
    setCameraError('')
    setActiveTab('home')
  }

  // ── Effects ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (activeTab === 'camera' && videoStream && videoRef.current) {
      videoRef.current.srcObject = videoStream
      videoRef.current.play().catch(console.warn)
    }
  }, [activeTab, videoStream])

  useEffect(() => {
    if (user) fetchHistory()
  }, [user])

  // ── Calculs ──────────────────────────────────────────────────────────────
  const pct = Math.min(100, Math.round((todayCalories / dailyGoal) * 100))
  const remaining = Math.max(0, dailyGoal - todayCalories)
  const todayScans = scanHistory.filter(i => {
    if (!i.createdAt) return false
    const d = i.createdAt.toDate ? i.createdAt.toDate() : new Date(i.createdAt)
    const t = new Date()
    return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate()
  })

  // ════════════════════════════════════════════════════════════════════════
  // RENDER
  // ════════════════════════════════════════════════════════════════════════
  return (
    <ProtectedLayout>
      <div style={{ minHeight: '100vh', background: S.bg, color: S.text, fontFamily: 'var(--font-sans, sans-serif)', paddingBottom: 80 }}>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        {activeTab !== 'result' && activeTab !== 'camera' && activeTab !== 'scanning' && (
          <header style={{ padding: '20px 20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: S.muted, fontSize: 12, margin: '0 0 2px' }}>Bonjour 👋</p>
              <h1 style={{ color: S.text, fontSize: 20, fontWeight: 600, margin: 0 }}>
                {user?.displayName || user?.email?.split('@')[0] || 'Utilisateur'}
              </h1>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button
                onClick={() => router.push('/subscribe')}
                style={{ background: `${S.acc}15`, border: `1px solid ${S.acc}30`, borderRadius: 10, padding: '6px 10px', color: S.acc, fontSize: 11, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                <Crown size={13} /> Pro
              </button>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: `${S.acc}20`, border: `1.5px solid ${S.acc}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: S.acc, fontSize: 13, fontWeight: 600 }}>
                {initials}
              </div>
            </div>
          </header>
        )}

        {/* ── Notification ───────────────────────────────────────────────── */}
        {statusMessage && (
          <div style={{ margin: '12px 20px 0', background: `${S.acc}15`, border: `1px solid ${S.acc}30`, borderRadius: 12, padding: '10px 14px', color: S.acc, fontSize: 13, fontWeight: 500 }}>
            {statusMessage}
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            VUE 1 : ACCUEIL
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'home' && (
          <div style={{ padding: '20px 20px 0' }}>

            {/* Bilan journalier */}
            <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 20, padding: 18, display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <RingProgress pct={pct} />
              <div style={{ flex: 1 }}>
                <p style={{ color: S.text, fontSize: 14, fontWeight: 600, margin: '0 0 8px' }}>Bilan du jour</p>
                {[
                  { l: 'Calories',  v: `${todayCalories} / ${dailyGoal} kcal` },
                  { l: 'Restantes', v: `${remaining} kcal` },
                  { l: 'Repas',     v: `${todayScans.length} scanné${todayScans.length > 1 ? 's' : ''}` },
                ].map(({ l, v }) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ color: S.muted, fontSize: 11 }}>{l}</span>
                    <span style={{ color: '#a3d9a3', fontSize: 11, fontWeight: 500 }}>{v}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
              <StatCard label="Scans totaux"   value={stats.total} />
              <StatCard label="Moy. calories"  value={stats.avgKcal} unit="kcal" />
            </div>

            {/* Bouton Scanner */}
            <button
              onClick={openCamera}
              style={{ width: '100%', background: S.acc, border: 'none', borderRadius: 18, padding: '17px 0', color: S.bg, fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 20, transition: 'background .2s' }}
              onMouseEnter={e => e.currentTarget.style.background = S.accDark}
              onMouseLeave={e => e.currentTarget.style.background = S.acc}
            >
              <Camera size={20} />
              Scanner mon repas
            </button>

            <input ref={fileInputRef} type="file" accept="image/*" capture="environment" style={{ display: 'none' }} onChange={handleFileChange} />

            {cameraError && (
              <div style={{ background: '#450a0a', border: '1px solid #991b1b', borderRadius: 10, padding: '10px 14px', color: '#fca5a5', fontSize: 13, marginBottom: 16 }}>
                {cameraError}
              </div>
            )}

            {/* Historique du jour */}
            <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 20, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <p style={{ color: S.text, fontSize: 14, fontWeight: 600, margin: 0 }}>Repas d'aujourd'hui</p>
                <button onClick={() => router.push('/journal')} style={{ background: 'none', border: 'none', color: S.acc, fontSize: 11, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}>
                  Tout voir <ChevronRight size={12} />
                </button>
              </div>

              {loadingHistory ? (
                <p style={{ color: S.muted, fontSize: 13, textAlign: 'center', padding: '20px 0' }}>Chargement...</p>
              ) : todayScans.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <p style={{ color: S.muted, fontSize: 13, margin: 0 }}>Aucun repas scanné aujourd'hui</p>
                  <p style={{ color: `${S.muted}80`, fontSize: 11, margin: '4px 0 0' }}>Appuyez sur Scanner pour commencer</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {todayScans.map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: 12, background: S.bg2, borderRadius: 14, padding: '12px 14px', border: `1px solid ${S.border}` }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${S.acc}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <History size={16} color={S.acc} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ color: S.text, fontSize: 13, fontWeight: 500, margin: '0 0 2px' }}>{item.foodName}</p>
                        <p style={{ color: S.muted, fontSize: 10, margin: 0 }}>
                          {item.createdAt
                            ? new Date(item.createdAt.toDate ? item.createdAt.toDate() : item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                            : 'Maintenant'}
                        </p>
                      </div>
                      <span style={{ color: S.acc, fontSize: 14, fontWeight: 700 }}>+{item.calories}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            VUE 2 : CAMÉRA
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'camera' && (
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'relative', height: '100vh', background: '#000', overflow: 'hidden' }}>
              <video
                ref={videoRef}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                playsInline muted autoPlay
              />
              {/* Overlay */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, transparent 40%, transparent 60%, rgba(0,0,0,0.8) 100%)' }} />

              {/* Viseur */}
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -60%)', width: 220, height: 220 }}>
                {['top-left','top-right','bottom-left','bottom-right'].map(pos => {
                  const isTop = pos.includes('top'), isLeft = pos.includes('left')
                  return (
                    <div key={pos} style={{
                      position: 'absolute',
                      [isTop ? 'top' : 'bottom']: 0,
                      [isLeft ? 'left' : 'right']: 0,
                      width: 28, height: 28,
                      borderTop:    isTop  ? `2.5px solid ${S.acc}` : 'none',
                      borderBottom: !isTop ? `2.5px solid ${S.acc}` : 'none',
                      borderLeft:   isLeft  ? `2.5px solid ${S.acc}` : 'none',
                      borderRight:  !isLeft ? `2.5px solid ${S.acc}` : 'none',
                      borderRadius: isTop && isLeft ? '4px 0 0 0' : isTop ? '0 4px 0 0' : isLeft ? '0 0 0 4px' : '0 0 4px 0'
                    }} />
                  )
                })}
              </div>

              {/* Bouton retour */}
              <button onClick={() => { stopCamera(); setActiveTab('home') }}
                style={{ position: 'absolute', top: 20, left: 20, width: 40, height: 40, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <ArrowLeft size={20} />
              </button>

              {/* Contrôles bas */}
              <div style={{ position: 'absolute', bottom: 50, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: 0 }}>Centrez votre repas</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                  <button onClick={() => fileInputRef.current?.click()}
                    style={{ width: 48, height: 48, background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 20 }}>
                    🖼️
                  </button>
                  {/* Bouton capture principal */}
                  <button onClick={capturePhoto} disabled={capturing}
                    style={{ width: 72, height: 72, background: capturing ? 'rgba(74,222,128,0.5)' : S.acc, border: '4px solid rgba(255,255,255,0.3)', borderRadius: '50%', cursor: capturing ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .2s' }}>
                    {capturing
                      ? <svg style={{ width: 24, height: 24, animation: 'spin 1s linear infinite' }} fill="none" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke={S.bg} strokeWidth="4" opacity=".25"/><path fill={S.bg} opacity=".75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      : <Camera size={28} color={S.bg} />
                    }
                  </button>
                  <div style={{ width: 48 }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            VUE 3 : ANALYSE EN COURS
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'scanning' && (
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
            {photo && (
              <div style={{ width: '100%', maxWidth: 340, height: 240, borderRadius: 20, overflow: 'hidden', marginBottom: 32, position: 'relative' }}>
                <img src={photo} alt="repas" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,18,9,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: `${S.acc}20`, border: `2px solid ${S.acc}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                      <Zap size={24} color={S.acc} />
                    </div>
                    <p style={{ color: S.acc, fontSize: 14, fontWeight: 600, margin: '0 0 4px' }}>Gemini IA analyse...</p>
                    <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, margin: 0 }}>Identification du repas en cours</p>
                  </div>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: 6 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: S.acc, opacity: 0.4, animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
            <style>{`@keyframes pulse { 0%,100%{opacity:.3} 50%{opacity:1} } @keyframes spin { to{transform:rotate(360deg)} }`}</style>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            VUE 4 : RÉSULTAT
        ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'result' && scanResult && (
          <div style={{ minHeight: '100vh', background: S.bg }}>

            {/* Image */}
            <div style={{ position: 'relative', height: 260, background: '#000', overflow: 'hidden' }}>
              <img src={scanResult.image} alt="repas" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: .85 }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, transparent 50%, rgba(10,18,9,1) 100%)' }} />
              <button onClick={resetScanner}
                style={{ position: 'absolute', top: 20, left: 20, width: 40, height: 40, background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <ArrowLeft size={20} />
              </button>
              <div style={{ position: 'absolute', top: 20, right: 20 }}>
                <Pill color={S.acc}>✨ IA réussie</Pill>
              </div>
            </div>

            <div style={{ padding: '0 20px 20px' }}>
              {/* Nom du repas */}
              <div style={{ textAlign: 'center', padding: '20px 0 24px' }}>
                <h2 style={{ color: S.text, fontSize: 24, fontWeight: 700, margin: '0 0 6px' }}>{scanResult.name}</h2>
                <p style={{ color: S.muted, fontSize: 13, margin: 0 }}>Analyse nutritionnelle par Gemini</p>
              </div>

              {/* Calories + Protéines */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div style={{ background: S.card, border: `1px solid ${S.acc}30`, borderRadius: 20, padding: '20px 16px', textAlign: 'center' }}>
                  <p style={{ fontSize: 32, color: S.acc, fontWeight: 800, margin: '0 0 4px', lineHeight: 1 }}>{scanResult.kcal}</p>
                  <p style={{ color: S.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', margin: 0 }}>kcal</p>
                  <div style={{ margin: '10px 0 4px', height: 4, background: `${S.acc}20`, borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, (scanResult.kcal / dailyGoal) * 100)}%`, background: S.acc, borderRadius: 4 }} />
                  </div>
                  <p style={{ color: `${S.muted}90`, fontSize: 9, margin: 0 }}>{Math.round((scanResult.kcal / dailyGoal) * 100)}% de l'objectif</p>
                </div>
                <div style={{ background: S.card, border: `1px solid ${S.blue}30`, borderRadius: 20, padding: '20px 16px', textAlign: 'center' }}>
                  <p style={{ fontSize: 32, color: S.blue, fontWeight: 800, margin: '0 0 4px', lineHeight: 1 }}>{scanResult.prot}</p>
                  <p style={{ color: S.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', margin: 0 }}>protéines (g)</p>
                  <div style={{ margin: '10px 0 4px', height: 4, background: `${S.blue}20`, borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${Math.min(100, (scanResult.prot / 120) * 100)}%`, background: S.blue, borderRadius: 4 }} />
                  </div>
                  <p style={{ color: `${S.muted}90`, fontSize: 9, margin: 0 }}>sur 120g recommandés</p>
                </div>
              </div>

              {/* Glucides + Lipides */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 28 }}>
                {[
                  { label: 'Glucides', value: scanResult.gluc, unit: 'g', color: '#f59e0b' },
                  { label: 'Lipides',  value: scanResult.lip,  unit: 'g', color: '#f87171' },
                  { label: 'Total',    value: `+${scanResult.kcal}`, unit: 'kcal', color: S.acc },
                ].map(({ label, value, unit, color }) => (
                  <div key={label} style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 14, padding: '12px 10px', textAlign: 'center' }}>
                    <p style={{ color, fontSize: 16, fontWeight: 700, margin: '0 0 2px', lineHeight: 1 }}>{value}<span style={{ fontSize: 9 }}>{unit}</span></p>
                    <p style={{ color: S.muted, fontSize: 10, margin: 0 }}>{label}</p>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button onClick={confirmResult}
                  style={{ width: '100%', background: S.acc, border: 'none', borderRadius: 16, padding: '16px 0', color: S.bg, fontSize: 15, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <Send size={18} /> Valider ce repas
                </button>
                <button onClick={resetScanner}
                  style={{ width: '100%', background: 'transparent', border: `1px solid ${S.border}`, borderRadius: 16, padding: '14px 0', color: S.text, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
                  Scanner un autre plat
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Barre de navigation basse ────────────────────────────────── */}
        {activeTab !== 'camera' && activeTab !== 'scanning' && (
          <nav style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(10,18,9,0.95)', borderTop: `1px solid ${S.border}`, padding: '10px 30px 20px', display: 'flex', justifyContent: 'space-around', alignItems: 'center', backdropFilter: 'blur(20px)', zIndex: 50 }}>
            {[
              { id: 'home',    icon: '🏠', label: 'Accueil' },
              { id: 'journal', icon: '📊', label: 'Journal',  route: '/journal' },
              { id: 'sub',     icon: '👑', label: 'Pro',      route: '/subscribe' },
            ].map(({ id, icon, label, route }) => (
              <button key={id}
                onClick={() => route ? router.push(route) : setActiveTab(id)}
                style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, cursor: 'pointer', padding: '4px 12px', borderRadius: 10 }}>
                <span style={{ fontSize: 20 }}>{icon}</span>
                <span style={{ fontSize: 10, color: activeTab === id ? S.acc : S.muted, textTransform: 'uppercase', letterSpacing: '.08em', fontWeight: 500 }}>{label}</span>
              </button>
            ))}
          </nav>
        )}

      </div>
    </ProtectedLayout>
  )
}
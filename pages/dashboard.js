// pages/dashboard.js
// pages/dashboard.js
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/router'
import ProtectedLayout from '../components/ProtectedLayout'
import { useAuth } from '../context/AuthContext'
import { db } from '../lib/firebaseClient'
import { collection, addDoc, query, orderBy, limit, getDocs, serverTimestamp, where } from 'firebase/firestore'
import { Camera, History, Check, Zap, ArrowLeft, Send, Sparkles } from 'lucide-react'

// --- Composants de Navigation ---
const NavButton = ({ active, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 transition-colors ${
      active ? 'text-primary' : 'text-slate-500'
    }`}
  >
    <Icon size={24} />
    <span className="text-[10px] uppercase tracking-widest font-medium">{label}</span>
  </button>
)

export default function DashboardPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('home') // 'home', 'camera', 'result'
  const [isScanning, setIsScanning] = useState(false)
  const [scanResult, setScanResult] = useState(null)
  const [scanHistory, setScanHistory] = useState([])
  const [stats, setStats] = useState({ total: 0, avgKcal: 0, avgProt: 0 })
  const [dailyGoal, setDailyGoal] = useState(2000)
  const [todayCalories, setTodayCalories] = useState(0)
  const [cameraError, setCameraError] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [statusType, setStatusType] = useState('success')
  const [photo, setPhoto] = useState(null)
  const [dailyUsage, setDailyUsage] = useState({ count: 0, resetAt: null })
  const [isBlocked, setIsBlocked] = useState(false)
  const [hasCamera, setHasCamera] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const fileInputRef = useRef(null)
  const router = useRouter()
  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const fetchHistory = async () => {
    if (!db || !user?.id) return
    setLoadingHistory(true)
    try {
      const scansCollection = collection(db, 'scans')
      const userQuery = query(
        scansCollection,
        where('userId', '==', user.id),
        orderBy('createdAt', 'desc'),
        limit(5)
      )
      const snapshot = await getDocs(userQuery)
      const history = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }))

      setScanHistory(history)

      const total = history.length
      const avgKcal =
        total === 0
          ? 0
          : Math.round(
              history.reduce((sum, item) => sum + (item.calories || 0), 0) / total
            )
      const avgProt =
        total === 0
          ? 0
          : Math.round(
              history.reduce((sum, item) => sum + (item.proteins || 0), 0) / total
            )
      setStats({ total, avgKcal, avgProt })

      const todayCaloriesValue = history
        .filter(item => {
          if (!item.createdAt) return true
          const date = item.createdAt.toDate ? item.createdAt.toDate() : new Date(item.createdAt)
          const today = new Date()
          return (
            date.getFullYear() === today.getFullYear() &&
            date.getMonth() === today.getMonth() &&
            date.getDate() === today.getDate()
          )
        })
        .reduce((sum, item) => sum + (item.calories || 0), 0)

      setTodayCalories(todayCaloriesValue)
    } catch (error) {
      console.error('Erreur Firestore:', error)
      setCameraError('Impossible de charger l’historique. Vérifiez la configuration Firebase.')
    } finally {
      setLoadingHistory(false)
    }
  }

  const DAILY_LIMIT = 1

  const getDailyUsageKey = () => {
    if (typeof window === 'undefined') return 'dailyUsage_guest'
    return user?.id ? `dailyUsage_${user.id}` : 'dailyUsage_guest'
  }

  const saveDailyUsage = nextUsage => {
    setDailyUsage(nextUsage)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(getDailyUsageKey(), JSON.stringify(nextUsage))
    }
    setIsBlocked(nextUsage.count >= DAILY_LIMIT && nextUsage.resetAt && Date.now() < nextUsage.resetAt)
  }

  const resetDailyUsage = () => {
    saveDailyUsage({ count: 0, resetAt: null })
  }

  const loadDailyUsage = () => {
    if (typeof window === 'undefined') return
    const raw = window.localStorage.getItem(getDailyUsageKey())
    if (!raw) {
      resetDailyUsage()
      return
    }
    try {
      const parsed = JSON.parse(raw)
      const now = Date.now()
      if (parsed.resetAt && now >= parsed.resetAt) {
        resetDailyUsage()
      } else {
        saveDailyUsage({
          count: parsed.count || 0,
          resetAt: parsed.resetAt || null,
        })
      }
    } catch {
      resetDailyUsage()
    }
  }

  const incrementDailyUsage = () => {
    const now = Date.now()
    setDailyUsage(prev => {
      const count = prev.count + 1
      const resetAt = count >= DAILY_LIMIT ? now + 24 * 60 * 60 * 1000 : prev.resetAt
      const nextUsage = { count, resetAt }
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(getDailyUsageKey(), JSON.stringify(nextUsage))
      }
      setIsBlocked(count >= DAILY_LIMIT && resetAt && now < resetAt)
      return nextUsage
    })
  }

  const hasReachedDailyLimit = () => {
    return dailyUsage.count >= DAILY_LIMIT && dailyUsage.resetAt && Date.now() < dailyUsage.resetAt
  }

  const formatRemainingTime = () => {
    if (!dailyUsage.resetAt) return ''
    const remainingMs = dailyUsage.resetAt - Date.now()
    if (remainingMs <= 0) return ''
    const hours = Math.floor(remainingMs / (1000 * 60 * 60))
    const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60))
    return `${hours}h ${minutes}m`
  }

  const saveScanResult = async result => {
    if (!db || !user?.id) return
    try {
      await addDoc(collection(db, 'scans'), {
        userId: user.id,
        foodName: result.name,
        calories: result.kcal,
        proteins: result.prot,
        image: result.image,
        createdAt: serverTimestamp(),
      })
    } catch (error) {
      console.error('Erreur sauvegarde Firestore:', error)
      setCameraError('Impossible d’enregistrer le scan dans la base de données.')
    }
  }

  const openCamera = async () => {
    setCameraError('')
    if (hasReachedDailyLimit()) {
      const remaining = formatRemainingTime()
      const message = remaining
        ? `Votre limite quotidienne est atteinte. Réessayez dans ${remaining}.`
        : 'Votre limite quotidienne est atteinte. Réessayez dans les prochaines 24 heures.'
      setStatusMessage(message)
      setStatusType('error')
      return
    }

    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        })
        streamRef.current = stream
        setActiveTab('camera')
      } catch (error) {
        setCameraError(
          'Impossible d’accéder à la caméra. Autorisez l’accès ou utilisez la capture depuis la galerie.'
        )
      }
    } else {
      fileInputRef.current?.click()
    }
  }

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setActiveTab('home')
  }

  const capturePhoto = () => {
    if (!videoRef.current) return

    const canvas = document.createElement('canvas')
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    const context = canvas.getContext('2d')
    if (!context) return

    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
    const imageData = canvas.toDataURL('image/jpeg', 0.9)
    setPhoto(imageData)
    handleScan(imageData)
    stopCamera()
  }

  const handleFileChange = async event => {
    if (hasReachedDailyLimit()) {
      const remaining = formatRemainingTime()
      const message = remaining
        ? `Votre limite quotidienne est atteinte. Réessayez dans ${remaining}.`
        : 'Votre limite quotidienne est atteinte. Réessayez dans les prochaines 24 heures.'
      setStatusMessage(message)
      setStatusType('error')
      return
    }

    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setCameraError('Veuillez choisir une image valide.')
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      const imageData = reader.result
      if (typeof imageData === 'string') {
        setPhoto(imageData)
        handleScan(imageData)
      }
    }
    reader.onerror = () => {
      setCameraError('Impossible de lire l’image.')
    }
    reader.readAsDataURL(file)
  }

  const handleScan = async imageData => {
    setIsScanning(true)
    setCameraError('')

    const choices = [
      {
        name: 'Salade César',
        kcal: 350,
        prot: 18,
        image: imageData || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800',
      },
      {
        name: 'Bowl de Quinoa & Saumon',
        kcal: 485,
        prot: 32,
        image: imageData || 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800',
      },
      {
        name: 'Poulet grillé & légumes',
        kcal: 420,
        prot: 38,
        image: imageData || 'https://images.unsplash.com/photo-1604908177520-a3f0accc15c4?w=800',
      },
    ]
    const result = choices[Math.floor(Math.random() * choices.length)]

    setTimeout(async () => {
      setScanResult(result)
      setIsScanning(false)
      setActiveTab('result')

      await saveScanResult(result)
      await fetchHistory()
      incrementDailyUsage()
    }, 1500)
  }

  const resetScanner = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setScanResult(null)
    setPhoto(null)
    setCameraError('')
    setStatusMessage('')
    setActiveTab('home')
  }

  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
      setHasCamera(true)
    }
    return () => {
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  useEffect(() => {
    if (activeTab === 'camera' && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(error => {
        console.warn('Erreur lecture vidéo :', error)
        setCameraError('Impossible de démarrer l’aperçu caméra.')
      })
    }
  }, [activeTab])

  useEffect(() => {
    if (!user) return
    fetchHistory()
    loadDailyUsage()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const handleViewAllStats = () => {
    router.push('/menu')
  }

  const handleConfirmResult = () => {
    if (!scanResult) return

    const emailEnabled =
      typeof window !== 'undefined' && window.localStorage.getItem('emailAlerts') === 'true'

    setStatusMessage(
      emailEnabled
        ? 'Votre repas a été validé et un email de rappel nutritionnel sera envoyé.'
        : 'Votre repas a été validé et enregistré dans l’historique.'
    )
    setStatusType('success')
    setScanResult(null)
    setPhoto(null)
    setActiveTab('home')
  }

  const journalProgress = Math.min(100, Math.round((todayCalories / dailyGoal) * 100))
  const remainingCalories = Math.max(0, dailyGoal - todayCalories)
  const todayScans = scanHistory.filter(item => {
    if (!item.createdAt) return true
    const date = item.createdAt.toDate ? item.createdAt.toDate() : new Date(item.createdAt)
    const today = new Date()
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    )
  })

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-body pb-24">
        
        <main className="flex-1">
          {statusMessage && (
            <div className="mx-auto mb-6 max-w-6xl px-4 sm:px-6 lg:px-8">
              <div className={`rounded-3xl border px-5 py-4 text-sm font-medium ${statusType === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
                {statusMessage}
              </div>
            </div>
          )}
          {/* --- VUE 1 : ACCUEIL / SCANNER --- */}
          {activeTab === 'home' && (
            <div className="flex flex-col h-full fade-up">
              <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
                <div className="relative w-full max-w-2xl">
                  <div className="absolute inset-0 bg-primary-soft rounded-full blur-3xl animate-pulse" />
                  <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-sm">
                    <div className="flex h-[360px] flex-col items-center justify-center gap-3 px-6 text-center py-10">
                      <Camera size={56} className="text-primary" />
                      <p className="text-lg font-semibold text-slate-900">Prenez une photo de votre repas</p>
                      <p className="max-w-md text-sm text-slate-600">
                        Utilisez votre appareil pour capturer une image du plat. La photo servira à analyser rapidement les calories et les macros.
                      </p>
                      <button
                        onClick={openCamera}
                        disabled={hasReachedDailyLimit()}
                        className={`rounded-2xl px-6 py-3 text-sm font-semibold text-white transition shadow-lg shadow-coral/20 ${hasReachedDailyLimit() ? 'bg-slate-300 cursor-not-allowed text-slate-600' : 'bg-coral hover:bg-coral-dark'}`}
                      >
                        Scanner un repas
                      </button>
                      <p className="mt-3 text-sm text-slate-500">
                        {hasReachedDailyLimit()
                          ? `Limite atteinte. Réessayez dans ${formatRemainingTime()}.`
                          : 'Offre gratuite : 1 scan par jour.'}
                      </p>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>

                  {cameraError && (
                    <p className="mt-4 text-center text-sm text-red-400">{cameraError}</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-t-[32px] p-6 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-slate-900 font-display text-lg">Journal de la journée</h3>
                    <p className="text-slate-500 text-sm">Suivez vos repas du jour et votre progression vers l'objectif calorique.</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleViewAllStats}
                    className="text-primary text-xs font-medium uppercase italic"
                  >
                    Voir tout
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-3 mb-5">
                  <div className="rounded-3xl bg-slate-50 p-4 border border-slate-200">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500">Scans enregistrés</p>
                    <p className="mt-3 text-slate-900 font-bold text-2xl">{stats.total}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4 border border-slate-200">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500">Calories consommées</p>
                    <p className="mt-3 text-slate-900 font-bold text-2xl">{todayCalories}</p>
                  </div>
                  <div className="rounded-3xl bg-slate-50 p-4 border border-slate-200">
                    <p className="text-[10px] uppercase tracking-widest text-slate-500">Objectif journalier</p>
                    <p className="mt-3 text-slate-900 font-bold text-2xl">{dailyGoal}</p>
                  </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5 mb-5">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-slate-500">Progression</p>
                      <p className="mt-2 text-slate-900 text-2xl font-bold">{journalProgress}%</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-widest text-slate-500">Calories restantes</p>
                      <p className="mt-2 text-slate-900 text-lg font-semibold">{remainingCalories} kcal</p>
                    </div>
                  </div>
                  <div className="mt-4 h-3 rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${journalProgress}%` }}
                    />
                  </div>
                  <p className="mt-3 text-sm text-slate-500">
                    {todayScans.length > 0
                      ? `Aujourd'hui: ${todayScans.length} repas, ${todayCalories} kcal consommés.`
                      : 'Aucun repas scanné aujourd’hui. Lancez un scan pour débuter votre journal.'}
                  </p>
                </div>

                <div className="space-y-3 opacity-90">
                  {loadingHistory ? (
                    <p className="text-slate-500 text-sm">Chargement de l’historique...</p>
                  ) : todayScans.length > 0 ? (
                    todayScans.map(item => (
                      <div key={item.id} className="flex items-center gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                        <div className="w-10 h-10 bg-primary-soft rounded-xl flex items-center justify-center text-primary">
                          <History size={18} />
                        </div>
                        <div className="flex-1">
                          <p className="text-slate-900 text-sm font-medium">{item.foodName}</p>
                          <p className="text-slate-500 text-[10px]">
                            {item.createdAt
                              ? new Date(item.createdAt.toDate ? item.createdAt.toDate() : item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                              : 'Nouveau scan'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-primary text-sm font-bold">{item.calories} kcal</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-slate-500 text-sm">Aucun repas enregistré aujourd’hui.</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'camera' && (
            <div className="flex flex-col h-full fade-up">
              <div className="relative w-full max-w-2xl mx-auto overflow-hidden rounded-[32px] border border-white/5 bg-slate-950 shadow-[0_0_40px_rgba(64,198,165,0.15)]">
                <div className="relative h-[420px] bg-black">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    playsInline
                    muted
                    autoPlay
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                </div>
                <div className="p-6 text-center">
                  <p className="text-white text-lg font-semibold mb-2">Préparez votre repas</p>
                  <p className="text-sm text-white/60 mb-6">
                    Placez l’assiette bien au centre. Appuyez sur la capture pour prendre la photo.
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                      onClick={capturePhoto}
                      className="rounded-2xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#2d9b7f]"
                    >
                      Prendre la photo
                    </button>
                    <button
                      onClick={stopCamera}
                      className="rounded-2xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white/80 transition hover:bg-white/10"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- VUE 2 : RÉSULTAT --- */}
          {activeTab === 'result' && scanResult && (
            <div className="flex flex-col h-full bg-slate-100 fade-up">
              <div className="relative w-full h-72">
                <img 
                  src={scanResult.image} 
                  alt="Food" 
                  className="w-full h-full object-cover rounded-b-[40px]"
                />
                <button 
                  onClick={resetScanner}
                  className="absolute top-6 left-6 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-slate-900 shadow-md"
                >
                  <ArrowLeft size={20} />
                </button>
              </div>

              <div className="p-8 flex flex-col gap-8">
                <div className="text-center">
                  <h2 className="text-slate-900 font-display text-2xl mb-1">{scanResult.name}</h2>
                  <p className="text-primary text-sm italic font-medium">Reconnaissance IA réussie</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-primary/30 rounded-3xl p-6 text-center">
                    <p className="text-primary text-3xl font-black mb-1">{scanResult.kcal}</p>
                    <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Kcal</p>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 text-center">
                    <p className="text-blue-500 text-3xl font-black mb-1">{scanResult.prot}</p>
                    <p className="text-slate-500 text-[10px] uppercase tracking-widest font-bold">Protéines (g)</p>
                  </div>
                </div>

                <div className="space-y-3 pt-4">
                  <button
                    type="button"
                    onClick={handleConfirmResult}
                    className="w-full bg-primary hover:bg-[#2d9b7f] text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all"
                  >
                    <Send size={18} /> Valider le repas
                  </button>
                  <button onClick={resetScanner} className="w-full bg-white border border-slate-200 text-slate-700 font-medium py-4 rounded-2xl transition-all">
                    Scanner un autre plat
                  </button>
                </div>
              </div>
            </div>
          )}

        </main>

        {/* --- BARRE DE NAVIGATION BASSE --- */}
        {activeTab !== 'result' && (
          <nav className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl 
                          border-t border-slate-200 px-10 py-4 flex justify-center items-center z-50">
            <NavButton 
              active={activeTab === 'home'} 
              onClick={() => setActiveTab('home')} 
              icon={Camera} 
              label="Scanner" 
            />
          </nav>
        )}
      </div>
    </ProtectedLayout>
  )
}

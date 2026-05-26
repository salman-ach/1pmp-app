import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import ProtectedLayout from '../components/ProtectedLayout'
import { useAuth } from '../context/AuthContext'
import { db } from '../lib/firebaseClient'
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore'
import { Calendar, TrendingUp, Zap, Brain, ArrowLeft } from 'lucide-react'

const S = { bg: '#0a1209', bg2: '#0d1f0e', card: '#0f1a10', border: 'rgba(74,222,128,0.12)', acc: '#4ade80', text: '#f0fdf4', muted: '#4a6b4a', blue: '#60a5fa', red: '#ef4444' }

const StatCard = ({ label, value, unit = '', icon: Icon }) => <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 20, padding: '20px', flex: 1, minWidth: 160 }}><div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}><p style={{ color: S.muted, fontSize: 11, textTransform: 'uppercase', letterSpacing: '.1em', margin: 0 }}>{label}</p>{Icon && <Icon size={16} color={S.acc} />}</div><p style={{ color: S.text, fontSize: 28, fontWeight: 700, margin: 0 }}>{value}<span style={{ fontSize: 12, color: S.muted, marginLeft: 6 }}>{unit}</span></p></div>

const MealCard = ({ meal, time }) => <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 16, padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><div><p style={{ color: S.text, fontSize: 16, fontWeight: 600, margin: '0 0 4px' }}>{meal.foodName}</p><p style={{ color: S.muted, fontSize: 12, margin: 0 }}>{time}</p></div><div style={{ textAlign: 'right' }}><p style={{ color: S.acc, fontSize: 16, fontWeight: 700, margin: '0 0 4px' }}>{meal.calories} kcal</p><p style={{ color: S.muted, fontSize: 11, margin: 0 }}>{meal.proteins}g protéines</p></div></div>

const AIRecommendation = ({ title, description, bgColor, icon: Icon }) => <div style={{ background: S.card, border: `1px solid ${S.border}`, borderRadius: 20, padding: '24px', position: 'relative', overflow: 'hidden' }}><div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: bgColor, opacity: 0.1, borderRadius: '50%', transform: 'translate(30%, -30%)' }} /><div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, position: 'relative', zIndex: 1 }}><div style={{ background: bgColor + '30', padding: 12, borderRadius: 12, flexShrink: 0 }}>{Icon && <Icon size={24} color={bgColor} />}</div><div style={{ flex: 1 }}><p style={{ color: bgColor, fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', margin: '0 0 6px' }}>💡 {title}</p><p style={{ color: S.text, fontSize: 14, lineHeight: 1.6, margin: 0 }}>{description}</p></div></div></div>

export default function JournalPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [aiInsights, setAiInsights] = useState([])

  useEffect(() => { if (!user?.id) return; fetchMealsAndInsights() }, [user])

  const fetchMealsAndInsights = async () => {
    if (!db || !user?.id) return
    setLoading(true)
    try {
      const scansCollection = collection(db, 'scans')
      const userQuery = query(scansCollection, where('userId', '==', user.id), orderBy('createdAt', 'desc'), limit(30))
      const snapshot = await getDocs(userQuery)
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), time: doc.data().createdAt?.toDate?.().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) || 'Nouveau' }))
      setMeals(data)
      generateAIInsights(data)
    } catch (error) { console.error('Erreur Firestore:', error) } 
    finally { setLoading(false) }
  }

  const generateAIInsights = (mealData) => {
    const totalCals = mealData.reduce((acc, m) => acc + (m.calories || 0), 0)
    const totalProts = mealData.reduce((acc, m) => acc + (m.proteins || 0), 0)
    const avgMeals = mealData.length
    const insights = []
    if (totalProts < avgMeals * 20) insights.push({ title: 'Apport protéique faible', description: `Vous avez consommé ${totalProts}g de protéines. Augmentez avec des œufs, poisson ou yaourt grec.`, color: S.blue, icon: TrendingUp })
    if (totalCals > 2500) insights.push({ title: 'Surplus calorique', description: `${totalCals} kcal consommées. Privilégiez les légumes volumineux avec moins de calories.`, color: S.red, icon: Zap })
    else if (totalCals < 1500 && totalCals > 0) insights.push({ title: 'Déficit calorique élevé', description: `Seulement ${totalCals} kcal. Assurez-vous de manger suffisamment pour maintenir votre énergie.`, color: '#f59e0b', icon: Brain })
    if (avgMeals >= 3) insights.push({ title: 'Bonne fréquence des repas', description: `${avgMeals} repas scannés. Vous maintenez un excellent rythme alimentaire. Continuez !`, color: S.acc, icon: TrendingUp })
    setAiInsights(insights)
  }

  const todayMeals = meals.filter(m => { if (!m.createdAt) return false; const date = m.createdAt.toDate ? m.createdAt.toDate() : new Date(m.createdAt); const today = new Date(); return date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate() })
  const totalCalories = todayMeals.reduce((acc, m) => acc + (m.calories || 0), 0)
  const totalProtein = todayMeals.reduce((acc, m) => acc + (m.proteins || 0), 0)
  const avgCalPerMeal = todayMeals.length > 0 ? Math.round(totalCalories / todayMeals.length) : 0

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm shadow-slate-200/30">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-slate-500 mb-2">Journal</p>
                <h1 className="text-3xl sm:text-4xl font-display text-slate-900">Journal de la journée</h1>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Retrouvez ici votre suivi quotidien, vos repas enregistrés et votre progression par rapport à l’objectif.
                </p>
              </div>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-primary/50 hover:text-primary"
              >
                Retour au scan
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <h2 className="text-lg font-semibold text-slate-900">Aujourd’hui</h2>
                <p className="mt-3 text-sm text-slate-600">Suivez vos repas, calories et macros pour la journée.</p>
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <h2 className="text-lg font-semibold text-slate-900">Vos repas</h2>
                <p className="mt-3 text-sm text-slate-600">Les repas validés sont conservés ici pour un aperçu rapide.</p>
              </div>
            </div>

            <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">Aucun journal ne peut encore être affiché ici, mais cette page sera le point central de votre suivi quotidien.</p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}

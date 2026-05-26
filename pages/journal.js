import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import ProtectedLayout from '../components/ProtectedLayout'
import { useAuth } from '../context/AuthContext'
import { db } from '../lib/firebaseClient'
import { collection, query, where, orderBy, getDocs, limit } from 'firebase/firestore'
import { Calendar, TrendingUp, Zap, Brain, ArrowLeft, Plus } from 'lucide-react'

const S = { 
  bg: '#0a1209', 
  bg2: '#0d1f0e', 
  card: '#0f1a10', 
  border: 'rgba(74,222,128,0.12)', 
  acc: '#4ade80', 
  text: '#f0fdf4', 
  muted: '#4a6b4a', 
  blue: '#60a5fa', 
  red: '#ef4444' 
}

const StatCard = ({ label, value, unit = '', icon: Icon }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-5 flex-1 min-w-[140px] shadow-sm">
    <div className="flex items-center justify-between mb-2">
      <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider m-0">{label}</p>
      {Icon && <Icon size={16} className="text-emerald-500" />}
    </div>
    <p className="text-slate-900 text-2xl font-bold m-0">
      {value}
      <span className="text-xs text-slate-400 font-normal ml-1">{unit}</span>
    </p>
  </div>
)

const MealCard = ({ meal, time }) => {
  // Gestion sécurisée des noms de variables (français/anglais) selon ce qui est stocké
  const name = meal.foodName || meal.plat || "Aliment";
  const cals = meal.calories !== undefined ? meal.calories : 0;
  const prots = meal.proteins !== undefined ? meal.proteins : (meal.proteines !== undefined ? meal.proteines : 0);

  return (
    <div className="bg-white border border-slate-100 rounded-xl p-4 flex justify-between items-center shadow-sm hover:border-slate-200 transition">
      <div>
        <p className="text-slate-800 text-base font-semibold m-0 mb-1">{name}</p>
        <p className="text-slate-400 text-xs m-0">{time}</p>
      </div>
      <div className="text-right">
        <p className="text-emerald-600 text-base font-bold m-0 mb-1">{cals} kcal</p>
        <p className="text-slate-400 text-xs m-0">{prots}g protéines</p>
      </div>
    </div>
  )
}

const AIRecommendation = ({ title, description, bgColor, icon: Icon }) => (
  <div className="bg-white border border-slate-200 rounded-2xl p-5 relative overflow-hidden shadow-sm">
    <div 
      className="absolute top-0 right-0 w-20 h-20 rounded-full transform translate-x-1/3 -translate-y-1/3" 
      style={{ backgroundColor: bgColor, opacity: 0.08 }} 
    />
    <div className="flex items-start gap-4 relative z-10">
      <div className="p-2.5 rounded-xl flex-shrink-0" style={{ backgroundColor: `${bgColor}15` }}>
        {Icon && <Icon size={20} style={{ color: bgColor }} />}
      </div>
      <div className="flex-1">
        <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: bgColor }}>
          💡 {title}
        </p>
        <p className="text-slate-600 text-sm leading-relaxed m-0">{description}</p>
      </div>
    </div>
  </div>
)

export default function JournalPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [meals, setMeals] = useState([])
  const [loading, setLoading] = useState(true)
  const [aiInsights, setAiInsights] = useState([])

  useEffect(() => { 
    if (!user?.id) return
    fetchMealsAndInsights() 
  }, [user])

  const fetchMealsAndInsights = async () => {
    if (!db || !user?.id) return
    setLoading(true)
    try {
      const scansCollection = collection(db, 'scans')
      const userQuery = query(scansCollection, where('userId', '==', user.id), orderBy('createdAt', 'desc'), limit(30))
      const snapshot = await getDocs(userQuery)
      const data = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data(), 
        time: doc.data().createdAt?.toDate?.().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) || 'Nouveau' 
      }))
      setMeals(data)
      generateAIInsights(data)
    } catch (error) { 
      console.error('Erreur Firestore:', error) 
    } finally { 
      setLoading(false) 
    }
  }

  const generateAIInsights = (mealData) => {
    const totalCals = mealData.reduce((acc, m) => acc + (m.calories || 0), 0)
    const totalProts = mealData.reduce((acc, m) => acc + (m.proteins || m.proteines || 0), 0)
    const avgMeals = mealData.length
    const insights = []

    if (avgMeals === 0) {
      insights.push({
        title: 'Prêt à commencer ?',
        description: 'Scannez votre premier aliment depuis l\'accueil pour obtenir de précieuses analyses nutritionnelles personnalisées !',
        color: '#10b981',
        icon: Brain
      })
      setAiInsights(insights)
      return
    }

    if (totalProts < avgMeals * 15) {
      insights.push({ 
        title: 'Apport protéique léger', 
        description: `Vous avez consommé ${totalProts}g de protéines. Pensez à ajouter des aliments énergisants et sains comme des œufs, du poisson ou du fromage blanc pour nourrir vos muscles !`, 
        color: '#3b82f6', 
        icon: TrendingUp 
      })
    }
    
    if (totalCals > 2500) {
      insights.push({ 
        title: 'Bon apport énergétique', 
        description: `Avec ${totalCals} kcal consommées, veillez à garder un bel équilibre nutritionnel avec de bons légumes colorés et riches en vitamines !`, 
        color: '#ef4444', 
        icon: Zap 
      })
    } else if (totalCals < 1500 && totalCals > 0) {
      insights.push({ 
        title: 'Énergie à compléter', 
        description: `Seulement ${totalCals} kcal aujourd'hui. Assurez-vous d'apporter suffisamment d'énergie saine à votre corps pour rester en pleine forme toute la journée !`, 
        color: '#f59e0b', 
        icon: Brain 
      })
    }
    
    if (avgMeals >= 3) {
      insights.push({ 
        title: 'Excellente régularité !', 
        description: `Déjà ${avgMeals} repas enregistrés. Vous suivez un rythme d'apprentissage alimentaire idéal pour atteindre vos objectifs de santé.`, 
        color: '#10b981', 
        icon: TrendingUp 
      })
    }
    
    setAiInsights(insights)
  }

  // Filtrage sécurisé des repas du jour
  const todayMeals = meals.filter(m => { 
    if (!m.createdAt) return false
    const date = m.createdAt.toDate ? m.createdAt.toDate() : new Date(m.createdAt)
    const today = new Date() 
    return date.getFullYear() === today.getFullYear() && 
           date.getMonth() === today.getMonth() && 
           date.getDate() === today.getDate() 
  })

  const totalCalories = todayMeals.reduce((acc, m) => acc + (m.calories || 0), 0)
  const totalProtein = todayMeals.reduce((acc, m) => acc + (m.proteins || m.proteines || 0), 0)
  const avgCalPerMeal = todayMeals.length > 0 ? Math.round(totalCalories / todayMeals.length) : 0

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="rounded-[32px] border border-slate-200 bg-white p-6 sm:p-8 shadow-sm">
            
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-600 font-bold mb-1">Mon Suivi</p>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Journal d'aujourd'hui</h1>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">
                  Retrouvez ici votre suivi quotidien, vos repas enregistrés et les conseils personnalisés de votre assistant IA.
                </p>
              </div>
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300"
              >
                <ArrowLeft size={16} />
                Retour au scan
              </Link>
            </div>

            {loading ? (
              <div className="py-12 text-center text-slate-400 text-sm">
                Chargement de vos statistiques de repas...
              </div>
            ) : (
              <div className="space-y-8">
                
                {/* Stat Cards Row */}
                <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
                  <StatCard label="Calories" value={totalCalories} unit="kcal" icon={Zap} />
                  <StatCard label="Protéines" value={totalProtein} unit="g" icon={TrendingUp} />
                  <StatCard label="Moyenne / Repas" value={avgCalPerMeal} unit="kcal" icon={Calendar} />
                </div>

                {/* Main Content Layout */}
                <div className="grid gap-8 lg:grid-cols-3">
                  
                  {/* Left Column: Today's Meal list */}
                  <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-lg font-bold text-slate-800">Repas de la journée ({todayMeals.length})</h2>
                      {todayMeals.length > 0 && (
                        <span className="text-xs text-slate-400 font-medium">Mis à jour en temps réel</span>
                      )}
                    </div>
                    
                    {todayMeals.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-8 text-center">
                        <p className="text-slate-500 text-sm mb-4">Aucun aliment validé aujourd'hui pour l'instant.</p>
                        <Link 
                          href="/dashboard" 
                          className="inline-flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 px-4 py-2.5 rounded-xl hover:bg-emerald-100 transition"
                        >
                          <Plus size={14} /> Scanner un plat
                        </Link>
                      </div>
                    ) : (
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                        {todayMeals.map((meal) => (
                          <MealCard key={meal.id} meal={meal} time={meal.time} />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Right Column: AI Insights */}
                  <div className="space-y-4">
                    <h2 className="text-lg font-bold text-slate-800">Recommandations IA</h2>
                    <div className="space-y-4">
                      {aiInsights.map((insight, index) => (
                        <AIRecommendation 
                          key={index}
                          title={insight.title}
                          description={insight.description}
                          bgColor={insight.color}
                          icon={insight.icon}
                        />
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}
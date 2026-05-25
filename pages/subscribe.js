import { useRouter } from 'next/router'
import Link from 'next/link'
import { useState } from 'react'

export default function SubscribePage() {
  const router = useRouter()
  const [loadingCheckout, setLoadingCheckout] = useState(false)

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-16 lg:px-8">
        <div className="mb-12 flex flex-col gap-4">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">Offres premium</p>
          <h1 className="text-4xl font-display font-black">Abonnements FoodTracker</h1>
          <p className="max-w-3xl text-slate-600 text-base">
            Choisissez l’offre adaptée : démarrage gratuit ou version Pro pour un suivi complet et des analyses avancées.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
            <span className="text-sm uppercase tracking-[0.3em] text-slate-500">Gratuit</span>
            <h2 className="mt-5 text-3xl font-semibold text-slate-900">Starter</h2>
            <p className="mt-3 text-slate-600">Accès immédiat au scanner et au suivi de base, idéal pour découvrir FoodTracker.</p>
            <ul className="mt-8 space-y-3 text-slate-700 text-sm">
              <li>✅ 1 utilisation par jour</li>
              <li>✅ Visualisation rapide des calories</li>
              <li>✅ Objectifs de base</li>
            </ul>
            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="mt-8 w-full rounded-2xl bg-primary py-3 text-sm font-semibold text-white transition hover:bg-[#2d9b7f]"
            >
              Commencer gratuitement
            </button>
          </div>

          <div className="rounded-[32px] border border-primary/20 bg-primary-soft p-8 shadow-[0_0_40px_rgba(26,134,105,0.15)]">
            <span className="text-sm uppercase tracking-[0.3em] text-primary">Le plus efficace</span>
            <h2 className="mt-5 text-3xl font-semibold text-slate-900">Pro</h2>
            <p className="mt-3 text-slate-700">Plans nutritionnels, historique complet et recommandations évoluées pour les utilisateurs engagés.</p>
            <div className="mt-8 space-y-3 text-slate-700 text-sm">
              <p>✅ 59.99dh / mois</p>
              <p>✅ Suivi détaillé des micronutriments : sucre, fibres, sodium, fer et vitamines</p>
              <p>✅ Objectifs personnalisés par jour (ex : plus de glucides les jours d’entraînement, moins les jours de repos)</p>
              <p>✅ Suivi du Net Carb (Glucides nets) pour les régimes Keto</p>
            </div>
            <button
              type="button"
              onClick={async () => {
                try {
                  setLoadingCheckout(true)
                  const res = await fetch('/api/create-checkout-session', { method: 'POST' })
                  const data = await res.json()
                  if (data?.url) {
                    window.location.href = data.url
                  } else {
                    alert(data?.error || 'Erreur lors de la création du paiement.')
                  }
                } catch (err) {
                  console.error('Checkout error:', err)
                  alert('Impossible de démarrer le paiement.')
                } finally {
                  setLoadingCheckout(false)
                }
              }}
              className="mt-8 w-full rounded-2xl bg-coral text-white py-3 text-sm font-semibold transition hover:bg-coral-dark"
              disabled={loadingCheckout}
            >
              {loadingCheckout ? 'Redirection vers le paiement...' : 'S’abonner au Pro'}
            </button>
          </div>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[32px] border border-slate-200 bg-white p-8">
            <h3 className="text-xl font-semibold text-slate-900">Pourquoi FoodTracker fonctionne</h3>
            <p className="mt-4 text-slate-600">Les applications à forte croissance misent sur des interfaces simples, un onboarding rapide et des offres premium claires. FoodTracker suit cette recette en proposant une expérience utilitaire et un passage à l’abonnement naturel.</p>
          </div>
          <div className="rounded-[32px] border border-slate-200 bg-white p-8">
            <h3 className="text-xl font-semibold text-slate-900">Ce que votre application doit offrir</h3>
            <ul className="mt-4 space-y-3 text-slate-700 text-sm">
              <li>• Conversion rapide dès la première utilisation</li>
              <li>• Résultats visibles immédiatement après le scan</li>
              <li>• Statistiques claires et exportables</li>
              <li>• Abonnement Pro simple et engageant</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

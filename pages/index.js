// pages/index.js
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900">
      <div className="max-w-6xl mx-auto px-6 py-16 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-4 py-2 text-sm text-primary font-medium">
              La nutrition repensée pour vos repas rapides
            </p>
            <h1 className="text-4xl sm:text-5xl font-display font-black leading-tight">
              Transformez chaque assiette en un plan alimentaire intelligent
            </h1>
            <p className="max-w-2xl text-white/60 text-base sm:text-lg">
              Scannez votre plat, découvrez ses calories et macros instantanément, puis suivez vos progrès avec un tableau de bord clair et motivant.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row">
              <Link href="/login" className="inline-flex items-center justify-center rounded-2xl bg-coral px-6 py-3 text-sm font-semibold text-white transition hover:bg-coral-dark shadow-lg shadow-coral/20">
                Se connecter
              </Link>
              <Link href="/register" className="inline-flex items-center justify-center rounded-2xl border border-[#1A8669]/20 bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:border-[#1A8669] hover:text-primary">
                Créer un compte
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-3 mt-8">
              <div className="rounded-3xl bg-white p-5 border border-slate-200">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Utilisateurs actifs</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">22k+</p>
              </div>
              <div className="rounded-3xl bg-white p-5 border border-slate-200">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Taux de conversion</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">8.4%</p>
              </div>
              <div className="rounded-3xl bg-white p-5 border border-slate-200">
                <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Clients Pro</p>
                <p className="mt-3 text-3xl font-bold text-slate-900">+120</p>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] border border-slate-200 bg-white p-8 shadow-[0_0_40px_rgba(56,189,248,0.08)]">
            <div className="space-y-5">
              <div className="flex items-center justify-between gap-4 rounded-3xl bg-slate-50 p-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Scan rapide</p>
                  <p className="mt-3 text-2xl font-bold text-slate-900">Analyse en 2 secondes</p>
                </div>
                <div className="rounded-3xl bg-primary-soft p-4 text-primary">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                    <path d="M12 20v-8" />
                    <path d="M8 12l4-4 4 4" />
                    <path d="M12 4v4" />
                  </svg>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {[
                  { title: 'Calories', value: '485 kcal' },
                  { title: 'Protéines', value: '32 g' },
                  { title: 'Lipides', value: '18 g' },
                  { title: 'Glucides', value: '54 g' },
                ].map(card => (
                  <div key={card.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{card.title}</p>
                    <p className="mt-3 text-xl font-semibold text-slate-900">{card.value}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-3xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm text-slate-600">Passez à Pro pour :</p>
                <ul className="mt-4 space-y-3 text-sm text-slate-700">
                  <li>✔️ Historique illimité de repas</li>
                  <li>✔️ Plans nutritionnels personnalisés</li>
                  <li>✔️ Export CSV et conseils experts</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-slate-900">Fonctionnalités clés</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              { title: 'Scan repas', description: 'Scannez une photo de votre plat et recevez un estimé nutritionnel instantané.' },
              { title: 'Suivi macro', description: 'Suivez calories, protéines, lipides et glucides jour après jour.' },
              { title: 'Pro', description: 'Accédez à des conseils avancés et des analyses approfondies pour un suivi engagé.' },
            ].map(card => (
              <div key={card.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
                <h3 className="text-lg font-semibold text-slate-900">{card.title}</h3>
                <p className="mt-3 text-sm text-slate-600">{card.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

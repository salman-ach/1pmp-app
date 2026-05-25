import Link from 'next/link'
import ProtectedLayout from '../../components/ProtectedLayout'

export default function MenuMonetisationPage() {
  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500 mb-2">Section du menu</p>
              <h1 className="text-3xl sm:text-4xl font-display text-slate-900">Monétisation</h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-600">
                Découvrez l’offre Premium et profitez d’une expérience améliorée avec plus de fonctionnalités utiles au quotidien.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/menu" className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-primary/50 hover:text-primary">
                Retour au menu
              </Link>
              <Link href="/subscribe" className="inline-flex items-center justify-center rounded-2xl bg-amber-500 text-sm font-semibold text-white px-5 py-3 transition hover:bg-amber-600">
                Voir l’abonnement
              </Link>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <div className="rounded-[28px] border border-amber-200 bg-amber-50 p-6 shadow-sm shadow-amber-100/50">
              <h2 className="text-xl font-semibold text-slate-900">Passer à la version PRO</h2>
              <p className="mt-4 text-sm leading-6 text-slate-600">
                Profitez du scanner IA, des macros nets, d’une expérience sans pub et de fonctions exclusives conçues pour aller plus loin dans votre suivi nutritionnel.
              </p>
              <div className="mt-6">
                <Link href="/subscribe" className="inline-flex items-center justify-center rounded-2xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-amber-700">
                  Découvrir PRO
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}

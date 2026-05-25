import Link from 'next/link'
import ProtectedLayout from '../components/ProtectedLayout'

export default function JournalPage() {
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

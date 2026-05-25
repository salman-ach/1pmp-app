import Link from 'next/link'
import ProtectedLayout from '../../components/ProtectedLayout'

const sectionItems = [
  {
    title: 'Paramètres de l’application',
    description: 'Choisissez kg/lbs, calories/kilojoules, activez le mode sombre et gérez les notifications.',
    href: '/settings',
  },
  {
    title: 'Aide & Tutoriels',
    description: 'Accédez à la FAQ, au guide du scanner de codes-barres et aux conseils pour calculer les glucides nets.',
  },
  {
    title: 'Nous contacter',
    description: 'Envoyez un rapport de bug ou proposez un nouvel aliment pour la base de données.',
  },
]

export default function MenuSupportPage() {
  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500 mb-2">Section du menu</p>
              <h1 className="text-3xl sm:text-4xl font-display text-slate-900">Paramètres et support</h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-600">
                Retrouvez ici tous les outils pour personnaliser l’application et obtenir de l’aide rapidement.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/menu" className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-primary/50 hover:text-primary">
                Retour au menu
              </Link>
              <Link href="/settings" className="inline-flex items-center justify-center rounded-2xl bg-primary text-sm font-semibold text-white px-5 py-3 transition hover:bg-slate-900">
                Ouvrir les paramètres
              </Link>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {sectionItems.map((item, index) => (
              <div key={index} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
                <h2 className="text-xl font-semibold text-slate-900">{item.title}</h2>
                <p className="mt-4 text-sm leading-6 text-slate-600">{item.description}</p>
                <div className="mt-6">
                  {item.href ? (
                    <Link href={item.href} className="inline-flex items-center justify-center rounded-2xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-900">
                      Ouvrir
                    </Link>
                  ) : (
                    <button className="inline-flex items-center justify-center rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                      À venir
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}

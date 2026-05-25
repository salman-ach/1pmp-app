import { useState } from 'react'
import Link from 'next/link'
import ProtectedLayout from '../components/ProtectedLayout'

const menuSections = [
  {
    title: 'Le cœur de l’application',
    description: 'Accédez rapidement aux actions quotidiennes les plus importantes.',
    sectionHref: '/menu/coeur',
    items: [
      {
        title: 'Journal / Aujourd’hui',
        description: 'Ajoutez vos repas, suivez vos calories restantes et visualisez vos macronutriments.',
        href: '/journal',
      },
      {
        title: 'Ma Progression / Statistiques',
        description: 'Consultez vos courbes de poids, l’historique calorique et vos streaks.',
      },
      {
        title: 'Mes Recettes & Aliments',
        description: 'Retrouvez vos repas sauvegardés et ajoutez rapidement vos aliments personnalisés.',
      },
    ],
  },
  {
    title: 'Profil et objectifs',
    description: 'Réglez vos cibles et vos données personnelles en un seul endroit.',
    sectionHref: '/menu/profil',
    items: [
      {
        title: 'Mes Objectifs',
        description: 'Ajustez le poids cible, le rythme de perte ou de prise et recalculer automatiquement vos besoins.',
        href: '/settings',
      },
      {
        title: 'Mon Profil',
        description: 'Mettez à jour votre âge, taille, sexe et niveau d’activité physique.',
        href: '/settings',
      },
      {
        title: 'Connexions & Appareils',
        description: 'Synchronisez votre application avec Apple Health, Google Fit et vos montres connectées.',
        href: '/settings',
      },
    ],
  },
  {
    title: 'Monétisation',
    description: 'Faites connaître l’offre Premium et ses avantages uniques.',
    sectionHref: '/menu/monetisation',
    items: [
      {
        title: 'Passer à la version PRO',
        description: 'Profitez du scanner IA, des macros nets, d’une expérience sans pub et de fonctions exclusives.',
        href: '/subscribe',
        highlight: true,
      },
    ],
  },
  {
    title: 'Paramètres et support',
    description: 'Aidez vos utilisateurs à personnaliser l’application et obtenir du support rapidement.',
    sectionHref: '/menu/support',
    items: [
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
    ],
  },
]

export default function MenuPage() {
  const [selectedMenu, setSelectedMenu] = useState(null)

  const handleSelectMenu = title => {
    setSelectedMenu(title)
  }

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-[#f8fafc] text-slate-900 pb-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500 mb-2">Menu intelligent</p>
              <h1 className="text-3xl sm:text-4xl font-display text-slate-900">Navigation principale</h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-600">
                Retrouvez tous les espaces clés de l’application : journal, progression, profil, monétisation et support.
              </p>
              {selectedMenu && (
                <div className="mt-5 rounded-3xl border border-primary/20 bg-primary-soft p-4 text-sm text-primary">
                  Élément sélectionné : <strong>{selectedMenu}</strong>
                </div>
              )}
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-primary/50 hover:text-primary"
            >
              Retour au scan
            </Link>
          </div>

          <div className="space-y-10">
            {menuSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-semibold text-slate-900">{section.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{section.description}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {section.sectionHref && (
                      <Link
                        href={section.sectionHref}
                        className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:border-primary/50 hover:text-primary"
                      >
                        Voir la section
                      </Link>
                    )}
                    {section.title === 'Monétisation' && (
                      <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-amber-800">
                        <span>Premium</span>
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 2l2.9 6.1 6.7 1-4.8 4.7 1.1 6.6L12 16.9 6.1 20.4l1-6.6-4.8-4.7 6.7-1L12 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-8 grid gap-5 lg:grid-cols-3">
                  {section.items.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className={`rounded-3xl border p-6 shadow-sm transition ${item.highlight ? 'border-amber-200 bg-amber-50 shadow-amber-100/50' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                        {item.highlight && (
                          <span className="rounded-full bg-amber-500 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-white">PRO</span>
                        )}
                      </div>
                      <p className="mt-4 text-sm leading-6 text-slate-600">{item.description}</p>

                      <div className="mt-6 flex items-center justify-between gap-3">
                        {item.href ? (
                          <Link
                            href={item.href}
                            className={`inline-flex items-center justify-center rounded-2xl px-4 py-2 text-sm font-semibold transition ${item.highlight ? 'bg-amber-600 text-white hover:bg-amber-700' : 'bg-primary text-white hover:bg-slate-900'}`}
                            onClick={() => handleSelectMenu(item.title)}
                          >
                            Ouvrir
                          </Link>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleSelectMenu(item.title)}
                            className="inline-flex items-center justify-center rounded-2xl bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                          >
                            Voir
                          </button>
                        )}
                        <span className="text-[11px] uppercase tracking-[0.28em] text-slate-400">Menu</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}

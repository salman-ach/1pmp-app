import { useState, useEffect } from 'react'
import Link from 'next/link'
import ProtectedLayout from '../components/ProtectedLayout'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'

export default function SettingsPage() {
  const { user } = useAuth()
  const [dailyGoal, setDailyGoal] = useState(2000)
  const [emailAlerts, setEmailAlerts] = useState(true)
  const [darkMode, setDarkMode] = useState(false)
  const [savingAlerts, setSavingAlerts] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const savedTheme = window.localStorage.getItem('theme')
    setDarkMode(savedTheme === 'dark')

    const persistedEmailAlerts = window.localStorage.getItem('emailAlerts')
    if (persistedEmailAlerts !== null) {
      setEmailAlerts(persistedEmailAlerts === 'true')
    } else if (user?.user_metadata?.email_alerts !== undefined) {
      setEmailAlerts(user.user_metadata.email_alerts === true || user.user_metadata.email_alerts === 'true')
    }
  }, [user])

  const saveEmailAlertPreference = async (nextState) => {
    if (!user) return
    setSavingAlerts(true)
    setEmailAlerts(nextState)
    window.localStorage.setItem('emailAlerts', nextState ? 'true' : 'false')

    const { error } = await supabase.auth.updateUser({ data: { email_alerts: nextState } })
    setSavingAlerts(false)

    if (error) {
      setEmailAlerts(!nextState)
      setAlertMessage('Impossible de mettre à jour votre préférence d’alerte email.')
      return
    }

    setAlertMessage(`Alertes email ${nextState ? 'activées' : 'désactivées'} avec succès.`)
    setTimeout(() => setAlertMessage(''), 4000)
  }

  useEffect(() => {
    if (!user || !emailAlerts) return
    const timeout = setTimeout(() => {
      setAlertMessage('Les alertes par email sont activées. Vous recevrez des rappels nutritionnels sur votre adresse.')
    }, 500)
    return () => clearTimeout(timeout)
  }, [user, emailAlerts])

  const toggleDarkMode = () => {
    const nextMode = !darkMode
    setDarkMode(nextMode)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('theme', nextMode ? 'dark' : 'light')
      document.documentElement.classList.toggle('dark', nextMode)
    }
  }

  return (
    <ProtectedLayout>
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] pb-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <p className="text-sm uppercase tracking-[0.35em] text-slate-500 mb-2">Paramètres</p>
              <h1 className="text-3xl sm:text-4xl font-display text-slate-900">Réglages de votre compte</h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-600">
                Gérez vos informations, vos notifications et vos objectifs en un seul endroit.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:border-primary/50 hover:text-primary"
            >
              Retour au scan
            </Link>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="rounded-[28px] border border-slate-200 bg-[var(--color-surface)] p-8 shadow-sm shadow-slate-200/30">
              <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">Compte</h2>
              <div className="space-y-4 text-sm text-slate-900 dark:text-slate-300">
                <div>
                  <p className="text-black dark:text-white text-xs uppercase tracking-[0.3em] mb-1">Email</p>
                  <p className="font-medium text-black dark:text-white">{user?.email ?? 'Utilisateur inconnu'}</p>
                </div>
                <div>
                  <p className="text-black dark:text-white text-xs uppercase tracking-[0.3em] mb-1">Nom</p>
                  <p className="font-medium text-black dark:text-white">{user?.user_metadata?.full_name ?? 'Non renseigné'}</p>
                </div>
                <div>
                  <p className="text-slate-500 text-xs uppercase tracking-[0.3em] mb-1">Statut</p>
                  <span className="inline-flex rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                    Actif
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-slate-200 bg-[var(--color-surface)] p-8 shadow-sm shadow-slate-200/30">
              <h2 className="text-xl font-semibold text-[var(--color-text)] mb-4">Préférences</h2>
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-slate-700 font-medium">Objectif journalier (kcal)</p>
                    <span className="text-sm text-slate-500">{dailyGoal} kcal</span>
                  </div>
                  <input
                    type="range"
                    min="1200"
                    max="3000"
                    step="100"
                    value={dailyGoal}
                    onChange={e => setDailyGoal(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>

                <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <p className="font-medium text-slate-900">Alertes par email</p>
                    <p className="text-sm text-slate-500">Recevez des rappels nutritionnels par email.</p>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <button
                      onClick={() => saveEmailAlertPreference(!emailAlerts)}
                      disabled={savingAlerts}
                      className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                        emailAlerts ? 'bg-primary text-white' : 'bg-slate-200 text-slate-700'
                      } ${savingAlerts ? 'opacity-70 cursor-wait' : ''}`}
                    >
                      {emailAlerts ? 'Activées' : 'Désactivées'}
                    </button>
                  </div>
                  {alertMessage ? (
                    <div className="rounded-2xl border border-primary/20 bg-primary-soft px-4 py-3 text-sm text-primary">
                      {alertMessage}
                    </div>
                  ) : null}
                </div>

                <div className="flex items-center justify-between rounded-3xl border border-slate-200 bg-slate-50 p-4">
                  <div>
                    <p className="font-medium text-slate-900">Mode sombre</p>
                    <p className="text-sm text-slate-500">Ajustez le contraste de l’interface.</p>
                  </div>
                  <button
                    onClick={toggleDarkMode}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      darkMode ? 'bg-coral text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {darkMode ? 'Activé' : 'Désactivé'}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-[28px] border border-slate-200 bg-[var(--color-surface-soft)] p-6">
            <h2 className="text-lg font-semibold text-[var(--color-text)] mb-3">Sécurité</h2>
            <p className="text-sm text-[var(--color-muted)]">Pour modifier votre mot de passe ou vos informations de connexion, rendez-vous dans votre espace de gestion de compte Supabase.</p>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}

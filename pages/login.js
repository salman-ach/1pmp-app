// pages/login.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'

export default function LoginPage() {
  const { user, signIn, loading: authLoading } = useAuth()
  const router = useRouter()

  const [form,    setForm]    = useState({ email: '', password: '' })
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!authLoading && user) router.replace('/subscribe')
  }, [user, authLoading, router])

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Veuillez remplir tous les champs.')
      return
    }
    setLoading(true)
    const { error } = await signIn({ email: form.email, password: form.password })
    setLoading(false)
    if (error) {
      setError(error.message === 'Invalid login credentials'
        ? 'Email ou mot de passe incorrect.'
        : error.message)
    } else {
      router.replace('/subscribe')
    }
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] bg-grid flex items-center justify-center px-4 relative">

      {/* Background glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] rounded-full bg-primary-soft blur-3xl" />
      </div>

      <div className="relative w-full max-w-md fade-up">

        {/* Logo */}
        <div className="flex flex-col items-center mb-10 gap-3">
          <div className="w-24 h-24 rounded-full bg-primary-soft border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/10">
            <Logo className="w-20 h-20" />
          </div>
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.32em] text-slate-500 mb-2">Connexion</p>
            <h1 className="font-display text-slate-900 text-3xl sm:text-4xl">
              Bienvenue sur FoodTracker
            </h1>
            <p className="mt-3 text-sm text-slate-600">
              Connectez-vous pour scanner vos repas et suivre votre équilibre alimentaire.
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-[32px] border border-slate-200 bg-[var(--color-surface)] p-8 shadow-xl shadow-slate-200/60 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">
                Email
              </label>
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 focus-within:border-primary transition-all duration-300">
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                  placeholder="vous@exemple.com"
                  className="w-full bg-transparent text-slate-900 placeholder-slate-400 px-4 py-3 text-sm outline-none font-body"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">
                Mot de passe
              </label>
              <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 focus-within:border-primary transition-all duration-300">
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full bg-transparent text-slate-900 placeholder-slate-400 px-4 py-3 text-sm outline-none font-body"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 rounded-2xl bg-red-50 border border-red-200 px-4 py-3">
                <svg className="w-4 h-4 text-red-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-coral px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-coral/20 transition hover:bg-coral-dark disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Connexion...
                </>
              ) : (
                'Se connecter'
              )}
            </button>

          </form>
        </div>

        {/* Register link */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Pas de compte ?{' '}
          <Link href="/register" className="text-primary font-semibold hover:text-primary-dark transition-colors">
            Créer un compte
          </Link>
        </p>

      </div>
    </div>
  )
}

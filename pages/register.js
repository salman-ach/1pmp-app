// pages/register.js
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Link from 'next/link'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'

function Field({ label, type = 'text', name, value, onChange, placeholder, autoComplete }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-2 uppercase tracking-wider">
        {label}
      </label>
      <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 focus-within:border-primary transition-all duration-300">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full bg-transparent text-slate-900 placeholder-slate-400 px-4 py-3 text-sm outline-none font-body"
        />
      </div>
    </div>
  )
}

export default function RegisterPage() {
  const { user, signUp, loading: authLoading } = useAuth()
  const router = useRouter()

  const [form,    setForm]    = useState({ fullName: '', email: '', password: '', confirm: '' })
  const [errors,  setErrors]  = useState({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!authLoading && user) router.replace('/dashboard')
  }, [user, authLoading, router])

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }))
    setErrors(er => ({ ...er, [e.target.name]: '', global: '' }))
  }

  const validate = () => {
    const err = {}
    if (!form.fullName.trim())                          err.fullName = 'Nom requis.'
    if (!form.email.includes('@'))                      err.email    = 'Email invalide.'
    if (form.password.length < 8)                       err.password = 'Minimum 8 caractères.'
    if (form.password !== form.confirm)                 err.confirm  = 'Les mots de passe ne correspondent pas.'
    return err
  }

  const handleSubmit = async e => {
    e.preventDefault()
    const err = validate()
    if (Object.keys(err).length) { setErrors(err); return }

    setLoading(true)
    const { error } = await signUp({ email: form.email, password: form.password, fullName: form.fullName })
    setLoading(false)

    if (error) {
      setErrors({ global: error.message })
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] bg-grid flex items-center justify-center px-4 relative">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] rounded-full bg-primary-soft blur-3xl" />
        </div>

        <div className="relative w-full max-w-md fade-up">
          <div className="rounded-[32px] border border-slate-200 bg-[var(--color-surface)] p-10 shadow-xl shadow-slate-200/60 backdrop-blur-sm text-center">
            <div className="w-16 h-16 rounded-full bg-primary-soft border border-primary/30 flex items-center justify-center mx-auto mb-5">
              <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-display text-slate-900 text-3xl mb-2">Vérifiez votre email</h2>
            <p className="text-slate-600 text-sm mb-6">
              Un email de vérification de FoodTracker a été envoyé à <span className="font-semibold">{form.email}</span>.
              Cliquez sur le lien dans ce message pour activer votre compte.
            </p>
            <p className="text-slate-500 text-xs mb-6">Pensez à vérifier vos spams si vous ne voyez rien arriver.</p>
            <div className="flex flex-col gap-3">
              <Link href="/login" className="inline-flex items-center justify-center rounded-2xl bg-coral px-4 py-3 text-sm font-semibold text-white transition hover:bg-coral-dark">
                Retour à la connexion
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] bg-grid flex items-center justify-center px-4 relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[560px] h-[560px] rounded-full bg-primary-soft blur-3xl" />
      </div>

      <div className="relative w-full max-w-md fade-up">
        <div className="flex flex-col items-center mb-10 gap-3">
          <div className="w-24 h-24 rounded-full bg-primary-soft border border-primary/30 flex items-center justify-center shadow-lg shadow-primary/10">
            <Logo className="w-20 h-20" />
          </div>
          <div className="text-center">
            <p className="text-sm uppercase tracking-[0.32em] text-slate-500 mb-2">Inscription</p>
            <h1 className="font-display text-slate-900 text-3xl sm:text-4xl">
              Rejoignez FoodTracker
            </h1>
            <p className="mt-3 text-sm text-slate-600">
              Créez un compte pour scanner vos repas et suivre votre équilibre alimentaire.
            </p>
          </div>
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-[var(--color-surface)] p-8 shadow-xl shadow-slate-200/60 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            <Field label="Nom complet" name="fullName" value={form.fullName} onChange={handleChange} placeholder="Jean Dupont" autoComplete="name" />
            {errors.fullName && <p className="text-red-500 text-xs -mt-2">{errors.fullName}</p>}

            <Field label="Email" name="email" value={form.email} onChange={handleChange} placeholder="vous@exemple.com" autoComplete="email" type="email" />
            {errors.email && <p className="text-red-500 text-xs -mt-2">{errors.email}</p>}

            <Field label="Mot de passe" name="password" value={form.password} onChange={handleChange} placeholder="Min. 8 caractères" autoComplete="new-password" type="password" />
            {errors.password && <p className="text-red-500 text-xs -mt-2">{errors.password}</p>}

            <Field label="Confirmer" name="confirm" value={form.confirm} onChange={handleChange} placeholder="••••••••" autoComplete="new-password" type="password" />
            {errors.confirm && <p className="text-red-500 text-xs -mt-2">{errors.confirm}</p>}

            {errors.global && (
              <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3">
                <p className="text-red-600 text-sm">{errors.global}</p>
              </div>
            )}

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
                  Création...
                </>
              ) : (
                'Créer mon compte'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-5">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-primary font-semibold hover:text-primary-dark transition-colors">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}

// components/Navbar.js
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../context/AuthContext'
import Logo from './Logo'

const navItems = [
  { href: '/dashboard', label: 'Scan' },
  { href: '/journal', label: 'Journal' },
  { href: '/pro', label: 'Pro' },
  { href: '/settings-new', label: 'Paramètres' },
]

export default function Navbar() {
  const { user, signOut } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.replace('/login')
  }

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.slice(0, 2).toUpperCase() ?? '??'

  const displayName = user?.user_metadata?.full_name ?? user?.email ?? ''

  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/70 backdrop-blur-md bg-white/95 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="h-16 flex items-center justify-between gap-4">

          {/* Logo + Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary-soft border border-primary/30 flex items-center justify-center">
              <Logo className="w-6 h-6" />
            </div>
            <span className="font-display text-slate-900 text-[15px] tracking-wide hidden sm:block">
              FoodTracker
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-4">
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm font-medium transition-colors ${router.pathname === item.href ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            onClick={() => setMenuOpen(prev => !prev)}
            className="md:hidden inline-flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 hover:text-primary transition"
            aria-label="Ouvrir le menu"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          {/* Right: user info + logout */}
          <div className="flex items-center gap-3">
            {/* User avatar */}
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-full bg-primary-soft border border-primary/40
                           flex items-center justify-center text-[11px] font-mono font-medium
                           text-primary select-none"
              >
                {initials}
              </div>
              <span className="hidden md:block text-sm text-slate-500 max-w-[160px] truncate">
                {displayName}
              </span>
            </div>

            {/* Divider */}
            <div className="w-px h-5 bg-slate-200 hidden sm:block" />

            {/* Sign out */}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900
                         transition-colors duration-200 group"
            >
              <svg className="w-4 h-4 group-hover:text-primary transition-colors" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span className="hidden sm:inline font-semibold">Déconnexion</span>
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden absolute inset-x-0 top-full z-40 border-t border-slate-200 bg-white shadow-xl">
            <div className="px-4 py-4 space-y-3">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className={`block rounded-2xl px-4 py-3 text-sm font-medium transition ${
                    router.pathname === item.href ? 'bg-slate-100 text-slate-900' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  setMenuOpen(false)
                  handleSignOut()
                }}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Déconnexion sécurisée
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

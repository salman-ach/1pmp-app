// pages/_app.js
import { useEffect } from 'react'
import { AuthProvider } from '../context/AuthContext'
import '../styles/globals.css'

export default function App({ Component, pageProps }) {
  useEffect(() => {
    if (typeof window === 'undefined') return
    const theme = window.localStorage.getItem('theme')
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [])

  return (
    <AuthProvider>
      <Component {...pageProps} />
    </AuthProvider>
  )
}

'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div style={{
      minHeight: '100dvh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px',
      background: 'linear-gradient(145deg, #fdf9f5 0%, #f7ede4 50%, #fdf9f5 100%)',
    }}>
      <div style={{ width: '100%', maxWidth: 380 }}>

        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          {/* Floral doodle */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
              <circle cx="18" cy="18" r="5" fill="#c07860" opacity="0.8"/>
              <ellipse cx="18" cy="7.5" rx="4" ry="5.5" fill="#c07860" opacity="0.4"/>
              <ellipse cx="18" cy="28.5" rx="4" ry="5.5" fill="#c07860" opacity="0.4"/>
              <ellipse cx="7.5" cy="18" rx="5.5" ry="4" fill="#c07860" opacity="0.4"/>
              <ellipse cx="28.5" cy="18" rx="5.5" ry="4" fill="#c07860" opacity="0.4"/>
              <ellipse cx="10" cy="10" rx="3" ry="4.5" fill="#c07860" opacity="0.22" transform="rotate(-45 10 10)"/>
              <ellipse cx="26" cy="10" rx="3" ry="4.5" fill="#c07860" opacity="0.22" transform="rotate(45 26 10)"/>
              <ellipse cx="10" cy="26" rx="3" ry="4.5" fill="#c07860" opacity="0.22" transform="rotate(45 10 26)"/>
              <ellipse cx="26" cy="26" rx="3" ry="4.5" fill="#c07860" opacity="0.22" transform="rotate(-45 26 26)"/>
            </svg>
          </div>
          <h1 style={{
            fontFamily: "'Palatino Linotype', Palatino, Georgia, serif",
            fontSize: '1.55rem', fontWeight: 400, color: '#1c1410',
            margin: '0 0 6px', letterSpacing: '-0.01em', lineHeight: 1.2,
          }}>
            El Universo de Victoria
          </h1>
          <p style={{ fontSize: '0.8rem', color: '#8a7060', margin: 0 }}>
            Content Brain · Acceso privado
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: '0.72rem', color: '#4a3828', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={loading}
              style={{
                width: '100%', boxSizing: 'border-box',
                background: 'rgba(255,255,255,0.8)',
                border: '1px solid #e0d6cc', borderRadius: 11,
                padding: '11px 14px', fontSize: '0.9rem', color: '#1c1410',
                outline: 'none', transition: 'border-color 150ms',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#c07860' }}
              onBlur={e => { e.currentTarget.style.borderColor = '#e0d6cc' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.72rem', color: '#4a3828', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                disabled={loading}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: 'rgba(255,255,255,0.8)',
                  border: '1px solid #e0d6cc', borderRadius: 11,
                  padding: '11px 44px 11px 14px', fontSize: '0.9rem', color: '#1c1410',
                  outline: 'none', transition: 'border-color 150ms',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = '#c07860' }}
                onBlur={e => { e.currentTarget.style.borderColor = '#e0d6cc' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: '#8a7060',
                  display: 'flex', padding: 4,
                }}
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              background: '#fdecea', border: '1px solid #f0a8a0',
              borderRadius: 9, padding: '10px 14px',
              fontSize: '0.8rem', color: '#8b1a0a',
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !email.trim() || !password.trim()}
            style={{
              marginTop: 6,
              width: '100%', padding: '13px',
              background: loading || !email.trim() || !password.trim()
                ? '#e0d6cc' : '#c07860',
              color: loading || !email.trim() || !password.trim() ? '#8a7060' : 'white',
              border: 'none', borderRadius: 11, cursor: loading ? 'wait' : 'pointer',
              fontSize: '0.9rem', fontWeight: 600, letterSpacing: '0.02em',
              transition: 'background 150ms, color 150ms',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            }}
          >
            {loading ? (
              <>
                <Loader2 size={15} style={{ animation: 'spin 0.8s linear infinite' }} />
                Entrando...
              </>
            ) : 'Entrar'}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: '0.72rem', color: '#8a7060', marginTop: 28, lineHeight: 1.5 }}>
          Acceso exclusivo para Victoria.<br />
          Si olvidaste tu contraseña, restablécela desde el panel de Supabase.
        </p>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input:disabled { opacity: 0.6; }
      `}</style>
    </div>
  )
}

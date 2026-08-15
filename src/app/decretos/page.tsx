'use client'

import { useState } from 'react'

const DECRETOS = [
  'Yo soy gratitud',
  'Yo soy abundancia',
  'Yo soy provisión',
  'Yo soy multiplicación',
  'Yo soy bendición',
  'Yo soy perfección',
]

type State = 'idle' | 'loading' | 'done' | 'error'

export default function DecretosPage() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<State>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setState('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/lead-magnet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error ?? 'Algo salió mal. Intenta de nuevo.')
        setState('error')
      } else {
        setState('done')
      }
    } catch {
      setErrorMsg('No se pudo conectar. Intenta de nuevo.')
      setState('error')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: '#FDF6EE',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      fontFamily: 'Georgia, "Times New Roman", serif',
    }}>

      <div style={{ maxWidth: 520, width: '100%' }}>

        {/* Brand */}
        <p style={{
          fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
          color: '#C49A5A', margin: '0 0 20px', textAlign: 'center',
        }}>
          El Universo de Victoria
        </p>

        {/* Ornament */}
        <div style={{ textAlign: 'center', fontSize: 22, color: '#C49A5A', marginBottom: 16 }}>✦</div>

        {/* Title */}
        <h1 style={{
          fontSize: 'clamp(26px, 5vw, 38px)', fontWeight: 'normal',
          color: '#2C1F10', textAlign: 'center', margin: '0 0 8px', lineHeight: 1.25,
        }}>
          Los 6 Decretos<br />
          <em>de Abundancia</em>
        </h1>

        <p style={{
          fontSize: 13, color: '#C49A5A', textAlign: 'center',
          letterSpacing: '0.06em', margin: '0 0 28px',
        }}>
          Método Conny Méndez · PDF gratuito
        </p>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
          <div style={{ flex: 1, height: 1, background: '#E8D5B0' }} />
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#C49A5A' }} />
          <div style={{ flex: 1, height: 1, background: '#E8D5B0' }} />
        </div>

        {/* Quote */}
        <p style={{
          fontStyle: 'italic', fontSize: 16, color: '#5C4530',
          textAlign: 'center', lineHeight: 1.6, margin: '0 0 28px',
        }}>
          "Todo lo que se bendice, aumenta."
        </p>

        {/* Description */}
        <p style={{
          fontSize: 14, color: '#5C4530', textAlign: 'center',
          lineHeight: 1.75, margin: '0 0 28px',
        }}>
          Si tu relación con el dinero es desde la tensión, la espera,
          o la sensación de que algo siempre falta — esta práctica
          es un punto de partida diferente.
        </p>

        {/* Decretos preview */}
        <div style={{
          background: '#F0DEB8', borderRadius: 12,
          padding: '20px 24px', marginBottom: 32,
        }}>
          <p style={{
            fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase',
            color: '#C49A5A', margin: '0 0 14px', textAlign: 'center',
          }}>
            Lo que encontrarás dentro
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {DECRETOS.map((d, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{
                  width: 22, height: 22, borderRadius: '50%',
                  background: '#C49A5A', color: '#FDF6EE',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 700, flexShrink: 0,
                  fontFamily: 'Helvetica, Arial, sans-serif',
                }}>
                  {i + 1}
                </span>
                <span style={{ fontSize: 15, color: '#2C1F10', fontStyle: 'italic' }}>{d}</span>
              </div>
            ))}
          </div>
          <p style={{
            fontSize: 12, color: '#5C4530', textAlign: 'center',
            margin: '16px 0 0', fontFamily: 'Helvetica, Arial, sans-serif',
          }}>
            + guía de cuándo usarlos · + práctica de 7 días
          </p>
        </div>

        {/* Form or success */}
        {state === 'done' ? (
          <div style={{
            background: '#F0DEB8', border: '1px solid #C49A5A',
            borderRadius: 12, padding: '28px 24px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 28, marginBottom: 12 }}>🤍</div>
            <p style={{ fontSize: 17, color: '#2C1F10', margin: '0 0 8px' }}>
              ¡Ya está en camino!
            </p>
            <p style={{ fontSize: 13, color: '#5C4530', margin: 0, lineHeight: 1.6 }}>
              Revisa tu bandeja de entrada — y también el spam,
              por si acaso. El PDF llega adjunto.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <label style={{
              fontSize: 12, color: '#5C4530', letterSpacing: '0.08em',
              textTransform: 'uppercase', fontFamily: 'Helvetica, Arial, sans-serif',
            }}>
              Tu email
            </label>
            <input
              type="email"
              required
              placeholder="tucorreo@ejemplo.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={state === 'loading'}
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '14px 16px', fontSize: 15,
                border: '1px solid #D4B896', borderRadius: 8,
                background: '#FFFAF4', color: '#2C1F10',
                outline: 'none', fontFamily: 'Georgia, serif',
                transition: 'border-color 150ms',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = '#C49A5A' }}
              onBlur={e => { e.currentTarget.style.borderColor = '#D4B896' }}
            />
            {state === 'error' && (
              <p style={{ fontSize: 13, color: '#B94040', margin: 0, fontFamily: 'Helvetica, Arial, sans-serif' }}>
                {errorMsg}
              </p>
            )}
            <button
              type="submit"
              disabled={state === 'loading' || !email.trim()}
              style={{
                width: '100%', padding: '15px', fontSize: 15,
                background: state === 'loading' ? '#D4B896' : '#C49A5A',
                color: '#FDF6EE', border: 'none', borderRadius: 8,
                cursor: state === 'loading' ? 'default' : 'pointer',
                fontFamily: 'Georgia, serif', fontStyle: 'italic',
                letterSpacing: '0.02em', transition: 'background 150ms',
              }}
            >
              {state === 'loading' ? 'Enviando...' : 'Enviarme el PDF gratis →'}
            </button>
            <p style={{
              fontSize: 11, color: '#9C7A55', textAlign: 'center', margin: 0,
              fontFamily: 'Helvetica, Arial, sans-serif', lineHeight: 1.5,
            }}>
              Sin spam. Solo tu PDF. Puedes darte de baja cuando quieras.
            </p>
          </form>
        )}

        {/* Footer */}
        <div style={{ marginTop: 40, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1, height: 1, background: '#E8D5B0' }} />
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#C49A5A' }} />
            <div style={{ flex: 1, height: 1, background: '#E8D5B0' }} />
          </div>
          <p style={{
            fontSize: 12, color: '#9C7A55', margin: 0,
            fontFamily: 'Helvetica, Arial, sans-serif',
          }}>
            @eluniversodevictoria
          </p>
        </div>

      </div>
    </div>
  )
}

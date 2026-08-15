import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminLeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ key?: string }>
}) {
  const { key } = await searchParams

  // Simple key-based protection
  if (key !== process.env.ADMIN_SECRET_KEY) {
    redirect('/')
  }

  const supabase = await createClient()

  const { count } = await supabase
    .from('pdf_leads')
    .select('*', { count: 'exact', head: true })

  const { data: recent } = await supabase
    .from('pdf_leads')
    .select('email, created_at')
    .order('created_at', { ascending: false })
    .limit(20)

  return (
    <div style={{
      minHeight: '100vh', background: '#FDF6EE',
      padding: '48px 24px', fontFamily: 'Georgia, serif',
    }}>
      <div style={{ maxWidth: 600, margin: '0 auto' }}>

        <p style={{
          fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase',
          color: '#C49A5A', margin: '0 0 8px',
          fontFamily: 'Helvetica, Arial, sans-serif',
        }}>
          Admin · El Universo de Victoria
        </p>
        <h1 style={{ fontSize: 28, fontWeight: 'normal', color: '#2C1F10', margin: '0 0 32px' }}>
          Leads del PDF
        </h1>

        {/* Counter */}
        <div style={{
          background: '#F0DEB8', borderRadius: 12,
          padding: '28px 32px', marginBottom: 32,
          display: 'flex', alignItems: 'center', gap: 24,
        }}>
          <div style={{
            fontSize: 56, fontWeight: 'normal', color: '#C49A5A', lineHeight: 1,
          }}>
            {count ?? 0}
          </div>
          <div>
            <div style={{ fontSize: 16, color: '#2C1F10' }}>personas</div>
            <div style={{ fontSize: 13, color: '#5C4530', fontFamily: 'Helvetica, Arial, sans-serif' }}>
              han descargado el PDF de decretos
            </div>
          </div>
        </div>

        {/* Recent emails */}
        <h2 style={{ fontSize: 16, fontWeight: 'normal', color: '#2C1F10', margin: '0 0 16px' }}>
          Últimas 20 descargas
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {recent?.map((lead, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              background: i % 2 === 0 ? '#FAF0E0' : '#FDF6EE',
              borderRadius: 7, padding: '10px 16px',
            }}>
              <span style={{
                fontSize: 14, color: '#2C1F10',
                fontFamily: 'Helvetica, Arial, sans-serif',
              }}>
                {lead.email}
              </span>
              <span style={{
                fontSize: 11, color: '#9C7A55',
                fontFamily: 'Helvetica, Arial, sans-serif',
              }}>
                {new Date(lead.created_at).toLocaleDateString('es-ES', {
                  day: 'numeric', month: 'short', year: 'numeric',
                })}
              </span>
            </div>
          ))}
          {(!recent || recent.length === 0) && (
            <p style={{ fontSize: 14, color: '#9C7A55', fontFamily: 'Helvetica, Arial, sans-serif' }}>
              Aún no hay descargas.
            </p>
          )}
        </div>

      </div>
    </div>
  )
}

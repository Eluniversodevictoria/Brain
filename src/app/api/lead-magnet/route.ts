import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'
import fs from 'fs'
import path from 'path'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Email inválido' }, { status: 400 })
    }

    const supabase = await createClient()

    // Save lead (ignore duplicate emails)
    const { error: dbError } = await supabase
      .from('pdf_leads')
      .upsert({ email: email.toLowerCase() }, { onConflict: 'email', ignoreDuplicates: true })

    if (dbError) {
      console.error('DB error:', dbError)
      // Continue anyway — still send the PDF
    }

    // Load PDF from public folder
    const pdfPath = path.join(process.cwd(), 'public', 'decretos-abundancia.pdf')
    const pdfBuffer = fs.readFileSync(pdfPath)
    const pdfBase64 = pdfBuffer.toString('base64')

    // Send email with PDF attached
    const { error: emailError } = await resend.emails.send({
      from: 'El Universo de Victoria <hola@eluniversodevictoria.com>',
      to: email,
      subject: '✨ Tus 6 Decretos de Abundancia',
      html: `
        <div style="font-family: Georgia, serif; max-width: 520px; margin: 0 auto; color: #2C1F10; background: #FDF6EE; padding: 40px 32px; border-radius: 12px;">
          <p style="font-size: 13px; color: #C49A5A; letter-spacing: 0.1em; text-transform: uppercase; margin: 0 0 8px;">El Universo de Victoria</p>
          <h1 style="font-size: 26px; font-weight: normal; margin: 0 0 20px; line-height: 1.3;">Los 6 Decretos de Abundancia</h1>
          <p style="font-size: 15px; line-height: 1.7; color: #5C4530;">
            Aquí está tu PDF. Guárdalo en tu teléfono para tenerlo siempre cerca.
          </p>
          <p style="font-size: 15px; line-height: 1.7; color: #5C4530;">
            Dentro encontrarás los seis decretos de Conny Méndez, cómo usarlos
            a lo largo del día, y una guía de 7 días para integrarlos como hábito.
          </p>
          <div style="background: #F0DEB8; border-radius: 8px; padding: 16px 20px; margin: 24px 0; font-style: italic; font-size: 15px; color: #2C1F10;">
            "Todo lo que se bendice, aumenta."
          </div>
          <p style="font-size: 14px; color: #5C4530; line-height: 1.7;">
            Si te sirvió, compártelo con alguien que también lo necesite. 🤍
          </p>
          <p style="font-size: 13px; color: #C49A5A; margin-top: 32px;">
            Con cariño,<br>
            <strong>El Universo de Victoria</strong><br>
            <a href="https://instagram.com/eluniversodevictoria" style="color: #C49A5A;">@eluniversodevictoria</a>
          </p>
        </div>
      `,
      attachments: [
        {
          filename: 'Decretos-Abundancia-Victoria.pdf',
          content: pdfBase64,
        },
      ],
    })

    if (emailError) {
      console.error('Email error:', emailError)
      return NextResponse.json({ error: 'No se pudo enviar el email' }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Lead magnet error:', err)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  host: 'sandbox.smtp.mailtrap.io',
  port: 587,                 // ✅ USE 587 (recommended)
  secure: false,             // ✅ MUST be false
  auth: {
    user: '3abc936c1f36e6',
    pass: 'e550af68c8a5a7'
  }
})

export default transporter

import EmailTemplate from '../models/EmailTemplate.js'
import transporter from '../utils/mailer.js'

class EmailService {
  async sendTemplateEmail({ to, templateSlug, variables = {}, cc = [], bcc = [] }) {
    console.log('🔍 EmailService - Looking for template:', templateSlug)
    
    const template = await EmailTemplate.findOne({
      where: { slug: templateSlug, isActive: true }
    })

    if (!template) {
      console.error('❌ Template not found:', templateSlug)
      throw new Error(`Email template '${templateSlug}' not found`)
    }

    console.log('✅ Template found:', template.name)
    console.log('📝 Template subject:', template.subject)
    console.log('📝 Template body preview:', template.body.substring(0, 100))
    console.log('📦 Variables received:', variables)

    let subject = template.subject
    let body = template.body

    // Replace variables {{name}}, {{email}}, etc.
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      console.log(`🔄 Replacing {{${key}}} with:`, variables[key].substring(0, 50))
      subject = subject.replace(regex, variables[key])
      body = body.replace(regex, variables[key])
    })

    console.log('📧 Final subject:', subject)
    console.log('📧 Final body preview:', body.substring(0, 200))

    // Prepare mail options
    const mailOptions = {
      from: '"CRM System" <no-reply@example.com>',
      to,
      subject,
      html: body
    }

    // Add CC if provided
    if (cc && cc.length > 0) {
      mailOptions.cc = cc.join(', ')
    }

    // Add BCC if provided
    if (bcc && bcc.length > 0) {
      mailOptions.bcc = bcc.join(', ')
    }

    console.log('📧 Sending email:', {
      to: mailOptions.to,
      cc: mailOptions.cc || 'none',
      bcc: mailOptions.bcc || 'none',
      subject: mailOptions.subject
    })

    try {
      const info = await transporter.sendMail(mailOptions)
      console.log('✅ Email sent successfully!')
      console.log('📬 Message ID:', info.messageId)
      return true
    } catch (error) {
      console.error('❌ Transporter error:', error)
      throw error
    }
  }

  async createTemplate(data) {
    return await EmailTemplate.create(data)
  }

  async getTemplates() {
    return await EmailTemplate.findAll({ order: [['createdAt', 'DESC']] })
  }

  async updateTemplate(id, data) {
    const template = await EmailTemplate.findByPk(id)
    if (!template) throw new Error('Template not found')

    await template.update(data)
    return template
  }

  async deleteTemplate(id) {
    const template = await EmailTemplate.findByPk(id)
    if (!template) throw new Error('Template not found')

    await template.destroy()
    return true
  }
}

export default new EmailService()
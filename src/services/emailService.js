import EmailTemplate from '../models/EmailTemplate.js'
import transporter from '../utils/mailer.js'

class EmailService {
  // -----------------------------------------
  // SEND EMAIL USING TEMPLATE
  // -----------------------------------------
  async sendTemplateEmail({ to, templateSlug, variables = {} }) {
    const template = await EmailTemplate.findOne({
      where: { slug: templateSlug, isActive: true }
    })

    if (!template) throw new Error('Email template not found')

    let subject = template.subject
    let body = template.body

    // Replace variables {{name}}, {{email}}
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      subject = subject.replace(regex, variables[key])
      body = body.replace(regex, variables[key])
    })

    await transporter.sendMail({
      from: '"CRM System" <no-reply@example.com>',
      to,
      subject,
      html: body
    })

    return true
  }

  // -----------------------------------------
  // CREATE TEMPLATE
  // -----------------------------------------
  async createTemplate(data) {
    return await EmailTemplate.create(data)
  }

  // -----------------------------------------
  // GET ALL TEMPLATES
  // -----------------------------------------
  async getTemplates() {
    return await EmailTemplate.findAll({ order: [['createdAt', 'DESC']] })
  }

  // -----------------------------------------
  // UPDATE TEMPLATE
  // -----------------------------------------
  async updateTemplate(id, data) {
    const template = await EmailTemplate.findByPk(id)
    if (!template) throw new Error('Template not found')

    await template.update(data)
    return template
  }

  // -----------------------------------------
  // DELETE TEMPLATE
  // -----------------------------------------
  async deleteTemplate(id) {
    const template = await EmailTemplate.findByPk(id)
    if (!template) throw new Error('Template not found')

    await template.destroy()
    return true
  }
}

export default new EmailService()

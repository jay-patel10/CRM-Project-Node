import EmailService from '../services/emailService.js'

export const sendEmail = async (req, res) => {
  try {
    const { to, templateSlug, variables } = req.body

    await EmailService.sendTemplateEmail({
      to,
      templateSlug,
      variables
    })

    res.json({ success: true, message: 'Email sent successfully' })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export const getTemplates = async (req, res) => {
  try {
    const templates = await EmailService.getTemplates()
    res.json({ success: true, templates })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

export const createTemplate = async (req, res) => {
  try {
    const template = await EmailService.createTemplate(req.body)
    res.status(201).json({ success: true, template })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export const updateTemplate = async (req, res) => {
  try {
    const template = await EmailService.updateTemplate(req.params.id, req.body)
    res.json({ success: true, template })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export const deleteTemplate = async (req, res) => {
  try {
    await EmailService.deleteTemplate(req.params.id)
    res.json({ success: true, message: 'Template deleted' })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

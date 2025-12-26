import EmailService from '../services/emailService.js'

export const sendEmail = async (req, res) => {
  try {
    const { to, templateSlug, variables, cc, bcc } = req.body

    console.log('📧 Email Controller - Received request:', {
      to,
      templateSlug,
      hasVariables: !!variables,
      cc: cc || 'none',
      bcc: bcc || 'none'
    })

    // Validate required fields
    if (!to) {
      return res.status(400).json({ 
        success: false, 
        message: 'Recipient email (to) is required' 
      })
    }

    if (!templateSlug) {
      return res.status(400).json({ 
        success: false, 
        message: 'Template slug is required' 
      })
    }

    // Send email with CC/BCC support
   await EmailService.sendTemplateEmail({
  to,
  templateSlug,
  variables: variables || {},
  cc: Array.isArray(cc) ? cc : [],
  bcc: Array.isArray(bcc) ? bcc : []
})


    console.log('✅ Email sent successfully')

    res.json({ success: true, message: 'Email sent successfully' })
  } catch (error) {
    console.error('❌ Email Controller Error:', error)
    res.status(400).json({ success: false, message: error.message })
  }
}

export const getTemplates = async (req, res) => {
  try {
    const templates = await EmailService.getTemplates()
    res.json({ success: true, templates })
  } catch (error) {
    console.error('❌ Get Templates Error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

export const createTemplate = async (req, res) => {
  try {
    const template = await EmailService.createTemplate(req.body)
    res.status(201).json({ success: true, template })
  } catch (error) {
    console.error('❌ Create Template Error:', error)
    res.status(400).json({ success: false, message: error.message })
  }
}

export const updateTemplate = async (req, res) => {
  try {
    const template = await EmailService.updateTemplate(req.params.id, req.body)
    res.json({ success: true, template })
  } catch (error) {
    console.error('❌ Update Template Error:', error)
    res.status(400).json({ success: false, message: error.message })
  }
}

export const deleteTemplate = async (req, res) => {
  try {
    await EmailService.deleteTemplate(req.params.id)
    res.json({ success: true, message: 'Template deleted' })
  } catch (error) {
    console.error('❌ Delete Template Error:', error)
    res.status(400).json({ success: false, message: error.message })
  }
}
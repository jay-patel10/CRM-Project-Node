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
    if (!to || !to.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Recipient email (to) is required' 
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid recipient email format' 
      })
    }

    if (!templateSlug || !templateSlug.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Template slug is required' 
      })
    }

    // Send email with CC/BCC support
    await EmailService.sendTemplateEmail({
      to: to.trim(),
      templateSlug: templateSlug.trim(),
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
    const { name, slug, subject, body, variables, isActive } = req.body

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Template name is required' 
      })
    }

    if (!slug || !slug.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Slug is required' 
      })
    }

    // Validate slug format
    if (!/^[a-z0-9-]+$/.test(slug)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Slug can only contain lowercase letters, numbers, and hyphens' 
      })
    }

    if (!subject || !subject.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Subject is required' 
      })
    }

    if (!body || !body.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email body is required' 
      })
    }

    // Ensure variables is an array
    const templateVariables = Array.isArray(variables) ? variables : []

    const template = await EmailService.createTemplate({
      name: name.trim(),
      slug: slug.trim(),
      subject: subject.trim(),
      body: body.trim(),
      variables: templateVariables,
      isActive: isActive !== undefined ? isActive : true
    })

    res.status(201).json({ success: true, template })
  } catch (error) {
    console.error('❌ Create Template Error:', error)
    
    // Handle unique constraint errors
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        success: false, 
        message: 'A template with this name or slug already exists' 
      })
    }

    res.status(400).json({ success: false, message: error.message })
  }
}

export const updateTemplate = async (req, res) => {
  try {
    const { id } = req.params
    const { name, slug, subject, body, variables, isActive } = req.body

    // Validation
    if (!name || !name.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Template name is required' 
      })
    }

    if (!slug || !slug.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Slug is required' 
      })
    }

    if (!/^[a-z0-9-]+$/.test(slug)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Slug can only contain lowercase letters, numbers, and hyphens' 
      })
    }

    if (!subject || !subject.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Subject is required' 
      })
    }

    if (!body || !body.trim()) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email body is required' 
      })
    }

    const templateVariables = Array.isArray(variables) ? variables : []

    const template = await EmailService.updateTemplate(id, {
      name: name.trim(),
      slug: slug.trim(),
      subject: subject.trim(),
      body: body.trim(),
      variables: templateVariables,
      isActive: isActive !== undefined ? isActive : true
    })

    res.json({ success: true, template })
  } catch (error) {
    console.error('❌ Update Template Error:', error)

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({ 
        success: false, 
        message: 'A template with this name or slug already exists' 
      })
    }

    if (error.message === 'Template not found') {
      return res.status(404).json({ 
        success: false, 
        message: 'Template not found' 
      })
    }

    res.status(400).json({ success: false, message: error.message })
  }
}

export const deleteTemplate = async (req, res) => {
  try {
    const { id } = req.params

    await EmailService.deleteTemplate(id)
    res.json({ success: true, message: 'Template deleted successfully' })
  } catch (error) {
    console.error('❌ Delete Template Error:', error)

    if (error.message === 'Template not found') {
      return res.status(404).json({ 
        success: false, 
        message: 'Template not found' 
      })
    }

    res.status(400).json({ success: false, message: error.message })
  }
}
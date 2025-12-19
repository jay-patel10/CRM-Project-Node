import express from 'express'
import {
  sendEmail,
  getTemplates,
  createTemplate,
  updateTemplate,
  deleteTemplate
} from '../controllers/emailController.js'

const router = express.Router()

// ============================
// SEND EMAIL (TESTING MODE)
// ============================
router.post('/send', sendEmail)

// ============================
// EMAIL TEMPLATES CRUD
// ============================

// Get all templates
router.get('/', getTemplates)

// Create template
router.post('/', createTemplate)

// Update template
router.put('/:id', updateTemplate)

// Delete template
router.delete('/:id', deleteTemplate)

export default router

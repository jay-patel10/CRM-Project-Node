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
// SEND EMAIL (PROTECTED)
// ============================
router.post('/send',  sendEmail)

// ============================
// EMAIL TEMPLATES CRUD
// ============================

// Get all templates
router.get('/templates',getTemplates)

// Create template
router.post('/templates', createTemplate)

// Update template
router.put('/:id', updateTemplate)

// Delete template
router.delete('/templates/:id', deleteTemplate)

export default router
import express from 'express'
import {
  sendEmail,
  getTemplates,
  updateTemplate,
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

// Update template
router.put('/templates/:id', updateTemplate)


export default router
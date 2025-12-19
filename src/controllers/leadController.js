
import leadService from '../services/leadService.js'

export const getLeads = async (req, res) => {
  try {
    const { status, assignedTo, source, search } = req.query
    
    const leads = await leadService.getAllLeads({
      status,
      assignedTo,
      source,
      search
    })

    res.json({
      success: true,
      leads
    })
  } catch (error) {
    console.error('Get leads error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leads'
    })
  }
}

export const getLeadById = async (req, res) => {
  try {
    const { id } = req.params
    const lead = await leadService.getLeadById(id)

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      })
    }

    res.json({
      success: true,
      lead
    })
  } catch (error) {
    console.error('Get lead error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lead'
    })
  }
}

export const createLead = async (req, res) => {
  try {
    const { name, email, phone, company, statusId, source, assignedToId, notes, utmSource, utmMedium, utmCampaign, apiSource } = req.body

    // Validation
    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and email are required'
      })
    }

    const lead = await leadService.createLead({
      name,
      email,
      phone,
      company,
      statusId: statusId || 1,
      source,
      assignedToId: assignedToId || null,
      notes,
      utmSource,
      utmMedium,
      utmCampaign,
      apiSource
    })

    res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      lead
    })
  } catch (error) {
    console.error('Create lead error:', error)
    
    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        success: false,
        message: 'Lead with this email already exists'
      })
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create lead'
    })
  }
}

export const updateLead = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    const lead = await leadService.updateLead(id, updateData)

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      })
    }

    res.json({
      success: true,
      message: 'Lead updated successfully',
      lead
    })
  } catch (error) {
    console.error('Update lead error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to update lead'
    })
  }
}

export const deleteLead = async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await leadService.deleteLead(id)

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found'
      })
    }

    res.json({
      success: true,
      message: 'Lead deleted successfully'
    })
  } catch (error) {
    console.error('Delete lead error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to delete lead'
    })
  }
}

export const getLeadStatuses = async (req, res) => {
  try {
    const statuses = await leadService.getLeadStatuses()

    res.json({
      success: true,
      statuses
    })
  } catch (error) {
    console.error('Get lead statuses error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch lead statuses'
    })
  }
}

export const getMyLeads = async (req, res) => {
  try {
    // Log incoming user from token
    console.log("🔐 [getMyLeads] req.user =", req.user);

    const userId = req.user.id;

    console.log("🆔 [getMyLeads] Extracted userId =", userId);

    const leads = await leadService.getMyLeads(userId);

    console.log("📦 [getMyLeads] Leads returned FROM SERVICE =", leads);

    res.json({
      success: true,
      leads
    });
  } catch (error) {
    console.error('❌ Get my leads error:', error);

    res.status(500).json({
      success: false,
      message: 'Failed to fetch my leads'
    });
  }
};

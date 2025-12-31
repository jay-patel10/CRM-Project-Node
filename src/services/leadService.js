import Lead from '../models/Lead.js'
import LeadStatus from '../models/LeadStatus.js'
import User from '../models/User.js'
import { Op } from 'sequelize'

class LeadService {

  // ================================
  // GET ALL LEADS WITH FILTERS
  // ================================
  async getAllLeads(filters = {}) {
    const { status, assignedTo, source, search } = filters

    const whereClause = {}

    if (status) whereClause.statusId = status
    if (assignedTo) whereClause.assignedToId = assignedTo
    if (source) whereClause.source = source

    // Search across name, email, company
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { company: { [Op.like]: `%${search}%` } }
      ]
    }

    const leads = await Lead.findAll({
      where: whereClause,
      include: [
        {
          model: LeadStatus,
          as: 'status',
          attributes: ['id', 'name', 'color']
        },
        {
          model: User,
          as: 'assignedUser',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['createdAt', 'DESC']]
    })

    return leads.map(lead => ({
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      statusId: lead.statusId,

      status: lead.status?.name || 'Unknown',
      statusColor: lead.status?.color || 'primary',

      source: lead.source,
      assignedToId: lead.assignedToId,
      assignedTo: lead.assignedUser?.name || 'Unassigned',
      assignedToEmail: lead.assignedUser?.email || null,

      customFields: lead.customFields || {},

      notes: lead.notes,

      utmSource: lead.utmSource,
      utmMedium: lead.utmMedium,
      utmCampaign: lead.utmCampaign,

      apiSource: lead.apiSource,

      createdAt: lead.createdAt
    }))
  }

  // ================================
  // GET LEAD BY ID
  // ================================
  async getLeadById(id) {
    const lead = await Lead.findByPk(id, {
      include: [
        {
          model: LeadStatus,
          as: 'status',
          attributes: ['id', 'name', 'color']
        },
        {
          model: User,
          as: 'assignedUser',
          attributes: ['id', 'name', 'email']
        }
      ]
    })

    if (!lead) return null

    return {
      id: lead.id,
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      statusId: lead.statusId,

      status: lead.status?.name || 'Unknown',
      statusColor: lead.status?.color || 'primary',

      source: lead.source,
      assignedToId: lead.assignedToId,
      assignedTo: lead.assignedUser?.name || 'Unassigned',
      assignedToEmail: lead.assignedUser?.email || null,

      customFields: lead.customFields || {},

      notes: lead.notes,

      utmSource: lead.utmSource,
      utmMedium: lead.utmMedium,
      utmCampaign: lead.utmCampaign,

      apiSource: lead.apiSource,

      createdAt: lead.createdAt
    }
  }

    // ================================
  // GET LEADS ASSIGNED TO LOGGED-IN USER
  // ================================
  async getMyLeads(userId) {
  console.log("🆔 [SERVICE] Received userId =", userId);

  console.log("🔍 [SERVICE] Running query: Find leads WHERE assignedToId =", userId);

  const leads = await Lead.findAll({
    where: { assignedToId: userId },
    include: [
      {
        model: LeadStatus,
        as: 'status',
        attributes: ['id', 'name', 'color']
      },
      {
        model: User,
        as: 'assignedUser',
        attributes: ['id', 'name', 'email']
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  console.log("📊 [SERVICE] Raw DB leads =", leads);

  const formatted = leads.map(lead => ({
    id: lead.id,
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    company: lead.company,
    statusId: lead.statusId,

    status: lead.status?.name || 'Unknown',
    statusColor: lead.status?.color || 'primary',

    source: lead.source,
    assignedToId: lead.assignedToId,
    assignedTo: lead.assignedUser?.name || 'Unassigned',
    assignedToEmail: lead.assignedUser?.email || null,

    customFields: lead.customFields || {},
    notes: lead.notes,

    utmSource: lead.utmSource,
    utmMedium: lead.utmMedium,
    utmCampaign: lead.utmCampaign,

    apiSource: lead.apiSource,

    createdAt: lead.createdAt
  }));

  console.log("📦 [SERVICE] Formatted mapped leads =", formatted);

  return formatted;
}


  // ================================
  // CREATE LEAD
  // ================================
  async createLead(data) {
    const lead = await Lead.create({
      name: data.name,
      email: data.email,
      phone: data.phone,
      company: data.company,

      statusId: data.statusId,
      source: data.source,

      assignedToId: data.assignedToId || null,

      notes: data.notes || null,
      customFields: data.customFields || {},

      utmSource: data.utmSource || null,
      utmMedium: data.utmMedium || null,
      utmCampaign: data.utmCampaign || null,

      apiSource: data.apiSource || 'manual'
    })

    return this.getLeadById(lead.id)
  }

  // ================================
  // UPDATE LEAD
  // ================================
  async updateLead(id, data) {
    const lead = await Lead.findByPk(id)
    if (!lead) return null

    await lead.update({
      name: data.name,
      email: data.email,
      phone: data.phone,
      company: data.company,

      statusId: data.statusId,
      source: data.source,

      assignedToId: data.assignedToId,

      notes: data.notes,
      customFields: data.customFields,

      utmSource: data.utmSource,
      utmMedium: data.utmMedium,
      utmCampaign: data.utmCampaign,

      apiSource: data.apiSource
    })

    return this.getLeadById(id)
  }

  // ================================
  // DELETE LEAD
  // ================================
  async deleteLead(id) {
    const lead = await Lead.findByPk(id)
    if (!lead) return false

    await lead.destroy()
    return true
  }

  // ================================
  // GET ALL LEAD STATUSES
  // ================================
  async getLeadStatuses() {
    return await LeadStatus.findAll({
      where: { isActive: true },
      attributes: ['id', 'name', 'color'],
      order: [['id', 'ASC']]
    })
  }

  async getLeadStatistics() {
    try {
      // Total leads
      const totalLeads = await Lead.count()

      // Leads with UTM data
      const withUTM = await Lead.count({
        where: {
          [Op.or]: [
            { utmSource: { [Op.ne]: null } },
            { utmMedium: { [Op.ne]: null } },
            { utmCampaign: { [Op.ne]: null } }
          ]
        }
      })

      // Top sources - Get raw data with count
      const sourcesRaw = await Lead.findAll({
        attributes: [
          'source',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        where: {
          source: { [Op.ne]: null }
        },
        group: ['source'],
        order: [[sequelize.literal('count'), 'DESC']],
        limit: 5,
        raw: true
      })

      // Format sources
      const sources = sourcesRaw.map(s => ({
        name: s.source || 'Unknown',
        count: parseInt(s.count) || 0
      }))

      return {
        totalLeads,
        withUTM,
        sources
      }
    } catch (error) {
      console.error('Error fetching lead statistics:', error)
      throw error
    }
  }
}



export default new LeadService()

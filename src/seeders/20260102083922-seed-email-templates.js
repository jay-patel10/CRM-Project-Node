export const up = async (queryInterface) => {
  const now = new Date()

  await queryInterface.bulkInsert(
    'email_templates',
    [
      {
        id: 1,
        name: 'Welcome Email',
        slug: 'welcome-email',
        subject: 'Welcome to {{company_name}}, {{name}}!',
        body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background: #f9fafb;">
          <div style="background: #ffffff; padding: 32px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #7367F0; margin-top: 0;">Welcome to {{company_name}}!</h2>
            <p style="color: #333333; font-size: 16px; line-height: 1.6;">Hi {{name}},</p>
            <p style="color: #333333; font-size: 16px; line-height: 1.6;">
              Thank you for joining us! We're excited to have you on board.
            </p>
            <p style="color: #333333; font-size: 16px; line-height: 1.6;">
              Your registered email is: <strong>{{email}}</strong>
            </p>
            <div style="margin: 32px 0; text-align: center;">
              <a href="{{dashboard_link}}" 
                 style="display: inline-block; padding: 12px 32px; background: #7367F0; color: #ffffff; 
                        text-decoration: none; border-radius: 6px; font-weight: 500;">
                Go to Dashboard
              </a>
            </div>
            <p style="color: #666666; font-size: 14px; line-height: 1.6;">
              If you have any questions, feel free to reach out to our support team.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              © {{year}} {{company_name}}. All rights reserved.
            </p>
          </div>
        </div>
        `,
        variables: JSON.stringify(['name', 'email', 'company_name', 'dashboard_link', 'year']),
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 2,
        name: 'Lead Assignment Notification',
        slug: 'lead-assignment',
        subject: 'New Lead Assigned: {{lead_name}}',
        body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <div style="background: #ffffff; padding: 32px; border-radius: 8px; border: 1px solid #e5e7eb;">
            <h2 style="color: #10b981; margin-top: 0;">🎯 New Lead Assigned</h2>
            <p style="color: #333333; font-size: 16px;">Hi {{agent_name}},</p>
            <p style="color: #333333; font-size: 16px;">A new lead has been assigned to you:</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 6px; margin: 20px 0;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Lead Name:</td>
                  <td style="padding: 8px 0; color: #111827;">{{lead_name}}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Email:</td>
                  <td style="padding: 8px 0; color: #111827;">{{lead_email}}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Company:</td>
                  <td style="padding: 8px 0; color: #111827;">{{lead_company}}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Source:</td>
                  <td style="padding: 8px 0; color: #111827;">{{lead_source}}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #6b7280; font-weight: 500;">Phone:</td>
                  <td style="padding: 8px 0; color: #111827;">{{lead_phone}}</td>
                </tr>
              </table>
            </div>
            
            <p style="color: #333333; font-size: 16px;">
              Please follow up with this lead at your earliest convenience.
            </p>
            
            <div style="margin: 24px 0; text-align: center;">
              <a href="{{lead_link}}" 
                 style="display: inline-block; padding: 12px 32px; background: #7367F0; color: #ffffff; 
                        text-decoration: none; border-radius: 6px; font-weight: 500;">
                View Lead Details
              </a>
            </div>
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 32px;">
              CRM System Notification
            </p>
          </div>
        </div>
        `,
        variables: JSON.stringify([
          'agent_name',
          'lead_name',
          'lead_email',
          'lead_company',
          'lead_source',
          'lead_phone',
          'lead_link'
        ]),
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 3,
        name: 'Password Reset',
        slug: 'password-reset',
        subject: 'Reset Your Password - {{company_name}}',
        body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <div style="background: #ffffff; padding: 32px; border-radius: 8px; border: 1px solid #e5e7eb;">
            <h2 style="color: #ef4444; margin-top: 0;">🔐 Password Reset Request</h2>
            <p style="color: #333333; font-size: 16px;">Hi {{name}},</p>
            <p style="color: #333333; font-size: 16px; line-height: 1.6;">
              We received a request to reset your password for your {{company_name}} account.
            </p>
            <p style="color: #333333; font-size: 16px; line-height: 1.6;">
              Click the button below to reset your password:
            </p>
            
            <div style="margin: 32px 0; text-align: center;">
              <a href="{{reset_link}}" 
                 style="display: inline-block; padding: 14px 40px; background: #7367F0; color: #ffffff; 
                        text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
                Reset Password
              </a>
            </div>
            
            <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin: 24px 0;">
              <p style="color: #991b1b; margin: 0; font-size: 14px;">
                ⚠️ This link will expire in <strong>15 minutes</strong>.
              </p>
            </div>
            
            <p style="color: #666666; font-size: 14px; line-height: 1.6;">
              If you didn't request this password reset, please ignore this email. Your password will remain unchanged.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              © {{year}} {{company_name}}. All rights reserved.
            </p>
          </div>
        </div>
        `,
        variables: JSON.stringify(['name', 'company_name', 'reset_link', 'year']),
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 4,
        name: 'Lead Status Update',
        slug: 'lead-status-update',
        subject: 'Lead Status Updated: {{lead_name}}',
        body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <div style="background: #ffffff; padding: 32px; border-radius: 8px; border: 1px solid #e5e7eb;">
            <h2 style="color: #f59e0b; margin-top: 0;">📊 Lead Status Update</h2>
            <p style="color: #333333; font-size: 16px;">Hi {{agent_name}},</p>
            <p style="color: #333333; font-size: 16px;">
              The status of lead <strong>{{lead_name}}</strong> has been updated:
            </p>
            
            <div style="background: #f3f4f6; padding: 24px; border-radius: 6px; margin: 24px 0;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;">
                <div style="text-align: center; flex: 1;">
                  <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase;">Previous Status</p>
                  <span style="display: inline-block; padding: 6px 16px; background: #e5e7eb; color: #374151; 
                               border-radius: 4px; font-weight: 500;">{{old_status}}</span>
                </div>
                <div style="flex: 0; padding: 0 16px;">
                  <span style="color: #9ca3af; font-size: 24px;">→</span>
                </div>
                <div style="text-align: center; flex: 1;">
                  <p style="color: #6b7280; font-size: 12px; margin: 0 0 8px 0; text-transform: uppercase;">New Status</p>
                  <span style="display: inline-block; padding: 6px 16px; background: #10b981; color: #ffffff; 
                               border-radius: 4px; font-weight: 500;">{{new_status}}</span>
                </div>
              </div>
              
              <hr style="border: none; border-top: 1px solid #d1d5db; margin: 16px 0;">
              
              <p style="color: #6b7280; font-size: 14px; margin: 8px 0;">
                <strong>Updated By:</strong> {{updated_by}}
              </p>
              <p style="color: #6b7280; font-size: 14px; margin: 8px 0;">
                <strong>Updated At:</strong> {{updated_at}}
              </p>
            </div>
            
            <div style="margin: 24px 0; text-align: center;">
              <a href="{{lead_link}}" 
                 style="display: inline-block; padding: 12px 32px; background: #7367F0; color: #ffffff; 
                        text-decoration: none; border-radius: 6px; font-weight: 500;">
                View Lead
              </a>
            </div>
            
            <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 32px;">
              CRM System Notification
            </p>
          </div>
        </div>
        `,
        variables: JSON.stringify([
          'agent_name',
          'lead_name',
          'old_status',
          'new_status',
          'updated_by',
          'updated_at',
          'lead_link'
        ]),
        isActive: true,
        createdAt: now,
        updatedAt: now
      },
      {
        id: 5,
        name: 'Generic Email',
        slug: 'generic-email',
        subject: '{{subject}}',
        body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <div style="background: #ffffff; padding: 32px; border-radius: 8px; border: 1px solid #e5e7eb;">
            <h2 style="color: #7367F0; margin-top: 0;">{{subject}}</h2>
            <div style="color: #333333; font-size: 16px; line-height: 1.6;">
              {{body}}
            </div>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
            <p style="color: #9ca3af; font-size: 12px; text-align: center;">
              © {{year}} CRM System. All rights reserved.
            </p>
          </div>
        </div>
        `,
        variables: JSON.stringify(['subject', 'body', 'year']),
        isActive: true,
        createdAt: now,
        updatedAt: now
      }
    ],
    {
      updateOnDuplicate: ['subject', 'body', 'variables', 'isActive', 'updatedAt']
    }
  )
}

export const down = async (queryInterface) => {
  await queryInterface.bulkDelete('email_templates', {
    slug: [
      'welcome-email',
      'lead-assignment',
      'password-reset',
      'lead-status-update',
      'generic-email'
    ]
  })
}
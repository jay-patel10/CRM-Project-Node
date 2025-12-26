import EmailTemplate from '../models/EmailTemplate.js'

export const up = async () => {
  await EmailTemplate.bulkCreate(
    [
      {
        name: 'Password Reset',
        slug: 'password-reset',
        subject: 'Reset Your Password',
        body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2>Password Reset Request</h2>
          <p>Hi {{name}},</p>
          <p>You requested to reset your password.</p>
          <a href="{{resetLink}}"
             style="display:inline-block;padding:12px 24px;background:#7367F0;color:#fff;text-decoration:none;border-radius:4px;">
            Reset Password
          </a>
          <p style="font-size:13px;color:#999;">Link expires in 15 minutes.</p>
        </div>
        `,
        variables: ['name', 'resetLink'],
        isActive: true
      },
      {
        name: 'Generic Email',
        slug: 'generic-email',
        subject: '{{subject}}',
        body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin:auto; padding: 24px; border:1px solid #e5e7eb;">
          <h2>{{subject}}</h2>
          <div style="margin-top:16px;">{{body}}</div>
          <hr />
          <p style="font-size:12px;color:#9ca3af;">CRM System</p>
        </div>
        `,
        variables: ['subject', 'body'],
        isActive: true
      }
    ],
    {
      validate: false,   // 🔥 THIS IS THE KEY
      ignoreDuplicates: true
    }
  )
}

export const down = async () => {
  await EmailTemplate.destroy({
    where: {
      slug: ['password-reset', 'generic-email']
    }
  })
}

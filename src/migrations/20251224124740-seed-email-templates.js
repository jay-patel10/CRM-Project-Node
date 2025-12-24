export const up = async (queryInterface, Sequelize) => {
  // 🔹 Remove existing templates first (if any)
  await queryInterface.bulkDelete('email_templates', {
    slug: ['password-reset', 'generic-email']
  })

  // 🔹 Insert fresh data
  await queryInterface.bulkInsert('email_templates', [
    {
      name: 'Password Reset',
      slug: 'password-reset',
      subject: 'Reset Your Password',
      body: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hi {{name}},</p>
        <p>You requested to reset your password. Click the button below to reset it:</p>
        <a href="{{resetLink}}"
           style="display: inline-block; padding: 12px 24px; background-color: #7367F0;
           color: white; text-decoration: none; border-radius: 4px; margin: 20px 0;">
          Reset Password
        </a>
        <p>This link will expire in 15 minutes.</p>
        <p>If you didn’t request this, please ignore this email.</p>
        <p>Thanks,<br/>CRM Team</p>
      </div>
      `,
      variables: JSON.stringify(['name', 'resetLink']),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      name: 'Generic Email',
      slug: 'generic-email',
      subject: '{{subject}}',
      body: `
      <div style="font-family: Arial;">
        {{body}}
      </div>
      `,
      variables: JSON.stringify(['subject', 'body']),
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ])
}

export const down = async queryInterface => {
  await queryInterface.bulkDelete('email_templates', {
    slug: ['password-reset', 'generic-email']
  })
}

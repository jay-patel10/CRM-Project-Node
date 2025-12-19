export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('subscriptions', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    planId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'subscription_plans',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    status: {
      type: Sequelize.ENUM('active', 'cancelled', 'expired', 'pending'),
      defaultValue: 'pending'
    },
    startDate: {
      type: Sequelize.DATE,
      allowNull: true
    },
    endDate: {
      type: Sequelize.DATE,
      allowNull: true
    },
    stripeSubscriptionId: {
      type: Sequelize.STRING,
      allowNull: true
    },
    greenpaySubscriptionId: {
      type: Sequelize.STRING,
      allowNull: true
    },
    autoRenew: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false
    },
    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false
    }
  });
};

export const down = async (queryInterface) => {
  await queryInterface.dropTable('subscriptions');
};

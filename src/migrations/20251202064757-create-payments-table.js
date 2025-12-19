export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('payments', {
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
    subscriptionId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'subscriptions',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    amount: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: Sequelize.STRING(3),
      defaultValue: 'INR'
    },
    gateway: {
      type: Sequelize.ENUM('stripe', 'greenpay'),
      allowNull: false
    },
    gatewayTransactionId: {
      type: Sequelize.STRING,
      allowNull: true
    },
    status: {
      type: Sequelize.ENUM('pending', 'success', 'failed', 'refunded'),
      defaultValue: 'pending'
    },
    metadata: {
      type: Sequelize.JSON,
      allowNull: true
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
  await queryInterface.dropTable('payments');
};

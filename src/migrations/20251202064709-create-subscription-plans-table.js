export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('subscription_plans', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING(100),
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    price: {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    },
    currency: {
      type: Sequelize.STRING(3),
      defaultValue: 'INR'
    },
    billingCycle: {
      type: Sequelize.ENUM('monthly', 'yearly', 'lifetime'),
      defaultValue: 'monthly'
    },
    features: {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: []
    },
    stripePriceId: {
      type: Sequelize.STRING,
      allowNull: true
    },
    isActive: {
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
  await queryInterface.dropTable('subscription_plans');
};

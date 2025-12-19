export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('leads', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING(100),
      allowNull: false
    },
    email: {
      type: Sequelize.STRING(100),
      allowNull: false
    },
    phone: {
      type: Sequelize.STRING(20),
      allowNull: true
    },
    company: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    statusId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'lead_statuses',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    source: {
      type: Sequelize.STRING(50),
      allowNull: true
    },
    assignedToId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    notes: {
      type: Sequelize.TEXT,
      allowNull: true
    },
    customFields: {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: {}
    },
    utmSource: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    utmMedium: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    utmCampaign: {
      type: Sequelize.STRING(100),
      allowNull: true
    },
    apiSource: {
      type: Sequelize.STRING(50),
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
  await queryInterface.dropTable('leads');
};

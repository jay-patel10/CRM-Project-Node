export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('activity_logs', {
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
    action: {
      type: Sequelize.STRING(50),
      allowNull: false
    },
    module: {
      type: Sequelize.STRING(50),
      allowNull: false
    },
    recordId: {
      type: Sequelize.INTEGER,
      allowNull: true
    },
    details: {
      type: Sequelize.JSON,
      allowNull: true
    },
    ipAddress: {
      type: Sequelize.STRING(45),
      allowNull: true
    },
    userAgent: {
      type: Sequelize.STRING,
      allowNull: true
    },
    createdAt: {
      type: Sequelize.DATE,
      allowNull: false
    }
  });
};

export const down = async (queryInterface) => {
  await queryInterface.dropTable('activity_logs');
};

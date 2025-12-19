export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('lead_statuses', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING(50),
      allowNull: false,
      unique: true
    },
    color: {
      type: Sequelize.STRING(7),
      allowNull: false,
      defaultValue: '#3B82F6'
    },
    order: {
      type: Sequelize.INTEGER,
      defaultValue: 0
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
  await queryInterface.dropTable('lead_statuses');
};

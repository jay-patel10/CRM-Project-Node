export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('roles', {
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
    description: {
      type: Sequelize.TEXT,
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
  })
}

export const down = async (queryInterface) => {
  await queryInterface.dropTable('roles')
}

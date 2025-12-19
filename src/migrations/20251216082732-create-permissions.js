export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('permissions', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    key: {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true
    },
    name: {
      type: Sequelize.STRING(100),
      allowNull: false
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

export const down = async queryInterface => {
  await queryInterface.dropTable('permissions')
}

export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('role_permissions', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    roleId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id'
      },
      onDelete: 'CASCADE'
    },
    permissionId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'permissions',
        key: 'id'
      },
      onDelete: 'CASCADE'
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
  await queryInterface.dropTable('role_permissions')
}

export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('api_keys', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },

    // 🔑 OWNER
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

    name: {
      type: Sequelize.STRING(100),
      allowNull: false
    },

    key: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },

    permissions: {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: ['leads:create']
    },

    isActive: {
      type: Sequelize.BOOLEAN,
      defaultValue: true
    },

    lastUsedAt: {
      type: Sequelize.DATE,
      allowNull: true
    },

    expiresAt: {
      type: Sequelize.DATE,
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

  // 🚀 Performance index
  await queryInterface.addIndex('api_keys', ['userId']);
};

export const down = async (queryInterface) => {
  await queryInterface.dropTable('api_keys');
};

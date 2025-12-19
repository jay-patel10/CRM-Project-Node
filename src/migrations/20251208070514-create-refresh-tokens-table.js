export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('refresh_tokens', {
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
      onDelete: 'CASCADE'     // If user is deleted → delete tokens
    },

    token: {
      type: Sequelize.STRING(500),
      allowNull: false
    },

    expiresAt: {
      type: Sequelize.DATE,
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
  });
};

export const down = async (queryInterface) => {
  await queryInterface.dropTable('refresh_tokens');
};

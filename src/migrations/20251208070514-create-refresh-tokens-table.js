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
      onDelete: 'CASCADE'
    },

    token: {
      type: Sequelize.STRING(500),
      allowNull: false
    },

    expiresAt: {
      type: Sequelize.DATE,
      allowNull: false
    },


    isPasswordReset: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },


    resetTokenId: {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: null
    },

    createdAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },

    updatedAt: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    }
  });
};

export const down = async (queryInterface) => {
  await queryInterface.dropTable('refresh_tokens');
};

export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('email_templates', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true
    },
    slug: {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true
    },
    subject: {
      type: Sequelize.STRING,
      allowNull: false
    },
    body: {
      type: Sequelize.TEXT,
      allowNull: false
    },
    variables: {
      type: Sequelize.JSON,
      allowNull: true,
      defaultValue: []
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
  await queryInterface.dropTable('email_templates');
};

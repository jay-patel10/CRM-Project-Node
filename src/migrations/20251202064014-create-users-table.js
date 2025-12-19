export const up = async (queryInterface, Sequelize) => {
  await queryInterface.createTable('users', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    email: {
      type: Sequelize.STRING(100),
      allowNull: false,
      unique: true
    },
    name: {
      type: Sequelize.STRING(100),
      allowNull: false
    },
    password: {
      type: Sequelize.STRING,
      allowNull: false
    },
    phone: {
      type: Sequelize.STRING(20),
      allowNull: true
    },
    roleId: {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'roles',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
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
  await queryInterface.dropTable('users');
};

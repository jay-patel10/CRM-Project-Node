import { DataTypes } from 'sequelize'
import sequelize from '../config/sequelize.js'

const EmailTemplate = sequelize.define(
  'EmailTemplate',
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    slug: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    subject: {
      type: DataTypes.STRING,
      allowNull: false
    },
    body: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    variables: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
    }
  },
  {
    tableName: 'email_templates',
    timestamps: true
  }
)

export default EmailTemplate

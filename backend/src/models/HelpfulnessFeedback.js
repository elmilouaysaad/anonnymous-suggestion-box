const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const crypto = require('crypto');

const HelpfulnessFeedback = sequelize.define('HelpfulnessFeedback', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  answer_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  submission_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  is_helpful: {
    type: DataTypes.BOOLEAN,
    allowNull: false
  },
  feedback_date: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  user_ip_hash: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  user_session_id: {
    type: DataTypes.STRING(255),
    allowNull: true
  }
}, {
  tableName: 'helpfulness_feedback',
  timestamps: false
});

// Static method: hash IP address
HelpfulnessFeedback.hashIp = function(ipAddress) {
  return crypto.createHash('sha256').update(ipAddress).digest('hex');
};

module.exports = HelpfulnessFeedback;

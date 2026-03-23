const Department = require('./Department');
const Submission = require('./Submission');
const Answer = require('./Answer');
const DepartmentUser = require('./DepartmentUser');
const AdminUser = require('./AdminUser');
const HelpfulnessFeedback = require('./HelpfulnessFeedback');

// Department relationships
Department.hasMany(Submission, { foreignKey: 'department_id' });
Submission.belongsTo(Department, { foreignKey: 'department_id' });

Department.hasMany(DepartmentUser, { foreignKey: 'department_id' });
DepartmentUser.belongsTo(Department, { foreignKey: 'department_id' });

// Submission and answer relationships
Submission.hasOne(Answer, { foreignKey: 'submission_id' });
Answer.belongsTo(Submission, { foreignKey: 'submission_id' });

Department.hasMany(Answer, { foreignKey: 'department_id' });
Answer.belongsTo(Department, { foreignKey: 'department_id' });

// Helpfulness relationships
Answer.hasMany(HelpfulnessFeedback, { foreignKey: 'answer_id' });
HelpfulnessFeedback.belongsTo(Answer, { foreignKey: 'answer_id' });

Submission.hasMany(HelpfulnessFeedback, { foreignKey: 'submission_id' });
HelpfulnessFeedback.belongsTo(Submission, { foreignKey: 'submission_id' });

module.exports = {
  Department,
  Submission,
  Answer,
  DepartmentUser,
  AdminUser,
  HelpfulnessFeedback
};
const Joi = require('joi');
const { AppError } = require('./errorHandler');

const schemas = {
  submission: Joi.object({
    text: Joi.string().min(1).required().messages({
      'string.empty': 'Feedback text is required',
      'string.min': 'Feedback text is required'
    }),
    category: Joi.string().valid('Question', 'Complaint', 'Suggestion').required().messages({
      'any.only': 'Category must be Question, Complaint, or Suggestion'
    }),
    department_id: Joi.number().integer().required().messages({
      'number.base': 'Department ID must be a number'
    })
  }),

  helpfulness: Joi.object({
    answer_id: Joi.number().integer().required(),
    submission_id: Joi.number().integer().required(),
    is_helpful: Joi.boolean().required()
  }),

  departmentLogin: Joi.object({
    email: Joi.string().trim().email().max(255).required(),
    password: Joi.string().min(6).required()
  }),

  adminLogin: Joi.object({
    username: Joi.string().min(3).max(50).required(),
    password: Joi.string().min(6).required()
  }),

  departmentUserCreate: Joi.object({
    department_id: Joi.number().integer().required().messages({
      'number.base': 'Department is required'
    }),
    password: Joi.string().min(6).max(255).required().messages({
      'string.min': 'Password must be at least 6 characters'
    }),
    email: Joi.string().trim().email().max(255).required().messages({
      'string.email': 'Valid email is required',
      'string.empty': 'Email is required'
    })
  }),

  departmentCreate: Joi.object({
    name: Joi.string().trim().min(2).max(255).required().messages({
      'string.empty': 'Department name is required'
    }),
    description: Joi.string().trim().max(2000).allow('').optional()
  }),

  answer: Joi.object({
    text: Joi.string().min(1).required().messages({
      'string.min': 'Answer text is required',
      'string.empty': 'Answer text is required'
    }),
    answered_by: Joi.string().max(255).optional()
  })
};

const validate = (schema) => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const messages = error.details.map(detail => ({
        field: detail.path[0],
        message: detail.message
      }));
      throw new AppError(messages[0].message, 400, 'VALIDATION_ERROR');
    }

    req.body = value;
    next();
  };
};

module.exports = {
  validateSubmission: validate(schemas.submission),
  validateHelpfulness: validate(schemas.helpfulness),
  validateDepartmentLogin: validate(schemas.departmentLogin),
  validateAdminLogin: validate(schemas.adminLogin),
  validateDepartmentUserCreate: validate(schemas.departmentUserCreate),
  validateDepartmentCreate: validate(schemas.departmentCreate),
  validateAnswer: validate(schemas.answer)
};

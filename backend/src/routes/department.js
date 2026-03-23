const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const DepartmentUser = require('../models/DepartmentUser');
const Submission = require('../models/Submission');
const Answer = require('../models/Answer');
const { AppError } = require('../middleware/errorHandler');
const { requireDepartmentAuth } = require('../middleware/auth');
const {
  validateDepartmentLogin,
  validateAnswer
} = require('../middleware/validation');
const logger = require('../utils/logger');

router.post('/login', validateDepartmentLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await DepartmentUser.findOne({
      where: {
        is_active: true,
        [Op.or]: [
          { email: String(email || '').toLowerCase() },
          { username: String(email || '').toLowerCase() }
        ]
      }
    });

    if (!user) {
      throw new AppError('Invalid username or password', 401, 'UNAUTHORIZED');
    }

    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      throw new AppError('Invalid username or password', 401, 'UNAUTHORIZED');
    }

    const token = jwt.sign(
      {
        userId: user.id,
        username: user.username,
        departmentId: user.department_id,
        role: 'department'
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.SESSION_TIMEOUT || '4h' }
    );

    user.last_login = new Date();
    await user.save();

    logger.info(`[DepartmentAuth] User ${user.username} logged in`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        session_id: token,
        user: {
          id: user.id,
          username: user.username,
          full_name: user.full_name,
          department_id: user.department_id
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/submissions', requireDepartmentAuth, async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const where = {
      department_id: req.auth.departmentId
    };

    if (status) {
      where.status = status;
    }

    const { count, rows } = await Submission.findAndCountAll({
      where,
      include: [
        {
          model: Answer,
          attributes: ['id', 'text', 'answered_by', 'answered_date'],
          required: false
        }
      ],
      order: [['submission_date', 'DESC']],
      limit: parseInt(limit, 10),
      offset,
      attributes: [
        'id',
        'text',
        'category',
        'status',
        'is_published',
        'submission_date',
        'sentiment',
        'keywords'
      ]
    });

    res.json({
      success: true,
      data: {
        submissions: rows,
        pagination: {
          current_page: parseInt(page, 10),
          total_pages: Math.ceil(count / parseInt(limit, 10)),
          total_items: count,
          per_page: parseInt(limit, 10)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post(
  '/submissions/:id/answer',
  requireDepartmentAuth,
  validateAnswer,
  async (req, res, next) => {
    try {
      const submissionId = parseInt(req.params.id, 10);
      const { text, answered_by } = req.body;

      const submission = await Submission.findOne({
        where: {
          id: submissionId,
          department_id: req.auth.departmentId
        }
      });

      if (!submission) {
        throw new AppError('Submission not found', 404, 'NOT_FOUND');
      }

      if (submission.status === 'Hidden') {
        throw new AppError('Cannot answer a hidden submission', 400, 'INVALID_STATE');
      }

      const [answer, created] = await Answer.findOrCreate({
        where: { submission_id: submission.id },
        defaults: {
          submission_id: submission.id,
          department_id: req.auth.departmentId,
          text,
          answered_by: answered_by || req.auth.username,
          answered_date: new Date()
        }
      });

      if (!created) {
        // Append new answer to existing answer instead of replacing
        const timestamp = new Date().toLocaleString();
        answer.text = answer.text + '\n\n--- Updated: ' + timestamp + ' ---\n' + text;
        answer.answered_by = answered_by || req.auth.username;
        answer.answered_date = new Date();
        await answer.save();
      }

      submission.status = 'Answered';
      submission.is_published = true;
      await submission.save();

      logger.info(
        `[Department] Submission ${submission.id} answered by ${req.auth.username}`
      );

      res.json({
        success: true,
        message: 'Answer saved and published',
        data: {
          submission_id: submission.id,
          answer_id: answer.id,
          status: submission.status,
          is_published: submission.is_published
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post('/submissions/:id/hide', requireDepartmentAuth, async (req, res, next) => {
  try {
    const submissionId = parseInt(req.params.id, 10);
    const submission = await Submission.findOne({
      where: {
        id: submissionId,
        department_id: req.auth.departmentId
      },
      include: [{ model: Answer, attributes: ['id'] }]
    });

    if (!submission) {
      throw new AppError('Submission not found', 404, 'NOT_FOUND');
    }

    // Prevent hiding submissions that have published answers
    if (submission.status === 'Answered' && submission.Answer) {
      throw new AppError(
        'Cannot hide a submission that has a published answer',
        400,
        'INVALID_STATE'
      );
    }

    submission.status = 'Hidden';
    submission.is_published = false;
    await submission.save();

    logger.info(`[Department] Submission ${submission.id} hidden by ${req.auth.username}`);

    res.json({
      success: true,
      message: 'Submission hidden successfully',
      data: {
        submission_id: submission.id,
        status: submission.status,
        is_published: submission.is_published
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', requireDepartmentAuth, async (req, res) => {
  logger.info(`[DepartmentAuth] User ${req.auth.username} logged out`);
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

module.exports = router;

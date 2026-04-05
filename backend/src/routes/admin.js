const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { Sequelize, Op } = require('sequelize');
const AdminUser = require('../models/AdminUser');
const Submission = require('../models/Submission');
const Department = require('../models/Department');
const DepartmentUser = require('../models/DepartmentUser');
const Answer = require('../models/Answer');
const HelpfulnessFeedback = require('../models/HelpfulnessFeedback');
const { AppError } = require('../middleware/errorHandler');
const { requireAdminAuth, requireSuperadminAuth } = require('../middleware/auth');
const {
  validateAdminLogin,
  validateDepartmentUserCreate,
  validateDepartmentPasswordUpdate,
  validateAdminPasswordUpdate,
  validateDashboardUserCreate,
  validateDepartmentCreate,
  validateDepartmentDeleteParams,
  validateDashboardUserDeleteParams
} = require('../middleware/validation');
const logger = require('../utils/logger');

const slugifyDepartmentName = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

router.post('/login', validateAdminLogin, async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const admin = await AdminUser.findOne({ where: { username, is_active: true } });

    if (!admin) {
      throw new AppError('Invalid username or password', 401, 'UNAUTHORIZED');
    }

    const adminPermissions = Array.isArray(admin.permissions) ? admin.permissions : [];
    const isSuperadmin =
      adminPermissions.includes('superadmin') || adminPermissions.includes('manage_department_users');

    const isValidPassword = await admin.validatePassword(password);
    if (!isValidPassword) {
      throw new AppError('Invalid username or password', 401, 'UNAUTHORIZED');
    }

    const token = jwt.sign(
      {
        userId: admin.id,
        username: admin.username,
        role: 'admin',
        is_superadmin: isSuperadmin,
        permissions: adminPermissions
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.SESSION_TIMEOUT || '4h' }
    );

    admin.last_login = new Date();
    await admin.save();

    logger.info(`[AdminAuth] User ${admin.username} logged in`);

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        session_id: token,
        user: {
          id: admin.id,
          username: admin.username,
          full_name: admin.full_name,
          permissions: adminPermissions
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/analytics', requireAdminAuth, async (req, res, next) => {
  try {
    const [totalSubmissions, pendingSubmissions, answeredSubmissions, hiddenSubmissions] =
      await Promise.all([
        Submission.count(),
        Submission.count({ where: { status: 'Pending' } }),
        Submission.count({ where: { status: 'Answered' } }),
        Submission.count({ where: { status: 'Hidden' } })
      ]);

    const departmentPerformance = await Department.findAll({
      attributes: [
        'id',
        'name',
        [Sequelize.fn('COUNT', Sequelize.col('Submissions.id')), 'total_submissions'],
        [
          Sequelize.fn(
            'SUM',
            Sequelize.literal("CASE WHEN \"Submissions\".\"status\" = 'Answered' THEN 1 ELSE 0 END")
          ),
          'answered_count'
        ]
      ],
      include: [
        {
          model: Submission,
          attributes: []
        }
      ],
      group: ['Department.id'],
      order: [['name', 'ASC']]
    });

    const sentimentBreakdownRaw = await Submission.findAll({
      attributes: [
        'sentiment',
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      where: {
        sentiment: { [Op.ne]: null }
      },
      group: ['sentiment'],
      raw: true
    });

    const sentimentBreakdown = sentimentBreakdownRaw.reduce(
      (acc, item) => {
        acc[item.sentiment] = parseInt(item.count, 10);
        return acc;
      },
      { Positive: 0, Neutral: 0, Negative: 0 }
    );

    const helpfulnessTotals = await HelpfulnessFeedback.findAll({
      attributes: [
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'total_votes'],
        [
          Sequelize.fn(
            'SUM',
            Sequelize.literal('CASE WHEN is_helpful = true THEN 1 ELSE 0 END')
          ),
          'helpful_votes'
        ]
      ],
      raw: true
    });

    const totals = helpfulnessTotals[0] || { total_votes: 0, helpful_votes: 0 };
    const totalVotes = parseInt(totals.total_votes || 0, 10);
    const helpfulVotes = parseInt(totals.helpful_votes || 0, 10);

    res.json({
      success: true,
      data: {
        overview: {
          total_submissions: totalSubmissions,
          pending_submissions: pendingSubmissions,
          answered_submissions: answeredSubmissions,
          hidden_submissions: hiddenSubmissions
        },
        department_performance: departmentPerformance,
        sentiment_breakdown: sentimentBreakdown,
        helpfulness: {
          total_votes: totalVotes,
          helpful_votes: helpfulVotes,
          helpful_percentage: totalVotes > 0 ? Math.round((helpfulVotes / totalVotes) * 100) : 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

router.get('/engagement-trend', requireAdminAuth, async (req, res, next) => {
  try {
    const { days = 14 } = req.query;
    const range = Math.max(1, Math.min(90, parseInt(days, 10) || 14));

    const raw = await HelpfulnessFeedback.findAll({
      attributes: [
        [Sequelize.fn('DATE', Sequelize.col('feedback_date')), 'date'],
        [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']
      ],
      where: {
        feedback_date: {
          [Op.gte]: Sequelize.literal(`NOW() - INTERVAL '${range} days'`)
        }
      },
      group: [Sequelize.fn('DATE', Sequelize.col('feedback_date'))],
      order: [[Sequelize.fn('DATE', Sequelize.col('feedback_date')), 'ASC']],
      raw: true
    });

    const byDate = new Map(raw.map((row) => [String(row.date), parseInt(row.count, 10) || 0]));
    const points = [];
    const today = new Date();

    for (let i = range - 1; i >= 0; i -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const key = date.toISOString().slice(0, 10);
      points.push({
        date: key,
        count: byDate.get(key) || 0
      });
    }

    res.json({
      success: true,
      data: {
        days: range,
        points
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/departments', requireSuperadminAuth, validateDepartmentCreate, async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const normalizedSlug = slugifyDepartmentName(name);

    if (!normalizedSlug) {
      throw new AppError('Invalid department slug', 400, 'VALIDATION_ERROR');
    }

    const existingByName = await Department.findOne({ where: { name } });
    if (existingByName) {
      throw new AppError('Department name already exists', 409, 'CONFLICT');
    }

    const existingBySlug = await Department.findOne({ where: { slug: normalizedSlug } });
    if (existingBySlug) {
      throw new AppError('Department slug already exists', 409, 'CONFLICT');
    }

    const createdDepartment = await Department.create({
      name,
      slug: normalizedSlug,
      description: description || null,
      created_at: new Date(),
      updated_at: new Date()
    });

    logger.info(`[Admin] Department ${createdDepartment.slug} created by ${req.auth.username}`);

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: {
        id: createdDepartment.id,
        name: createdDepartment.name,
        slug: createdDepartment.slug,
        description: createdDepartment.description
      }
    });
  } catch (error) {
    next(error);
  }
});

router.delete(
  '/departments/:id',
  requireSuperadminAuth,
  validateDepartmentDeleteParams,
  async (req, res, next) => {
    try {
      const departmentId = parseInt(req.params.id, 10);
      const department = await Department.findByPk(departmentId);

      if (!department) {
        throw new AppError('Department not found', 404, 'NOT_FOUND');
      }

      const departmentSlug = String(department.slug || '').toLowerCase();
      if (departmentSlug === 'general' || departmentSlug === 'genral') {
        throw new AppError('General department cannot be deleted', 400, 'INVALID_OPERATION');
      }

      const [submissionCount, departmentUserCount] = await Promise.all([
        Submission.count({ where: { department_id: departmentId } }),
        DepartmentUser.count({ where: { department_id: departmentId } })
      ]);

      if (submissionCount > 0 || departmentUserCount > 0) {
        throw new AppError(
          'Cannot delete department with existing submissions or users',
          400,
          'INVALID_OPERATION'
        );
      }

      await department.destroy();

      logger.info(`[Admin] Department ${department.slug} deleted by ${req.auth.username}`);

      res.json({
        success: true,
        message: 'Department deleted successfully',
        data: {
          id: departmentId,
          slug: department.slug,
          name: department.name
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post('/department-users', requireSuperadminAuth, validateDepartmentUserCreate, async (req, res, next) => {
  try {
    const {
      department_id,
      password,
      email
    } = req.body;
    const normalizedEmail = String(email || '').trim().toLowerCase();

    const department = await Department.findByPk(department_id);
    if (!department) {
      throw new AppError('Department not found', 404, 'NOT_FOUND');
    }

    const existingUser = await DepartmentUser.findOne({
      where: {
        [Op.or]: [
          { email: normalizedEmail },
          { username: normalizedEmail }
        ]
      }
    });
    if (existingUser) {
      throw new AppError('Email already exists', 409, 'CONFLICT');
    }

    const createdUser = await DepartmentUser.create({
      username: normalizedEmail,
      password_hash: password,
      department_id,
      full_name: null,
      email: normalizedEmail,
      is_active: true,
      created_at: new Date(),
      updated_at: new Date()
    });

    logger.info(
      `[Admin] Department user ${createdUser.email} created by ${req.auth.username} for department ${department.slug}`
    );

    res.status(201).json({
      success: true,
      message: 'Department credentials created successfully',
      data: {
        id: createdUser.id,
        email: createdUser.email,
        department: {
          id: department.id,
          name: department.name,
          slug: department.slug
        },
        email: createdUser.email,
        is_active: createdUser.is_active
      }
    });
  } catch (error) {
    next(error);
  }
});

router.patch(
  '/department-users/password',
  requireSuperadminAuth,
  validateDepartmentPasswordUpdate,
  async (req, res, next) => {
    try {
      const { department_id, email, new_password } = req.body;
      const normalizedEmail = String(email || '').trim().toLowerCase();

      const department = await Department.findByPk(department_id);
      if (!department) {
        throw new AppError('Department not found', 404, 'NOT_FOUND');
      }

      const user = await DepartmentUser.findOne({
        where: {
          department_id,
          [Op.or]: [{ email: normalizedEmail }, { username: normalizedEmail }]
        }
      });

      if (!user) {
        throw new AppError('Department user not found', 404, 'NOT_FOUND');
      }

      user.password_hash = new_password;
      user.updated_at = new Date();
      await user.save();

      logger.info(
        `[Admin] Department user password updated by ${req.auth.username} for ${normalizedEmail} (${department.slug})`
      );

      res.json({
        success: true,
        message: 'Department password updated successfully',
        data: {
          id: user.id,
          email: user.email,
          department: {
            id: department.id,
            name: department.name,
            slug: department.slug
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/dashboard-users',
  requireSuperadminAuth,
  validateDashboardUserCreate,
  async (req, res, next) => {
    try {
      const { password, email, permissions } = req.body;
      const normalizedEmail = String(email || '').trim().toLowerCase();
      const normalizedUsername = normalizedEmail;

      const existingUser = await AdminUser.findOne({
        where: {
          [Op.or]: [{ username: normalizedUsername }, { email: normalizedEmail }]
        }
      });

      if (existingUser) {
        throw new AppError('Dashboard user already exists', 409, 'CONFLICT');
      }

      const createdUser = await AdminUser.create({
        username: normalizedUsername,
        password_hash: password,
        email: normalizedEmail,
        is_active: true,
        permissions: Array.isArray(permissions) && permissions.length
          ? permissions
          : ['read', 'analytics'],
        created_at: new Date(),
        updated_at: new Date()
      });

      logger.info(`[Admin] Dashboard user ${createdUser.username} created by ${req.auth.username}`);

      res.status(201).json({
        success: true,
        message: 'Dashboard user created successfully',
        data: {
          id: createdUser.id,
          username: createdUser.username,
          email: createdUser.email,
          permissions: createdUser.permissions
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

router.delete(
  '/dashboard-users/:email',
  requireSuperadminAuth,
  validateDashboardUserDeleteParams,
  async (req, res, next) => {
    try {
      const normalizedEmail = String(req.params.email || '').trim().toLowerCase();

      const user = await AdminUser.findOne({ where: { email: normalizedEmail } });
      if (!user) {
        throw new AppError('Dashboard user not found', 404, 'NOT_FOUND');
      }

      if (user.id === req.auth.userId) {
        throw new AppError('You cannot remove your own dashboard account', 400, 'INVALID_OPERATION');
      }

      await user.destroy();

      logger.info(`[Admin] Dashboard user ${normalizedEmail} deleted by ${req.auth.username}`);

      res.json({
        success: true,
        message: 'Dashboard user removed successfully',
        data: {
          email: normalizedEmail
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/dashboard-users/password',
  requireSuperadminAuth,
  validateAdminPasswordUpdate,
  async (req, res, next) => {
    try {
      const { username, new_password } = req.body;
      const normalizedUsername = String(username || '').trim();

      const admin = await AdminUser.findOne({ where: { username: normalizedUsername, is_active: true } });
      if (!admin) {
        throw new AppError('Dashboard user not found', 404, 'NOT_FOUND');
      }

      admin.password_hash = new_password;
      admin.updated_at = new Date();
      await admin.save();

      logger.info(
        `[Admin] Dashboard password updated by ${req.auth.username} for ${normalizedUsername}`
      );

      res.json({
        success: true,
        message: 'Dashboard password updated successfully',
        data: {
          id: admin.id,
          username: admin.username
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

router.get('/submissions', requireAdminAuth, async (req, res, next) => {
  try {
    const { status, sentiment, page = 1, limit = 25 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const where = {};

    if (status) {
      where.status = status;
    }

    if (sentiment) {
      where.sentiment = sentiment;
    }

    const { count, rows } = await Submission.findAndCountAll({
      where,
      include: [
        {
          model: Department,
          attributes: ['id', 'name', 'slug']
        },
        {
          model: Answer,
          attributes: ['id', 'text', 'answered_by', 'answered_date'],
          required: false
        }
      ],
      attributes: [
        'id',
        'text',
        'category',
        'status',
        'is_published',
        'sentiment',
        'keywords',
        'submission_date'
      ],
      order: [['submission_date', 'DESC']],
      limit: parseInt(limit, 10),
      offset
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

router.get('/keywords', requireAdminAuth, async (req, res, next) => {
  try {
    const { department } = req.query;
    const where = {
      status: 'Answered',
      keywords: {
        [Op.ne]: []
      }
    };

    if (department) {
      const dept = await Department.findOne({ where: { slug: department } });
      if (!dept) {
        throw new AppError('Department not found', 404, 'NOT_FOUND');
      }
      where.department_id = dept.id;
    }

    const submissions = await Submission.findAll({
      where,
      attributes: ['id', 'keywords'],
      limit: 500
    });

    const keywordMap = new Map();
    for (const submission of submissions) {
      const keywords = Array.isArray(submission.keywords) ? submission.keywords : [];
      for (const rawKeyword of keywords) {
        const keyword = String(rawKeyword || '').trim().toLowerCase();
        if (!keyword) {
          continue;
        }
        keywordMap.set(keyword, (keywordMap.get(keyword) || 0) + 1);
      }
    }

    const keywordStats = Array.from(keywordMap.entries())
      .map(([keyword, count]) => ({ keyword, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 100);

    res.json({
      success: true,
      data: {
        total_keywords: keywordStats.length,
        keywords: keywordStats
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/logout', requireAdminAuth, async (req, res) => {
  logger.info(`[AdminAuth] User ${req.auth.username} logged out`);
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

module.exports = router;

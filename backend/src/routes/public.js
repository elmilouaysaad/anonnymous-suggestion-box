const express = require('express');
const router = express.Router();
const { Sequelize, Op } = require('sequelize');
const Department = require('../models/Department');
const Submission = require('../models/Submission');
const Answer = require('../models/Answer');
const HelpfulnessFeedback = require('../models/HelpfulnessFeedback');
const { AppError } = require('../middleware/errorHandler');
const { validateSubmission, validateHelpfulness } = require('../middleware/validation');
const logger = require('../utils/logger');
const { analyzeSubmissionText } = require('../utils/textAnalysis');

// GET /api/public/departments
router.get('/departments', async (req, res, next) => {
  try {
    await Department.findOrCreate({
      where: { slug: 'general' },
      defaults: {
        name: 'General',
        slug: 'general',
        description: 'General submissions visible to all departments',
        created_at: new Date(),
        updated_at: new Date()
      }
    });

    const departments = await Department.findAll({
      attributes: ['id', 'name', 'slug'],
      order: [['name', 'ASC']]
    });

    const sortedDepartments = [...departments].sort((a, b) => {
      if (a.slug === 'general') return -1;
      if (b.slug === 'general') return 1;
      return String(a.name || '').localeCompare(String(b.name || ''));
    });

    res.json({
      success: true,
      data: sortedDepartments
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/public/submissions?department={slug}&page=1&limit=10&sort=newest
router.get('/submissions', async (req, res, next) => {
  try {
    const { department, page = 1, limit = 10, sort = 'newest' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const normalizedDepartment = String(department || '').trim().toLowerCase();
    const isGeneralDepartment = normalizedDepartment === 'general' || normalizedDepartment === 'genral';
    const isAllDepartments = normalizedDepartment === 'all';
    const where = {
      status: 'Answered',
      is_published: true
    };

    if (normalizedDepartment && !isGeneralDepartment && !isAllDepartments) {
      const dept = await Department.findOne({ where: { slug: normalizedDepartment } });
      if (!dept) {
        throw new AppError('Department not found', 404, 'NOT_FOUND');
      }

      const generalDepartments = await Department.findAll({
        where: {
          slug: {
            [Op.in]: ['general', 'genral']
          }
        },
        attributes: ['id'],
        raw: true
      });

      const departmentIds = [dept.id, ...generalDepartments.map((item) => item.id)];
      where.department_id = {
        [Op.in]: departmentIds
      };
    }

    const orderBy = sort === 'oldest' ? 'ASC' : 'DESC';

    const { count, rows } = await Submission.findAndCountAll({
      where,
      include: [
        {
          model: Answer,
          attributes: ['id', 'text', 'answered_date', 'answered_by']
        },
        {
          model: Department,
          attributes: ['id', 'name', 'slug']
        }
      ],
      order: [['submission_date', orderBy]],
      limit: parseInt(limit),
      offset: offset,
      attributes: ['id', 'text', 'category', 'submission_date', 'sentiment']
    });

    // Get helpfulness stats for each answer
    const submissionsWithStats = await Promise.all(
      rows.map(async (sub) => {
        let helpfulness = { total_votes: 0, helpful_count: 0, helpful_percentage: 0 };
        
        if (sub.Answer) {
          const stats = await HelpfulnessFeedback.findAll({
            where: { answer_id: sub.Answer.id },
            attributes: [
              [Sequelize.fn('COUNT', Sequelize.col('id')), 'total'],
              [
                Sequelize.fn(
                  'SUM',
                  Sequelize.literal('CASE WHEN is_helpful = true THEN 1 ELSE 0 END')
                ),
                'helpful'
              ]
            ],
            raw: true
          });

          if (stats[0] && stats[0].total > 0) {
            helpfulness = {
              total_votes: parseInt(stats[0].total),
              helpful_count: parseInt(stats[0].helpful) || 0,
              helpful_percentage: Math.round((parseInt(stats[0].helpful) || 0) / parseInt(stats[0].total) * 100)
            };
          }
        }

        const rawSubmission = sub.toJSON();
        return {
          ...rawSubmission,
          answer: rawSubmission.Answer || null,
          helpfulness
        };
      })
    );

    res.json({
      success: true,
      data: {
        submissions: submissionsWithStats,
        pagination: {
          current_page: parseInt(page),
          total_pages: Math.ceil(count / parseInt(limit)),
          total_items: count,
          per_page: parseInt(limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/public/submissions
router.post('/submissions', validateSubmission, async (req, res, next) => {
  try {
    const { text, category, department_id } = req.body;

    // Verify department exists
    const dept = await Department.findByPk(department_id);
    if (!dept) {
      throw new AppError('Invalid department', 400, 'VALIDATION_ERROR');
    }

    const analysis = analyzeSubmissionText(text);

    // Create submission
    const submission = await Submission.create({
      text,
      category,
      department_id,
      status: 'Pending',
      is_published: false,
      sentiment: analysis.sentiment,
      keywords: analysis.keywords,
      submission_date: new Date()
    });

    logger.info(
      `[Submission] Created submission ${submission.id} for department ${dept.name} | sentiment=${analysis.sentiment} | keywords=${analysis.keywords.join(',')}`
    );

    res.status(201).json({
      success: true,
      message: 'Thank you for your submission. We will get back to you within 2 weeks.',
      data: {
        submission_id: submission.id,
        confirmation_date: new Date()
      }
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/public/helpfulness
router.post('/helpfulness', validateHelpfulness, async (req, res, next) => {
  try {
    const { answer_id, submission_id, is_helpful } = req.body;

    // Verify answer exists
    const answer = await Answer.findByPk(answer_id);
    if (!answer) {
      throw new AppError('Answer not found', 404, 'NOT_FOUND');
    }

    // Create feedback
    const feedback = await HelpfulnessFeedback.create({
      answer_id,
      submission_id,
      is_helpful,
      user_ip_hash: HelpfulnessFeedback.hashIp(req.ip),
      user_session_id: req.headers['x-session-id'] || Math.random().toString(36).substr(2, 9)
    });

    logger.info(`[Helpfulness] User marked answer ${answer_id} as ${is_helpful ? 'helpful' : 'unhelpful'}`);

    res.json({
      success: true,
      message: 'Thank you for your feedback'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

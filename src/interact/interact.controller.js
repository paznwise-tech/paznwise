'use strict';

// ─────────────────────────────────────────────
// INTERACT CONTROLLER
// POST /api/interact
// ─────────────────────────────────────────────

const Joi = require('joi');
const { recordInteraction } = require('./interact.service');

const interactSchema = Joi.object({
  postId: Joi.number().integer().required(),
  action: Joi.string().valid('like', 'save', 'share', 'view', 'purchase', 'skip').required(),
});

const recordInteractionController = async (req, res, next) => {
  try {
    // 1. Validate body
    const { error, value } = interactSchema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((d) => ({
        field: d.context?.key || 'unknown',
        message: d.message,
      }));
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors,
      });
    }

    // 2. Get userId from auth
    const userId = req.user.id;

    // 3. Record interaction
    await recordInteraction(userId, value.postId, value.action);

    // 4. Return success
    return res.status(200).json({
      success: true,
      message: 'Interaction recorded',
      data: null,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { recordInteractionController };

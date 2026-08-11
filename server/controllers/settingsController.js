import { Settings } from '../models/Settings.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// @desc    Get system settings
// @route   GET /api/settings
// @access  Private (All authenticated users can read for UI config)
export const getSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  
  if (!settings) {
    settings = await Settings.create({});
  }

  res.status(200).json({
    status: 'success',
    data: { settings }
  });
});

// @desc    Update system settings
// @route   PUT /api/settings
// @access  Private (CEO, SUPER_ADMIN)
export const updateSettings = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  
  if (!settings) {
    settings = await Settings.create({});
  }

  // Update fields if provided in request body
  const updatableFields = [
    'companyName',
    'autoApprovalDays',
    'maxLeavesPerMonth',
    'carryForwardLimit',
    'emergencyEscalationMinutes'
  ];

  updatableFields.forEach(field => {
    if (req.body[field] !== undefined) {
      settings[field] = req.body[field];
    }
  });

  await settings.save();

  res.status(200).json({
    status: 'success',
    data: { settings }
  });
});

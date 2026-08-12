import { Notification } from '../models/Notification.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getNotifications = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (Number(page) - 1) * Number(limit);

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Notification.countDocuments({ recipient: req.user._id }),
    Notification.countDocuments({ recipient: req.user._id, isRead: false })
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      unreadCount,
      notifications,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    }
  });
});

export const markAsRead = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (id === 'all') {
    await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
  } else {
    await Notification.findByIdAndUpdate(id, { isRead: true });
  }

  res.status(200).json({ status: 'success', message: 'Notifications marked as read.' });
});

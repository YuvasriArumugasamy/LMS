import { Notification } from '../models/Notification.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getNotifications = asyncHandler(async (req, res, next) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 })
    .limit(20);

  const unreadCount = await Notification.countDocuments({ recipient: req.user._id, isRead: false });

  res.status(200).json({
    status: 'success',
    data: {
      unreadCount,
      notifications
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

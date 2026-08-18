import { LeaveRequest } from '../models/LeaveRequest.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';
import { sendPushNotification } from './pushNotificationService.js';

export const checkEmergencyEscalations = async () => {
  try {
    const now = new Date();
    
    // Early exit optimization: Check if any emergency leaves exist first
    const hasEmergencyLeaves = await LeaveRequest.exists({
      isEmergency: true,
      status: 'PENDING',
      escalationDeadline: { $lte: now }
    });
    
    if (!hasEmergencyLeaves) {
      // No emergency leaves to escalate - skip processing
      return;
    }

    // Find pending emergency leave requests where escalationDeadline has passed
    const overdueLeaves = await LeaveRequest.find({
      isEmergency: true,
      status: 'PENDING',
      escalationDeadline: { $lte: now }
    }).populate('user', 'firstName lastName email employeeId department');

    if (!overdueLeaves || overdueLeaves.length === 0) return;

    // Fetch HR users to notify
    const hrUsers = await User.find({ role: { $in: ['HR', 'ADMIN'] }, status: 'ACTIVE' });
    const hrIds = hrUsers.map((h) => h._id);

    for (const leave of overdueLeaves) {
      leave.status = 'ESCALATED_TO_HR';
      leave.escalatedAt = now;
      leave.approvalFlow.push({
        reviewerRole: 'SYSTEM',
        action: 'ESCALATED',
        comments: 'Automatically escalated to HR due to manager non-response within emergency deadline.',
        timestamp: now
      });
      await leave.save();

      const title = '🚨 Emergency Leave Escalated';
      const message = `Emergency Leave request for ${leave.user.firstName} ${leave.user.lastName} (${leave.user.employeeId}) has been escalated to HR for immediate action.`;

      // Send notifications to HR
      for (const hr of hrUsers) {
        await Notification.safeCreate({
          recipient: hr._id,
          title,
          message,
          type: 'LEAVE_ESCALATED',
          targetUrl: '/leaves'
        });
      }

      if (hrIds.length > 0) {
        sendPushNotification(hrIds, title, message, '/leaves');
      }
    }
  } catch (error) {
    console.error('[Escalation Service Error]', error);
  }
};


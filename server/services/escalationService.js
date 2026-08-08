import { LeaveRequest } from '../models/LeaveRequest.js';
import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';

export const checkEmergencyEscalations = async () => {
  try {
    const now = new Date();
    // Find pending emergency leave requests where escalationDeadline has passed
    const overdueLeaves = await LeaveRequest.find({
      isEmergency: true,
      status: 'PENDING',
      escalationDeadline: { $lte: now }
    }).populate('user', 'firstName lastName email employeeId department');

    if (!overdueLeaves || overdueLeaves.length === 0) return;

    // Fetch HR users to notify
    const hrUsers = await User.find({ role: { $in: ['HR', 'SUPER_ADMIN'] }, status: 'ACTIVE' });

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

      // Send notifications to HR
      for (const hr of hrUsers) {
        await Notification.create({
          recipient: hr._id,
          title: '🚨 Emergency Leave Escalated',
          message: `Emergency Leave request for ${leave.user.firstName} ${leave.user.lastName} (${leave.user.employeeId}) has been escalated to HR for immediate action.`,
          type: 'LEAVE_ESCALATED',
          targetUrl: '/leaves'
        });
      }
    }
  } catch (error) {
    console.error('[Escalation Service Error]', error);
  }
};

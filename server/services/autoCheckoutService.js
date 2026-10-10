import { Attendance } from '../models/Attendance.js';
import { Settings } from '../models/Settings.js';
import { Notification } from '../models/Notification.js';

export const runAutoCheckoutJob = async () => {
  try {
    const settings = await Settings.findOne() || { autoCheckoutTime: '19:00', enableAutoCheckout: true };
    if (settings.enableAutoCheckout === false) return;

    // Get current time in IST (Asia/Kolkata)
    const now = new Date();
    const istFormatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      hour: 'numeric',
      minute: 'numeric',
      hour12: false
    });
    const parts = istFormatter.formatToParts(now);
    let currentHours = 0;
    let currentMinutes = 0;
    for (const part of parts) {
      if (part.type === 'hour') currentHours = parseInt(part.value, 10);
      if (part.type === 'minute') currentMinutes = parseInt(part.value, 10);
    }
    if (currentHours === 24) currentHours = 0;

    // Today's start in IST
    const todayISTStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(now);
    const todayStartIST = new Date(`${todayISTStr}T00:00:00.000+05:30`);

    // Target auto checkout time: 7:00 PM IST (19:00)
    const targetHour = 19;
    const isPastTargetHour = currentHours >= targetHour;

    // Find active attendance records where clockIn exists but clockOut is missing:
    // 1. Any record from a PAST DAY (< todayStartIST) is immediately auto-closed
    // 2. Today's records are auto-closed if current time is at or past 7:00 PM IST
    const query = isPastTargetHour
      ? { clockIn: { $ne: null }, $or: [{ clockOut: null }, { clockOut: { $exists: false } }] }
      : { clockIn: { $ne: null, $lt: todayStartIST }, $or: [{ clockOut: null }, { clockOut: { $exists: false } }] };

    const openAttendances = await Attendance.find(query).populate('user', 'firstName lastName email role');

    if (!openAttendances || openAttendances.length === 0) {
      return;
    }

    console.log(`⏰ [Auto Check-Out Service] Found ${openAttendances.length} open sessions to auto check out...`);

    for (const att of openAttendances) {
      try {
        // Construct 7:00 PM IST date object for the day of attendance clockIn
        const clockInDate = new Date(att.clockIn);
        const istDateStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(clockInDate);
        const autoCheckoutTime = new Date(`${istDateStr}T19:00:00.000+05:30`);

        // If clockIn was after 7 PM, use actual clockIn + 1min or now
        const checkoutTime = autoCheckoutTime > clockInDate ? autoCheckoutTime : now;

        let diffMs = checkoutTime - new Date(att.clockIn);
        if (att.lunchOut && att.lunchIn) {
          diffMs -= (new Date(att.lunchIn) - new Date(att.lunchOut));
        }
        if (att.extraBreakMs) {
          diffMs -= att.extraBreakMs;
        }

        const totalHours = Math.max(0.1, Number((diffMs / (1000 * 60 * 60)).toFixed(2)));

        att.clockOut = checkoutTime;
        att.totalHours = totalHours;

        const autoNote = `System Auto Checked Out at 7:00 PM IST`;
        att.notes = att.notes ? `${att.notes} | ${autoNote}` : autoNote;

        if (!att.timeline) att.timeline = [];
        const alreadyHasAutoCheckout = att.timeline.some(t => t.type === 'FORCE_CHECKOUT' && t.note?.includes('7:00 PM IST'));

        if (!alreadyHasAutoCheckout) {
          att.timeline.push({
            type: 'FORCE_CHECKOUT',
            timestamp: checkoutTime,
            workLocation: att.workLocation || 'IN_OFFICE',
            note: autoNote
          });
        }

        att.markModified('timeline');
        await att.save();

        // Send Notification to Employee
        if (att.user?._id) {
          await Notification.safeCreate({
            recipient: att.user._id,
            title: '⏰ Auto Check-Out Completed',
            message: `You were automatically checked out at 7:00 PM IST. Total work hours: ${totalHours} hrs.`,
            type: 'SYSTEM',
            targetUrl: '/attendance'
          });
        }

        console.log(`✅ [Auto Check-Out] User ${att.user?.firstName || att.user} auto checked out at 7:00 PM IST.`);
      } catch (err) {
        console.error(`❌ [Auto Check-Out Error] Failed for attendance ID ${att._id}:`, err.message);
      }
    }
  } catch (error) {
    console.error('❌ [Auto Check-Out Service Exception]:', error.message);
  }
};

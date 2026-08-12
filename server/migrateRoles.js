import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function migrateRoles() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB:', MONGODB_URI);

    const db = mongoose.connection.db;
    const usersCollection = db.collection('users');

    // SUPER_ADMIN → ADMIN
    const superAdminResult = await usersCollection.updateMany(
      { role: 'SUPER_ADMIN' },
      { $set: { role: 'ADMIN' } }
    );
    console.log(`✅ SUPER_ADMIN → ADMIN: ${superAdminResult.modifiedCount} users updated`);

    // MANAGER → TEAM_LEAD
    const managerResult = await usersCollection.updateMany(
      { role: 'MANAGER' },
      { $set: { role: 'TEAM_LEAD' } }
    );
    console.log(`✅ MANAGER → TEAM_LEAD: ${managerResult.modifiedCount} users updated`);

    // LeaveRequests collection - status fields
    const leaveCollection = db.collection('leaverequests');

    const leaveStatusResult = await leaveCollection.updateMany(
      { status: 'MANAGER_APPROVED' },
      { $set: { status: 'TEAM_LEAD_APPROVED' } }
    );
    console.log(`✅ MANAGER_APPROVED → TEAM_LEAD_APPROVED: ${leaveStatusResult.modifiedCount} leaves updated`);

    const leaveRejectResult = await leaveCollection.updateMany(
      { status: 'MANAGER_REJECTED' },
      { $set: { status: 'TEAM_LEAD_REJECTED' } }
    );
    console.log(`✅ MANAGER_REJECTED → TEAM_LEAD_REJECTED: ${leaveRejectResult.modifiedCount} leaves updated`);

    // Update approvalFlow.reviewerRole inside leave requests
    const approvalFlowResult = await leaveCollection.updateMany(
      { 'approvalFlow.reviewerRole': 'MANAGER' },
      { $set: { 'approvalFlow.$[elem].reviewerRole': 'TEAM_LEAD' } },
      { arrayFilters: [{ 'elem.reviewerRole': 'MANAGER' }] }
    );
    console.log(`✅ approvalFlow reviewerRole MANAGER → TEAM_LEAD: ${approvalFlowResult.modifiedCount} updated`);

    // Update approvalFlow.reviewerRole SUPER_ADMIN → ADMIN
    const approvalFlowAdminResult = await leaveCollection.updateMany(
      { 'approvalFlow.reviewerRole': 'SUPER_ADMIN' },
      { $set: { 'approvalFlow.$[elem].reviewerRole': 'ADMIN' } },
      { arrayFilters: [{ 'elem.reviewerRole': 'SUPER_ADMIN' }] }
    );
    console.log(`✅ approvalFlow reviewerRole SUPER_ADMIN → ADMIN: ${approvalFlowAdminResult.modifiedCount} updated`);

    console.log('\n🎉 Migration complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrateRoles();

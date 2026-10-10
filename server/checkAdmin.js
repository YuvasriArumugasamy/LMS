import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
dotenv.config();

const run = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/elms_enterprise';
    await mongoose.connect(mongoUri);
    console.log('Connected to DB:', mongoose.connection.name);

    const users = await mongoose.connection.db.collection('users').find({
      $or: [{ role: 'ADMIN' }, { email: /admin/i }, { employeeId: 'ADM001' }]
    }).toArray();

    console.log('Found admin accounts:', users.length);
    for (const u of users) {
      console.log('User:', u.email, 'Role:', u.role, 'EmpId:', u.employeeId, 'Plain:', u.plainPassword);
    }

    if (users.length === 0) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin@123', salt);
      await mongoose.connection.db.collection('users').insertOne({
        employeeId: 'ADM001',
        firstName: 'System',
        lastName: 'Admin',
        email: 'admin@enterprise.com',
        username: 'admin',
        password: hashedPassword,
        plainPassword: 'Admin@123',
        role: 'ADMIN',
        status: 'ACTIVE',
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('Created admin@enterprise.com with password Admin@123');
    } else {
      // Ensure password is Admin@123
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Admin@123', salt);
      await mongoose.connection.db.collection('users').updateOne(
        { _id: users[0]._id },
        { $set: { password: hashedPassword, plainPassword: 'Admin@123', status: 'ACTIVE', isDeleted: false } }
      );
      console.log('Updated admin password to Admin@123');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

run();

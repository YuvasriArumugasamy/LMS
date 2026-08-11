import mongoose from 'mongoose';
import { User } from './models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/elms_enterprise');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@enterprise.com' });
    if (existingAdmin) {
      console.log('Admin user already exists!');
      process.exit(0);
    }

    await User.create({
      employeeId: 'ADM001',
      firstName: 'System',
      lastName: 'Admin',
      email: 'admin@enterprise.com',
      password: 'Admin@123',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE'
    });

    console.log('Admin user created successfully! Email: admin@enterprise.com, Password: Admin@123');
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error);
    process.exit(1);
  }
};

createAdmin();

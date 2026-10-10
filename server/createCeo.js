import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from './models/User.js';

dotenv.config();

const createOrResetCeo = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/elms_enterprise';
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);

    const email = 'ceo@enterprise.com';
    const password = 'Welcome@123';
    const hashedPassword = await bcrypt.hash(password, 10);

    let ceo = await User.findOne({ $or: [{ email: 'ceo@enterprise.com' }, { role: 'CEO' }, { employeeId: 'EMP001' }] });

    if (ceo) {
      ceo.email = 'ceo@enterprise.com';
      ceo.password = hashedPassword;
      ceo.role = 'CEO';
      ceo.status = 'ACTIVE';
      ceo.isDeleted = false;
      await ceo.save();
      console.log('CEO User updated successfully!');
    } else {
      ceo = await User.create({
        employeeId: 'EMP001',
        firstName: 'Executive',
        lastName: 'CEO',
        email: 'ceo@enterprise.com',
        username: 'ceo',
        password: hashedPassword,
        role: 'CEO',
        status: 'ACTIVE'
      });
      console.log('CEO User created successfully!');
    }

    console.log(`\n===================================`);
    console.log(`✅ CEO Credentials Set Successfully:`);
    console.log(`Email: ceo@enterprise.com`);
    console.log(`Password: Welcome@123`);
    console.log(`===================================\n`);
    process.exit(0);
  } catch (error) {
    console.error('Error creating/updating CEO:', error);
    process.exit(1);
  }
};

createOrResetCeo();

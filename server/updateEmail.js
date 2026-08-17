import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { User } from './models/User.js';

dotenv.config();

const updateTeamLeadEmail = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const result = await User.updateOne(
      { email: 'manager@enterprise.com' },
      { $set: { email: 'teamlead@enterprise.com' } }
    );

    console.log(`Matched: ${result.matchedCount}, Modified: ${result.modifiedCount}`);
    
    if (result.matchedCount === 0) {
      console.log('No user found with manager@enterprise.com, they might have already been updated.');
    } else {
      console.log('Successfully updated Team Lead email to teamlead@enterprise.com');
    }
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

updateTeamLeadEmail();

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from './models/User';

dotenv.config();

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:2_017/clothing-shop';
    
    console.log('Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const adminUser = new User({
        email: 'admin@example.com',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin'
      });
      await adminUser.save();
      console.log('✅ Admin user created successfully');
    } else {
      console.log('ℹ️ Admin user already exists. No action taken.');
    }

    console.log('Disconnecting from MongoDB...');
    await mongoose.disconnect();
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();

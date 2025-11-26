import mongoose, { Schema, Document } from 'mongoose';
import bcryptjs from 'bcryptjs';

export interface IUser extends Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  profileImageUrl?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  role: 'customer' | 'admin';
  isBanned?: boolean;
  bannedReason?: string;
  lastLoginIp?: string;
  ipHistory?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  comparePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false
    },
    firstName: {
      type: String,
      required: [true, 'Please provide a first name']
    },
    lastName: {
      type: String,
      required: [true, 'Please provide a last name']
    },
    profileImageUrl: {
      type: String,
      default: '/uploads/default-avatar.png'
    },
    phone: String,
    address: String,
    city: String,
    country: String,
    isBanned: { type: Boolean, default: false },
    bannedReason: { type: String, default: '' },
    lastLoginIp: { type: String, default: '' },
    ipHistory: [{ type: String }],
    role: {
      type: String,
      enum: ['customer', 'admin'],
      default: 'customer'
    }
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next();
  }

  const salt = await bcryptjs.genSalt(10);
  this.password = await bcryptjs.hash(this.password, salt);
});

// Compare password method
userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  console.log('Comparing passwords...');
  const isMatch = await bcryptjs.compare(password, this.password);
  console.log('Password match:', isMatch);
  return isMatch;
};

export const User = mongoose.model<IUser>('User', userSchema);

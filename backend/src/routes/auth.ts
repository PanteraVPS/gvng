import { Router, Request, Response } from 'express';
import { User } from '../models/User';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import { authenticateToken } from '../middleware/auth';

const router = Router();

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields'
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }

    const user = new User({ email, password, firstName, lastName });
    await user.save();

    const secret: Secret = (process.env.JWT_SECRET || 'secret') as Secret;
    const signOptions: SignOptions = { expiresIn: (process.env.JWT_EXPIRE || '7d') as any };
    const token = jwt.sign(
      { id: user._id, role: user.role },
      secret,
      signOptions
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      data: user
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    const passwordMatch = await user.comparePassword(password);
    console.log('Password match:', passwordMatch);
    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    const secret: Secret = (process.env.JWT_SECRET || 'secret') as Secret;
    const signOptions: SignOptions = { expiresIn: (process.env.JWT_EXPIRE || '7d') as any };
    const token = jwt.sign(
      { id: user._id, role: user.role },
      secret,
      signOptions
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

router.post('/register', register);
router.post('/login', login);

router.get('/profile', authenticateToken, async (req: Request, res: Response) => {
    try {
        const user = await User.findById((req as any).user.id).select('-password');
        res.json({ success: true, data: user });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.put('/profile', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { email } = req.body;
        const user = await User.findByIdAndUpdate((req as any).user.id, { email }, { new: true });
        res.json({ success: true, data: user });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.put('/password', authenticateToken, async (req: Request, res: Response) => {
    try {
        const { password } = req.body;
        const user = await User.findById((req as any).user.id).select('+password');
        if (user) {
            user.password = password;
            await user.save();
        }
        res.json({ success: true, message: 'Password updated successfully' });
    } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;

import { Router, Request, Response } from 'express';
import Order from '../models/Order';
import { authenticateToken } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import { User } from '../models/User';

const router = Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|webp/;
        const mimetype = allowedTypes.test(file.mimetype);
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Error: File upload only supports the following filetypes - ' + allowedTypes));
    }
});

// @route   GET api/users/orders
// @desc    Get user orders
// @access  Private
router.get('/orders', authenticateToken, async (req: Request, res: Response) => {
    try {
        const orders = await Order.find({ user: (req as any).user.id });
        res.json(orders);
    } catch (err: any) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.post('/profile-image', authenticateToken, upload.single('profileImage'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No file uploaded' });
        }
        const user = await User.findById((req as any).user.id);
        if (user) {
            user.profileImageUrl = `/uploads/${req.file.filename}`;
            await user.save();
            res.json({ success: true, data: user });
        } else {
            res.status(404).json({ success: false, error: 'User not found' });
        }
    } catch (err: any) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

router.delete('/profile-image', authenticateToken, async (req: Request, res: Response) => {
    try {
        const user = await User.findById((req as any).user.id);
        if (user) {
            user.profileImageUrl = '/uploads/default-avatar.png';
            await user.save();
            res.json({ success: true, data: user });
        } else {
            res.status(404).json({ success: false, error: 'User not found' });
        }
    } catch (err: any) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

export default router;

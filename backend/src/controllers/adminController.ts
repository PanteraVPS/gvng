import { Request, Response } from 'express';
import { User } from '../models/User';

export const getAllUsers = async (req: Request, res: Response) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users' });
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { firstName, lastName, email, role, password } = req.body;

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.firstName = firstName || user.firstName;
        user.lastName = lastName || user.lastName;
        user.email = email || user.email;
        user.role = role || user.role;

        if (password) {
            user.password = password;
        }

        await user.save();
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error updating user' });
    }
};

export const banUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const user = await User.findById(id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.isBanned = true;
        user.bannedReason = reason || 'No reason provided';
        
        const ip = req.ip;
        if (ip) {
            user.lastLoginIp = ip;
            if (user.ipHistory) {
                user.ipHistory.push(ip);
            } else {
                user.ipHistory = [ip];
            }
        }

        await user.save();
        res.json({ message: 'User banned successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error banning user' });
    }
};

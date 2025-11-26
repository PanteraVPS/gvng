import { Router, Request, Response } from 'express';
import { Settings } from '../models/Settings';
import { authenticateToken, isAdmin } from '../middleware/auth';

const router = Router();

router.get('/', async (_req: Request, res: Response) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
      await settings.save();
    }
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/', authenticateToken, isAdmin, async (req: Request, res: Response) => {
  try {
    const { logoUrl } = req.body;
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings();
    }
    settings.logoUrl = logoUrl || settings.logoUrl;
    await settings.save();
    res.json(settings);
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

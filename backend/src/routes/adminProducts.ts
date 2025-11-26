import { Router, Request, Response } from 'express'
import multer from 'multer'
import path from 'path'
import { Product } from '../models/Product'

const router = Router()

const ALLOWED_MIME = new Set(['image/jpeg','image/png','image/webp','image/gif'])
const MAX_IMAGE_BYTES = 5 * 1024 * 1024 // 5MB

function validateImageIfDataUrl(image?: string) {
  if (!image || typeof image !== 'string') return
  if (image.startsWith('http://') || image.startsWith('https://')) return
  const m = image.match(/^data:([a-zA-Z0-9.+\-\/]+);base64,(.*)$/)
  if (!m) throw Object.assign(new Error('Invalid image format. Expected data URL or http(s) URL.'), { status: 400 })
  const mime = m[1].toLowerCase()
  const b64 = m[2]
  if (!ALLOWED_MIME.has(mime)) throw Object.assign(new Error('Unsupported image type. Allowed: JPEG, PNG, WEBP, GIF.'), { status: 400 })
  const padding = (b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0)
  const bytes = Math.max(0, Math.floor(b64.length * 3 / 4) - padding)
  if (bytes > MAX_IMAGE_BYTES) throw Object.assign(new Error(`Image too large. Max ${Math.round(MAX_IMAGE_BYTES/1024/1024 * 10)/10}MB.`), { status: 413 })
}

// Multer setup for multipart/form-data uploads
type MFile = { mimetype: string; originalname: string }
type DestCB = (error: Error | null, destination: string) => void
type NameCB = (error: Error | null, filename: string) => void

const storage: multer.StorageEngine = multer.diskStorage({
  destination: (_req: Request, _file: MFile, cb: DestCB) => cb(null, path.join(__dirname, '..', '..', 'uploads')),
  filename: (_req: Request, file: MFile, cb: NameCB) => {
    const safeBase = path.parse(file.originalname).name.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 40) || 'img'
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9)
    const ext = path.extname(file.originalname) || '.png'
    cb(null, `${safeBase}-${unique}${ext}`)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: MAX_IMAGE_BYTES },
  fileFilter: (_req: Request, file: MFile, cb: (error: Error | null, acceptFile?: boolean) => void) => {
    if (ALLOWED_MIME.has(file.mimetype)) cb(null, true)
    else cb(new Error('Unsupported image type. Allowed: JPEG, PNG, WEBP, GIF.'))
  }
})

// List admin custom products
router.get('/', async (_req: Request, res: Response) => {
  try {
    const products = await Product.find({ isCustom: true }).sort({ createdAt: -1 })
    res.json({ success: true, data: products })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

// Create
router.post('/', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const { isFeatured, ...productData } = req.body || {};
    const featuredRaw = isFeatured;
    const featured = featuredRaw === true || featuredRaw === 'true' || featuredRaw === 1 || featuredRaw === '1';

    // Normalize arrays possibly received as comma-separated strings
    const normArr = (v: any): string[] => Array.isArray(v) ? v : (typeof v === 'string' ? v.split(',').map(s=>s.trim()).filter(Boolean) : [])
    const size = normArr((productData as any).size)
    const color = normArr((productData as any).color)

    let imageUrl: string | undefined
    if ((req as any).file) {
      imageUrl = `/uploads/${(req as any).file.filename}`
    } else if (productData?.image && typeof productData.image === 'string') {
      if (productData.image.startsWith('http://') || productData.image.startsWith('https://')) {
        imageUrl = productData.image
      } else if (productData.image.startsWith('/uploads/')) {
        imageUrl = productData.image
      } else if (productData.image.startsWith('data:')) {
        throw Object.assign(new Error('Data URLs are not allowed. Upload a file or provide an http(s) URL.'), { status: 415 })
      } else {
        throw Object.assign(new Error('Invalid image. Upload a file or provide an http(s) URL.'), { status: 400 })
      }
    } else {
      throw Object.assign(new Error('Image is required'), { status: 400 })
    }

    const product = new Product({
      ...productData,
      size,
      color,
      image: imageUrl,
      isCustom: true,
      isFeatured: featured
    });

    await product.save();
    res.status(201).json({ success: true, data: product });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
});

// Purge ALL products (custom and catalog) — Dev use only
router.delete('/all', async (_req: Request, res: Response) => {
  try {
    const result = await Product.deleteMany({})
    res.json({ success: true, data: { deleted: result.deletedCount || 0 } })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

// Update
router.put('/:id', upload.single('image'), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { isFeatured, ...productData } = req.body || {};
    const featuredRaw = isFeatured;
    const featured = featuredRaw === true || featuredRaw === 'true' || featuredRaw === 1 || featuredRaw === '1';

    const normArr = (v: any): string[] => Array.isArray(v) ? v : (typeof v === 'string' ? v.split(',').map(s=>s.trim()).filter(Boolean) : [])
    const size = normArr((productData as any).size)
    const color = normArr((productData as any).color)

    let imageUrl: string | undefined
    if ((req as any).file) {
      imageUrl = `/uploads/${(req as any).file.filename}`
    } else if (productData?.image && typeof productData.image === 'string') {
      if (productData.image.startsWith('http://') || productData.image.startsWith('https://') || productData.image.startsWith('/uploads/')) {
        imageUrl = productData.image
      } else if (productData.image.startsWith('data:')) {
        throw Object.assign(new Error('Data URLs are not allowed. Upload a file or provide an http(s) URL.'), { status: 415 })
      } else {
        throw Object.assign(new Error('Invalid image. Upload a file or provide an http(s) URL.'), { status: 400 })
      }
    }

    const update = {
      ...productData,
      ...(size.length ? { size } : {}),
      ...(color.length ? { color } : {}),
      ...(imageUrl ? { image: imageUrl } : {}),
      isCustom: true,
      isFeatured: featured
    } as any;

    const product = await Product.findOneAndUpdate({ _id: id, isCustom: true }, update, { new: true });
    if (!product) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: product });
  } catch (e: any) {
    res.status(400).json({ success: false, error: e.message });
  }
});

// Delete
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const product = await Product.findOneAndDelete({ _id: id, isCustom: true })
    if (!product) return res.status(404).json({ success: false, error: 'Not found' })
    res.json({ success: true, data: { _id: id } })
  } catch (e: any) {
    res.status(500).json({ success: false, error: e.message })
  }
})

export default router
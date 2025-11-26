import { Router, Request, Response } from 'express';
import { Product } from '../models/Product';
import { Settings } from '../models/Settings';

const router = Router();

const sampleProducts = [
  {
    name: 'Classic Black T-Shirt',
    description: 'Comfortable and versatile black cotton t-shirt, perfect for everyday wear',
    price: 24.99,
    category: 'men',
    size: ['S', 'M', 'L', 'XL', 'XXL'],
    color: ['Black', 'White', 'Gray'],
    stock: 50,
    image: 'https://via.placeholder.com/300x400?text=Black+T-Shirt',
    images: ['https://via.placeholder.com/300x400?text=Black+T-Shirt+1']
  },
  {
    name: "Women's White Blouse",
    description: 'Elegant white blouse suitable for both casual and professional settings',
    price: 39.99,
    category: 'women',
    size: ['XS', 'S', 'M', 'L', 'XL'],
    color: ['White', 'Beige'],
    stock: 35,
    image: 'https://via.placeholder.com/300x400?text=White+Blouse',
    images: ['https://via.placeholder.com/300x400?text=White+Blouse+1']
  },
  {
    name: "Kids' Colorful Hoodie",
    description: 'Fun and colorful hoodie for kids, perfect for playtime and casual outings',
    price: 34.99,
    category: 'kids',
    size: ['2T', '3T', '4T', '5T', '6T'],
    color: ['Blue', 'Pink', 'Yellow'],
    stock: 40,
    image: 'https://via.placeholder.com/300x400?text=Kids+Hoodie',
    images: ['https://via.placeholder.com/300x400?text=Kids+Hoodie+1']
  },
  {
    name: 'Sports Socks Pack',
    description: 'Set of 6 comfortable sports socks with excellent cushioning',
    price: 19.99,
    category: 'accessories',
    size: ['One Size'],
    color: ['Black', 'White', 'Gray'],
    stock: 100,
    image: 'https://via.placeholder.com/300x400?text=Sports+Socks',
    images: ['https://via.placeholder.com/300x400?text=Sports+Socks+1']
  }
];

router.post('/seed', async (_req: Request, res: Response) => {
  try {
    await Product.deleteMany({});
    await Product.insertMany(sampleProducts);

    await Settings.deleteMany({});
    const settings = new Settings({ logoUrl: 'https://i.imgur.com/gOE1K3j.png' });
    await settings.save();

    res.json({ success: true, seeded: sampleProducts.length });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

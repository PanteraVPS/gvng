import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  size: string[];
  color: string[];
  stock: number;
  image: string;
  images?: string[];
  rating?: number;
  reviews?: any[];
  createdAt?: Date;
  updatedAt?: Date;
  isCustom?: boolean;
  isFeatured?: boolean;
}

const productSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a product name'],
      trim: true
    },
    description: {
      type: String,
      required: [true, 'Please provide a description']
    },
    price: {
      type: Number,
      required: [true, 'Please provide a price'],
      min: 0
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      enum: ['men', 'women', 'kids', 'accessories']
    },
    size: {
      type: [String],
      default: []
    },
    color: {
      type: [String],
      default: []
    },
    stock: {
      type: Number,
      default: 0,
      min: 0
    },
    image: {
      type: String,
      required: [true, 'Please provide a main image']
    },
    images: {
      type: [String],
      default: []
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    reviews: {
      type: [Schema.Types.ObjectId],
      ref: 'Review',
      default: []
    },
    isCustom: {
      type: Boolean,
      default: false,
      index: true
    }
    ,
    isFeatured: {
      type: Boolean,
      default: false,
      index: true
    }
  },
  { timestamps: true }
);

export const Product = mongoose.model<IProduct>('Product', productSchema);

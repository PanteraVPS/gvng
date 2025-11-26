import mongoose, { Schema, Document, Model } from 'mongoose';

export interface OrderItem {
  productId?: mongoose.Types.ObjectId;
  name: string;
  price: number; // unit price
  quantity: number;
  category?: string;
  isFeatured?: boolean;
}

export interface OrderDocument extends Document {
  items: OrderItem[];
  total: number;
  currency: string;
  status: 'pending' | 'paid' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const OrderItemSchema = new Schema<OrderItem>({
  productId: { type: Schema.Types.ObjectId, ref: 'Product', required: false },
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  quantity: { type: Number, required: true, min: 1 },
  category: { type: String, required: false },
  isFeatured: { type: Boolean, required: false, default: false }
}, { _id: false });

const OrderSchema = new Schema<OrderDocument>({
  items: { type: [OrderItemSchema], required: true, default: [] },
  total: { type: Number, required: true, min: 0 },
  currency: { type: String, required: true, default: 'USD' },
  status: { type: String, enum: ['pending', 'paid', 'completed', 'cancelled'], default: 'paid' }
}, { timestamps: true });

export const Order: Model<OrderDocument> = mongoose.models.Order || mongoose.model<OrderDocument>('Order', OrderSchema);

export default Order;

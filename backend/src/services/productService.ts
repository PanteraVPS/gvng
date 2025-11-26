import { Product, IProduct } from '../models/Product';

export class ProductService {
  async getAllProducts(query?: any): Promise<IProduct[]> {
    return await Product.find(query || {});
  }

  async getProductById(id: string): Promise<IProduct | null> {
    return await Product.findById(id);
  }

  async createProduct(productData: Partial<IProduct>): Promise<IProduct> {
    const product = new Product(productData);
    return await product.save();
  }

  async updateProduct(id: string, productData: Partial<IProduct>): Promise<IProduct | null> {
    return await Product.findByIdAndUpdate(id, productData, { new: true });
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await Product.findByIdAndDelete(id);
    return !!result;
  }

  async searchProducts(searchTerm: string): Promise<IProduct[]> {
    return await Product.find({
      $or: [
        { name: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ]
    });
  }

  async getProductsByCategory(category: string): Promise<IProduct[]> {
    return await Product.find({ category });
  }
}

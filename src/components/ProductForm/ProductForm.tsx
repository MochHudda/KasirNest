import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { ProductService } from '../../services/productService';
import { ProductFormData } from '../../types';
import { Save, X } from 'lucide-react';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  price: z.number().min(0, 'Price must be positive'),
  cost: z.number().min(0, 'Cost must be positive').optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  stock: z.number().min(0, 'Stock must be non-negative'),
  minStock: z.number().min(0, 'Min stock must be non-negative').optional(),
  maxStock: z.number().min(0, 'Max stock must be non-negative').optional(),
});

interface ProductFormProps {
  productId?: string;
  initialData?: ProductFormData;
  onSave?: (product: any) => void;
  onCancel?: () => void;
}

export function ProductForm({ productId, initialData, onSave, onCancel }: ProductFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialData || {
      name: '',
      description: '',
      category: '',
      price: 0,
      cost: 0,
      stock: 0,
      minStock: 0,
      maxStock: 0,
    }
  });

  const onSubmit = async (data: ProductFormData) => {
    setLoading(true);
    setError('');

    try {
      let response;
      
      if (productId) {
        // Update existing product
        response = await ProductService.updateProduct(productId, data);
      } else {
        // Create new product
        response = await ProductService.createProduct(data, 'current-user-id'); // TODO: Get from auth context
      }

      if (response.success) {
        onSave?.(response.data);
        if (!productId) {
          reset(); // Reset form for new products
        }
      } else {
        setError(response.error || 'Failed to save product');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {productId ? 'Edit Product' : 'Add New Product'}
          </h2>
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel} icon={X}>
              Cancel
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Input
                label="Product Name"
                {...register('name')}
                error={errors.name?.message}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                {...register('description')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Product description (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                {...register('category')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">Select Category</option>
                <option value="Men Basics">Men Basics</option>
                <option value="Women Basics">Women Basics</option>
                <option value="Kids Wear">Kids Wear</option>
                <option value="Baby Wear">Baby Wear</option>
                <option value="Accessories">Accessories</option>
                <option value="Footwear">Footwear</option>
              </select>
              {errors.category && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.category.message}
                </p>
              )}
            </div>

            <Input
              label="SKU"
              {...register('sku')}
              placeholder="Product SKU (optional)"
            />

            <Input
              label="Price (Rp)"
              type="number"
              step="1000"
              min="0"
              {...register('price', { valueAsNumber: true })}
              error={errors.price?.message}
              placeholder="25000"
            />

            <Input
              label="Cost (Rp)"
              type="number"
              step="1000"
              min="0"
              {...register('cost', { valueAsNumber: true })}
              placeholder="Product cost (optional)"
            />

            <Input
              label="Current Stock"
              type="number"
              {...register('stock', { valueAsNumber: true })}
              error={errors.stock?.message}
            />

            <Input
              label="Barcode"
              {...register('barcode')}
              placeholder="Product barcode (optional)"
            />

            <Input
              label="Min Stock"
              type="number"
              {...register('minStock', { valueAsNumber: true })}
              placeholder="Minimum stock level"
            />

            <Input
              label="Max Stock"
              type="number"
              {...register('maxStock', { valueAsNumber: true })}
              placeholder="Maximum stock level"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" loading={loading} icon={Save}>
              {productId ? 'Update Product' : 'Save Product'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
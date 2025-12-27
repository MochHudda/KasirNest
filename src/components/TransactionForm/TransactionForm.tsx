import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { ProductService } from '../../services/productService';
import { TransactionService } from '../../services/transactionService';
import { Product, TransactionFormData } from '../../types';
import { formatCurrency } from '../../utils/format';
import { Plus, Trash2, ShoppingCart, CreditCard, DollarSign, Smartphone } from 'lucide-react';

const transactionSchema = z.object({
  items: z.array(z.object({
    productId: z.string().min(1, 'Product is required'),
    quantity: z.number().min(1, 'Quantity must be at least 1'),
    price: z.number().min(0, 'Price must be positive'),
    discount: z.number().min(0, 'Discount must be positive').optional(),
  })).min(1, 'At least one item is required'),
  paymentMethod: z.enum(['cash', 'card', 'digital', 'credit']),
  discount: z.number().min(0, 'Discount must be positive').optional(),
  notes: z.string().optional(),
  customer: z.object({
    name: z.string().min(1, 'Customer name is required'),
    email: z.string().email().optional(),
    phone: z.string().optional(),
  }).optional(),
});

interface TransactionFormProps {
  onSave?: (transaction: any) => void;
  onCancel?: () => void;
}

export function TransactionForm({ onSave, onCancel }: TransactionFormProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
    reset
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      items: [{ productId: '', quantity: 1, price: 0, discount: 0 }],
      paymentMethod: 'cash',
      discount: 0,
      notes: '',
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'items'
  });

  const watchedItems = watch('items');
  const watchedDiscount = watch('discount');

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [watchedItems, watchedDiscount]);

  const loadProducts = async () => {
    try {
      const response = await ProductService.getProducts();
      if (response.success) {
        setProducts(response.data || []);
      }
    } catch (err: any) {
      console.error('Failed to load products:', err);
    }
  };

  const calculateTotals = () => {
    const itemsSubtotal = watchedItems.reduce((sum, item) => {
      if (item.productId && item.quantity && item.price) {
        const itemTotal = (item.price * item.quantity) - (item.discount || 0);
        return sum + itemTotal;
      }
      return sum;
    }, 0);

    const discount = watchedDiscount || 0;
    const finalTotal = itemsSubtotal - discount;

    setSubtotal(itemsSubtotal);
    setTotal(Math.max(0, finalTotal));
  };

  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      setValue(`items.${index}.price`, product.price);
    }
  };

  const addItem = () => {
    append({ productId: '', quantity: 1, price: 0, discount: 0 });
  };

  const removeItem = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const onSubmit = async (data: TransactionFormData) => {
    setLoading(true);
    setError('');

    try {
      const response = await TransactionService.createTransaction(data, 'current-user-id'); // TODO: Get from auth context

      if (response.success) {
        onSave?.(response.data);
        reset(); // Reset form after successful transaction
      } else {
        setError(response.error || 'Failed to create transaction');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create transaction');
    } finally {
      setLoading(false);
    }
  };

  const paymentMethods = [
    { value: 'cash', label: 'Cash', icon: DollarSign },
    { value: 'card', label: 'Card', icon: CreditCard },
    { value: 'digital', label: 'Digital', icon: Smartphone },
    { value: 'credit', label: 'Credit', icon: CreditCard },
  ];

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            New Transaction
          </h2>
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
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

          {/* Items Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-md font-medium text-gray-900">Items</h3>
              <Button type="button" variant="outline" size="sm" onClick={addItem} icon={Plus}>
                Add Item
              </Button>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Product
                      </label>
                      <select
                        {...register(`items.${index}.productId`)}
                        onChange={(e) => handleProductSelect(index, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="">Select product...</option>
                        {products.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.name} ({formatCurrency(product.price)})
                          </option>
                        ))}
                      </select>
                      {errors.items?.[index]?.productId && (
                        <p className="text-sm text-red-600 mt-1">
                          {errors.items[index]?.productId?.message}
                        </p>
                      )}
                    </div>

                    <Input
                      label="Quantity"
                      type="number"
                      min="1"
                      {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                      error={errors.items?.[index]?.quantity?.message}
                    />

                    <Input
                      label="Price (Rp)"
                      type="number"
                      step="1000"
                      min="0"
                      {...register(`items.${index}.price`, { valueAsNumber: true })}
                      error={errors.items?.[index]?.price?.message}
                    />

                    <Input
                      label="Discount (Rp)"
                      type="number"
                      step="1000"
                      min="0"
                      {...register(`items.${index}.discount`, { valueAsNumber: true })}
                    />

                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium text-gray-700">
                        Total: {formatCurrency(
                          (watchedItems[index]?.price || 0) * (watchedItems[index]?.quantity || 0) - (watchedItems[index]?.discount || 0)
                        )}
                      </div>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(index)}
                          className="text-red-600 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Information (Optional) */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-4">Customer Information (Optional)</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Customer Name"
                {...register('customer.name')}
                placeholder="Enter customer name"
              />
              <Input
                label="Email"
                type="email"
                {...register('customer.email')}
                placeholder="customer@example.com"
              />
              <Input
                label="Phone"
                {...register('customer.phone')}
                placeholder="Phone number"
              />
            </div>
          </div>

          {/* Payment and Totals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">Payment Method</h3>
              <div className="grid grid-cols-2 gap-2">
                {paymentMethods.map(method => {
                  const Icon = method.icon;
                  return (
                    <label key={method.value} className="relative">
                      <input
                        type="radio"
                        {...register('paymentMethod')}
                        value={method.value}
                        className="sr-only peer"
                      />
                      <div className="p-3 border border-gray-300 rounded-lg cursor-pointer peer-checked:border-primary-500 peer-checked:bg-primary-50 flex items-center gap-2">
                        <Icon className="w-5 h-5" />
                        <span className="text-sm font-medium">{method.label}</span>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4">Summary</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Discount:</span>
                  <span>-{formatCurrency(watchedDiscount || 0)}</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total:</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <Input
                  label="Additional Discount (Rp)"
                  type="number"
                  step="1000"
                  min="0"
                  {...register('discount', { valueAsNumber: true })}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Transaction notes (optional)"
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
            <Button type="submit" loading={loading} disabled={total <= 0}>
              Complete Transaction ({formatCurrency(total)})
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
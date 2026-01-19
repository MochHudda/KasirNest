import { useState } from 'react';
import { TransactionForm } from '../components/TransactionForm';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Plus, Receipt } from 'lucide-react';

export default function TransactionsPage() {
  const [showForm, setShowForm] = useState(false);

  const handleSaveTransaction = (transaction: any) => {
    console.log('Transaction completed:', transaction);
    setShowForm(false);
    // Show success message and refresh transaction list
  };

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
        <div>
          <h1 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-2">Sales Transactions</h1>
          <p className="text-sm lg:text-base text-gray-600">Process apparel sales and manage customer transactions.</p>
        </div>
        <Button onClick={() => setShowForm(true)} icon={Plus} className="self-start sm:self-auto">
          New Sale
        </Button>
      </div>

      {showForm ? (
        <TransactionForm
          onSave={handleSaveTransaction}
          onCancel={() => setShowForm(false)}
        />
      ) : (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Recent Transactions</h2>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">No transactions yet</p>
              <p className="text-sm text-gray-400">
                Start by creating a new transaction
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, DollarSign, Calendar, FileText, Tag, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Transaction } from '@/pages/MoneyDashboard';

const transactionSchema = z.object({
  amount: z.number().positive('Amount must be greater than 0'),
  type: z.enum(['income', 'expense']),
  category: z.string().min(1, 'Category is required').max(50, 'Category must be less than 50 characters'),
  description: z.string().min(1, 'Description is required').max(255, 'Description must be less than 255 characters'),
  date: z.string().refine((date) => {
    const d = new Date(date);
    return d <= new Date();
  }, 'Date cannot be in the future'),
});

type TransactionFormData = z.infer<typeof transactionSchema>;

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Transaction, 'id'>) => void;
  transaction?: Transaction | null;
  categories: string[];
}

export function TransactionModal({ isOpen, onClose, onSubmit, transaction, categories }: TransactionModalProps) {
  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'expense',
      date: new Date().toISOString().split('T')[0],
    },
  });

  const selectedType = watch('type');

  useEffect(() => {
    if (transaction) {
      reset({
        amount: transaction.amount,
        type: transaction.type,
        category: transaction.category,
        description: transaction.description,
        date: transaction.date,
      });
    } else {
      reset({
        amount: undefined,
        type: 'expense',
        category: '',
        description: '',
        date: new Date().toISOString().split('T')[0],
      });
    }
  }, [transaction, reset]);

  const handleFormSubmit = (data: TransactionFormData) => {
    onSubmit({
      amount: data.amount,
      type: data.type,
      category: data.category,
      description: data.description,
      date: data.date,
    });
    reset();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50"
          >
            <div className="glass-card p-6 mx-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  {transaction ? 'Edit Transaction' : 'Add Transaction'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
                {/* Type Selector */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setValue('type', 'income')}
                    className={cn(
                      "flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                      selectedType === 'income'
                        ? "border-money bg-money/10 text-money"
                        : "border-border hover:border-muted-foreground"
                    )}
                  >
                    <TrendingUp className="w-5 h-5" />
                    <span className="font-medium">Income</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setValue('type', 'expense')}
                    className={cn(
                      "flex items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
                      selectedType === 'expense'
                        ? "border-destructive bg-destructive/10 text-destructive"
                        : "border-border hover:border-muted-foreground"
                    )}
                  >
                    <TrendingDown className="w-5 h-5" />
                    <span className="font-medium">Expense</span>
                  </button>
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Amount</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      className="pl-10 h-12 bg-input border-border"
                      {...register('amount', { valueAsNumber: true })}
                    />
                  </div>
                  {errors.amount && (
                    <p className="text-sm text-destructive">{errors.amount.message}</p>
                  )}
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Category</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <select
                      className="w-full h-12 pl-10 pr-4 bg-input border border-border rounded-lg appearance-none cursor-pointer focus:ring-2 focus:ring-money/20 focus:border-money"
                      {...register('category')}
                    >
                      <option value="">Select category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                  {errors.category && (
                    <p className="text-sm text-destructive">{errors.category.message}</p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Description</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <textarea
                      placeholder="What was this transaction for?"
                      className="w-full min-h-[80px] pl-10 pr-4 py-3 bg-input border border-border rounded-lg resize-none focus:ring-2 focus:ring-money/20 focus:border-money"
                      {...register('description')}
                    />
                  </div>
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description.message}</p>
                  )}
                </div>

                {/* Date */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="date"
                      max={new Date().toISOString().split('T')[0]}
                      className="pl-10 h-12 bg-input border-border"
                      {...register('date')}
                    />
                  </div>
                  {errors.date && (
                    <p className="text-sm text-destructive">{errors.date.message}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1 h-12"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className={cn(
                      "flex-1 h-12 text-primary-foreground",
                      selectedType === 'income' ? "bg-gradient-money" : "bg-destructive hover:bg-destructive/90"
                    )}
                  >
                    {transaction ? 'Update' : 'Add'} Transaction
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  DollarSign,
  Edit2,
  Trash2,
  Filter,
  ArrowUpRight,
  ArrowDownLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { TransactionModal } from '@/components/TransactionModal';
import { cn } from '@/lib/utils';

export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: string;
}

const defaultCategories = ['Business', 'Personal', 'Personal Business', 'Food', 'Transport', 'Entertainment'];

// Demo data
const initialTransactions: Transaction[] = [
  { id: '1', amount: 5000, type: 'income', category: 'Business', description: 'Client payment for project', date: '2025-01-01' },
  { id: '2', amount: 150, type: 'expense', category: 'Food', description: 'Weekly groceries', date: '2024-12-30' },
  { id: '3', amount: 2500, type: 'income', category: 'Business', description: 'Consulting fee', date: '2024-12-28' },
  { id: '4', amount: 800, type: 'expense', category: 'Transport', description: 'Monthly fuel', date: '2024-12-25' },
  { id: '5', amount: 200, type: 'expense', category: 'Entertainment', description: 'Concert tickets', date: '2024-12-20' },
  { id: '6', amount: 1200, type: 'expense', category: 'Personal', description: 'New laptop accessories', date: '2024-12-15' },
];

type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export default function MoneyDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('monthly');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const { toast } = useToast();

  const calculateSummary = () => {
    const now = new Date();
    const filtered = transactions.filter(t => {
      const tDate = new Date(t.date);
      switch (selectedPeriod) {
        case 'daily':
          return tDate.toDateString() === now.toDateString();
        case 'weekly':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          return tDate >= weekAgo;
        case 'monthly':
          return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear();
        case 'yearly':
          return tDate.getFullYear() === now.getFullYear();
        default:
          return true;
      }
    });

    const income = filtered.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenses = filtered.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    return {
      income,
      expenses,
      balance: income - expenses,
      transactionCount: filtered.length,
    };
  };

  const summary = calculateSummary();

  const handleAddTransaction = (data: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...data,
      id: crypto.randomUUID(),
    };
    setTransactions([newTransaction, ...transactions]);
    toast({
      title: "Transaction added",
      description: `${data.type === 'income' ? 'Income' : 'Expense'} of $${data.amount} recorded.`,
    });
    setIsModalOpen(false);
  };

  const handleEditTransaction = (data: Omit<Transaction, 'id'>) => {
    if (!editingTransaction) return;
    setTransactions(transactions.map(t => 
      t.id === editingTransaction.id ? { ...data, id: t.id } : t
    ));
    toast({
      title: "Transaction updated",
      description: "Your transaction has been updated.",
    });
    setEditingTransaction(null);
    setIsModalOpen(false);
  };

  const handleDeleteTransaction = (id: string) => {
    setTransactions(transactions.filter(t => t.id !== id));
    toast({
      title: "Transaction deleted",
      description: "The transaction has been removed.",
    });
  };

  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div>
          <h1 className="text-3xl font-bold text-gradient-money">Money Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track your income and expenses</p>
        </div>
        <Button onClick={openAddModal} className="bg-gradient-money text-primary-foreground hover:opacity-90">
          <Plus className="w-5 h-5 mr-2" />
          Add Transaction
        </Button>
      </motion.div>

      {/* Period Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 p-1 bg-muted/50 rounded-xl w-fit"
      >
        {(['daily', 'weekly', 'monthly', 'yearly'] as TimePeriod[]).map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              selectedPeriod === period
                ? "bg-money text-primary-foreground shadow-lg"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {period.charAt(0).toUpperCase() + period.slice(1)}
          </button>
        ))}
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card-money p-6 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-muted-foreground text-sm font-medium">Total Balance</span>
            <DollarSign className="w-5 h-5 text-money" />
          </div>
          <p className={cn(
            "text-3xl font-bold",
            summary.balance >= 0 ? "text-money" : "text-destructive"
          )}>
            ${Math.abs(summary.balance).toLocaleString()}
          </p>
          <p className="text-muted-foreground text-sm mt-1">
            {summary.transactionCount} transactions
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-money p-6 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-muted-foreground text-sm font-medium">Income</span>
            <TrendingUp className="w-5 h-5 text-money" />
          </div>
          <p className="text-3xl font-bold text-money">
            ${summary.income.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 mt-1 text-sm text-money">
            <ArrowUpRight className="w-4 h-4" />
            <span>This {selectedPeriod.replace('ly', '')}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card-money p-6 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-muted-foreground text-sm font-medium">Expenses</span>
            <TrendingDown className="w-5 h-5 text-destructive" />
          </div>
          <p className="text-3xl font-bold text-destructive">
            ${summary.expenses.toLocaleString()}
          </p>
          <div className="flex items-center gap-1 mt-1 text-sm text-destructive">
            <ArrowDownLeft className="w-4 h-4" />
            <span>This {selectedPeriod.replace('ly', '')}</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-money p-6 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-muted-foreground text-sm font-medium">Savings Rate</span>
            <Filter className="w-5 h-5 text-money" />
          </div>
          <p className="text-3xl font-bold text-foreground">
            {summary.income > 0 ? Math.round((summary.balance / summary.income) * 100) : 0}%
          </p>
          <p className="text-muted-foreground text-sm mt-1">
            Of total income
          </p>
        </motion.div>
      </div>

      {/* Transactions List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="glass-card overflow-hidden"
      >
        <div className="p-6 border-b border-border">
          <h2 className="text-xl font-semibold">Recent Transactions</h2>
        </div>
        <div className="divide-y divide-border">
          <AnimatePresence>
            {transactions.slice(0, 10).map((transaction, index) => (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    transaction.type === 'income' ? "bg-money/20" : "bg-destructive/20"
                  )}>
                    {transaction.type === 'income' ? (
                      <ArrowUpRight className="w-5 h-5 text-money" />
                    ) : (
                      <ArrowDownLeft className="w-5 h-5 text-destructive" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="px-2 py-0.5 bg-muted rounded-full text-xs">{transaction.category}</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(transaction.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={cn(
                    "text-lg font-semibold",
                    transaction.type === 'income' ? "text-money" : "text-destructive"
                  )}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEditModal(transaction)}
                      className="p-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </button>
                    <button
                      onClick={() => handleDeleteTransaction(transaction.id)}
                      className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTransaction(null);
        }}
        onSubmit={editingTransaction ? handleEditTransaction : handleAddTransaction}
        transaction={editingTransaction}
        categories={defaultCategories}
      />
    </div>
  );
}

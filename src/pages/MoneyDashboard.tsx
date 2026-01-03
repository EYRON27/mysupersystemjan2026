import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  DollarSign,
  Edit2,
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
  Loader2,
  PieChart,
  RefreshCw,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { TransactionModal } from '@/components/TransactionModal';
import { cn } from '@/lib/utils';
import { 
  transactionService, 
  Transaction, 
  TransactionSummary, 
  Category,
  TransactionFormData 
} from '@/lib/transaction.service';
import { getErrorMessage } from '@/lib/api';

type TimePeriod = 'daily' | 'weekly' | 'monthly' | 'yearly';

export default function MoneyDashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<TimePeriod>('monthly');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { toast } = useToast();

  // Fetch transactions and summary
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [transactionsRes, summaryRes, categoriesRes] = await Promise.all([
        transactionService.getAll({ period: selectedPeriod, page: currentPage, limit: 10 }),
        transactionService.getSummary(selectedPeriod),
        transactionService.getCategories(),
      ]);
      
      setTransactions(transactionsRes.transactions);
      setTotalPages(transactionsRes.pagination.totalPages);
      setSummary(summaryRes);
      setCategories(categoriesRes);
    } catch (error) {
      toast({
        title: "Error loading data",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedPeriod, currentPage, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddTransaction = async (data: TransactionFormData) => {
    setIsSaving(true);
    try {
      await transactionService.create(data);
      toast({
        title: "Transaction added",
        description: `${data.type === 'income' ? 'Income' : 'Expense'} of $${data.amount} recorded.`,
      });
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditTransaction = async (data: TransactionFormData) => {
    if (!editingTransaction) return;
    setIsSaving(true);
    try {
      await transactionService.update(editingTransaction.id, data);
      toast({
        title: "Transaction updated",
        description: "Your transaction has been updated.",
      });
      setEditingTransaction(null);
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    try {
      await transactionService.delete(id);
      toast({
        title: "Transaction deleted",
        description: "The transaction has been removed.",
      });
      fetchData();
    } catch (error) {
      toast({
        title: "Error",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingTransaction(null);
    setIsModalOpen(true);
  };

  if (isLoading && !transactions.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-money" />
      </div>
    );
  }

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
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchData}
            disabled={isLoading}
            className="border-border hover:border-money/50"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </Button>
          <Button onClick={openAddModal} className="bg-gradient-money text-primary-foreground hover:opacity-90">
            <Plus className="w-5 h-5 mr-2" />
            Add Transaction
          </Button>
        </div>
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
            onClick={() => {
              setSelectedPeriod(period);
              setCurrentPage(1);
            }}
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
            (summary?.balance || 0) >= 0 ? "text-money" : "text-destructive"
          )}>
            ${Math.abs(summary?.balance || 0).toLocaleString()}
          </p>
          <p className="text-muted-foreground text-sm mt-1">
            {summary?.transactionCount || 0} transactions
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
            ${(summary?.income || 0).toLocaleString()}
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
            ${(summary?.expenses || 0).toLocaleString()}
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
            <PieChart className="w-5 h-5 text-money" />
          </div>
          <p className="text-3xl font-bold text-foreground">
            {summary?.savingsRate || 0}%
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
        <div className="p-6 border-b border-border flex items-center justify-between">
          <h2 className="text-xl font-semibold">Recent Transactions</h2>
          {isLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
        </div>
        <div className="divide-y divide-border">
          <AnimatePresence mode="popLayout">
            {transactions.length > 0 ? (
              transactions.map((transaction, index) => (
                <motion.div
                  key={transaction.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.03 }}
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
              ))
            ) : (
              <div className="p-12 text-center text-muted-foreground">
                <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No transactions found for this period.</p>
                <p className="text-sm mt-1">Add your first transaction to get started!</p>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-border flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm text-muted-foreground px-4">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
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
        categories={categories}
        isLoading={isSaving}
      />
    </div>
  );
}

export type { Transaction };

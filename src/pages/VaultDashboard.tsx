import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Eye, 
  EyeOff,
  Globe,
  User,
  Lock,
  Edit2,
  Trash2,
  Search,
  Shield,
  Copy,
  Check,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { PasswordModal } from '@/components/PasswordModal';
import { cn } from '@/lib/utils';
import { 
  vaultService, 
  VaultEntry, 
  VaultCategory, 
  VaultFormData 
} from '@/lib/vault.service';
import { getErrorMessage } from '@/lib/api';

export default function VaultDashboard() {
  const [passwords, setPasswords] = useState<VaultEntry[]>([]);
  const [categories, setCategories] = useState<VaultCategory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [visiblePasswords, setVisiblePasswords] = useState<Map<string, string>>(new Map());
  const [revealingId, setRevealingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPassword, setEditingPassword] = useState<VaultEntry | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [entriesRes, categoriesRes] = await Promise.all([
        vaultService.getAll({
          categoryId: selectedCategory !== 'all' ? selectedCategory : undefined,
          search: searchQuery || undefined,
        }),
        vaultService.getCategories(),
      ]);
      setPasswords(entriesRes.entries);
      setCategories(categoriesRes);
    } catch (error) {
      toast({
        title: "Error loading vault",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategory, searchQuery, toast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getCategoryCounts = () => {
    return passwords.reduce((acc, p) => {
      if (p.categoryId) {
        acc[p.categoryId] = (acc[p.categoryId] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
  };

  const categoryCounts = getCategoryCounts();

  const togglePasswordVisibility = async (id: string) => {
    if (visiblePasswords.has(id)) {
      // Hide password
      setVisiblePasswords(prev => {
        const newMap = new Map(prev);
        newMap.delete(id);
        return newMap;
      });
      return;
    }

    // Reveal password - requires re-authentication
    setRevealingId(id);
    try {
      const password = prompt('Enter your password to reveal this credential:');
      if (!password) {
        setRevealingId(null);
        return;
      }
      
      const revealed = await vaultService.reveal(id, password);
      
      setVisiblePasswords(prev => {
        const newMap = new Map(prev);
        newMap.set(id, revealed.password);
        return newMap;
      });

      // Auto-hide after 10 seconds
      setTimeout(() => {
        setVisiblePasswords(prev => {
          const newMap = new Map(prev);
          newMap.delete(id);
          return newMap;
        });
      }, 10000);
    } catch (error) {
      toast({
        title: "Authentication failed",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setRevealingId(null);
    }
  };

  const copyToClipboard = async (entry: VaultEntry, type: 'username' | 'password') => {
    const copyId = `${type}-${entry.id}`;
    
    try {
      if (type === 'password') {
        // Need to reveal password first if not already visible
        let password = visiblePasswords.get(entry.id);
        if (!password) {
          const userPassword = prompt('Enter your password to copy this credential:');
          if (!userPassword) return;
          
          const revealed = await vaultService.reveal(entry.id, userPassword);
          password = revealed.password;
        }
        
        await navigator.clipboard.writeText(password);
      } else {
        await navigator.clipboard.writeText(entry.username);
      }
      
      setCopiedId(copyId);
      toast({
        title: "Copied!",
        description: `${type === 'password' ? 'Password' : 'Username'} copied to clipboard.`,
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: getErrorMessage(error),
        variant: "destructive",
      });
    }
  };

  const handleAddPassword = async (data: VaultFormData) => {
    setIsSaving(true);
    try {
      await vaultService.create(data);
      toast({
        title: "Password saved",
        description: `Credentials for ${data.website} have been securely stored.`,
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

  const handleEditPassword = async (data: VaultFormData) => {
    if (!editingPassword) return;
    setIsSaving(true);
    try {
      await vaultService.update(editingPassword.id, data);
      toast({
        title: "Password updated",
        description: "Your credentials have been updated.",
      });
      setEditingPassword(null);
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

  const handleDeletePassword = async (id: string) => {
    try {
      await vaultService.delete(id);
      toast({
        title: "Password deleted",
        description: "The credentials have been removed.",
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

  const openEditModal = (password: VaultEntry) => {
    setEditingPassword(password);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingPassword(null);
    setIsModalOpen(true);
  };

  const maskPassword = (length: number = 12) => {
    return '•'.repeat(length);
  };

  const getCategoryName = (categoryId: string | null | undefined) => {
    if (!categoryId) return 'Uncategorized';
    const cat = categories.find(c => c.id === categoryId);
    return cat?.name || 'Uncategorized';
  };

  if (isLoading && !passwords.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-vault" />
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
          <h1 className="text-3xl font-bold text-gradient-vault">Password Vault</h1>
          <p className="text-muted-foreground mt-1">Securely store and manage your credentials</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={fetchData}
            disabled={isLoading}
          >
            <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button onClick={openAddModal} className="bg-gradient-vault text-primary-foreground hover:opacity-90">
            <Plus className="w-5 h-5 mr-2" />
            Add Password
          </Button>
        </div>
      </motion.div>

      {/* Security Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card-vault p-4 flex items-center gap-4"
      >
        <div className="w-10 h-10 rounded-xl bg-vault/20 flex items-center justify-center shrink-0">
          <Shield className="w-5 h-5 text-vault" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">Your passwords are encrypted</p>
          <p className="text-xs text-muted-foreground">All credentials are stored using AES-256 encryption. Revealing passwords requires re-authentication.</p>
        </div>
      </motion.div>

      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by website or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 bg-input border-border"
          />
        </div>
        <div className="flex gap-2 p-1 bg-muted/50 rounded-xl overflow-x-auto">
          <button
            onClick={() => setSelectedCategory('all')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap",
              selectedCategory === 'all'
                ? "bg-vault text-primary-foreground shadow-lg"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            All ({passwords.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap",
                selectedCategory === cat.id
                  ? "bg-vault text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {cat.name} ({categoryCounts[cat.id] || 0})
            </button>
          ))}
        </div>
      </motion.div>

      {/* Passwords Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {passwords.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className="card-vault p-5 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-vault/20 flex items-center justify-center">
                    <Globe className="w-5 h-5 text-vault" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{entry.website}</h3>
                    <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted rounded-full">
                      {getCategoryName(entry.categoryId)}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => openEditModal(entry)}
                    className="p-2 hover:bg-muted rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleDeletePassword(entry.id)}
                    className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                {/* Username */}
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <User className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="flex-1 text-sm truncate">{entry.username}</span>
                  <button
                    onClick={() => copyToClipboard(entry, 'username')}
                    className="p-1.5 hover:bg-muted rounded transition-colors"
                  >
                    {copiedId === `username-${entry.id}` ? (
                      <Check className="w-4 h-4 text-money" />
                    ) : (
                      <Copy className="w-4 h-4 text-muted-foreground" />
                    )}
                  </button>
                </div>

                {/* Password */}
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                  <span className="flex-1 text-sm font-mono">
                    {visiblePasswords.has(entry.id) ? visiblePasswords.get(entry.id) : maskPassword()}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => togglePasswordVisibility(entry.id)}
                      className="p-1.5 hover:bg-muted rounded transition-colors"
                      disabled={revealingId === entry.id}
                    >
                      {revealingId === entry.id ? (
                        <Loader2 className="w-4 h-4 text-vault animate-spin" />
                      ) : visiblePasswords.has(entry.id) ? (
                        <EyeOff className="w-4 h-4 text-vault" />
                      ) : (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                    <button
                      onClick={() => copyToClipboard(entry, 'password')}
                      className="p-1.5 hover:bg-muted rounded transition-colors"
                    >
                      {copiedId === `password-${entry.id}` ? (
                        <Check className="w-4 h-4 text-money" />
                      ) : (
                        <Copy className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>

                {entry.notes && (
                  <p className="text-xs text-muted-foreground italic">{entry.notes}</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {passwords.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <Lock className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No passwords found. Add your first secure credential!</p>
        </div>
      )}

      {/* Password Modal */}
      <PasswordModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingPassword(null);
        }}
        onSubmit={editingPassword ? handleEditPassword : handleAddPassword}
        password={editingPassword}
        categories={categories}
        isLoading={isSaving}
      />
    </div>
  );
}

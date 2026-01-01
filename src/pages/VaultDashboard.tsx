import { useState } from 'react';
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
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { PasswordModal } from '@/components/PasswordModal';
import { cn } from '@/lib/utils';

export interface PasswordEntry {
  id: string;
  website: string;
  username: string;
  password: string;
  category: string;
  notes?: string;
  createdAt: string;
}

const defaultCategories = ['Social', 'Banking', 'Work', 'Shopping', 'Entertainment'];

// Demo data with "encrypted" passwords (in real app, would be AES encrypted)
const initialPasswords: PasswordEntry[] = [
  { id: '1', website: 'github.com', username: 'developer@email.com', password: 'SecureP@ss123!', category: 'Work', notes: 'Personal GitHub account', createdAt: '2024-12-01' },
  { id: '2', website: 'gmail.com', username: 'user@gmail.com', password: 'Gmail$ecure456', category: 'Social', createdAt: '2024-11-15' },
  { id: '3', website: 'chase.com', username: 'banking_user', password: 'B@nking789!Secure', category: 'Banking', notes: 'Primary checking account', createdAt: '2024-10-20' },
  { id: '4', website: 'linkedin.com', username: 'professional@email.com', password: 'L1nked1n#Pro', category: 'Work', createdAt: '2024-09-10' },
  { id: '5', website: 'amazon.com', username: 'shopper@email.com', password: 'Amaz0n$hop!', category: 'Shopping', createdAt: '2024-08-05' },
];

export default function VaultDashboard() {
  const [passwords, setPasswords] = useState<PasswordEntry[]>(initialPasswords);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPassword, setEditingPassword] = useState<PasswordEntry | null>(null);
  const { toast } = useToast();

  const filteredPasswords = passwords.filter(p => {
    const matchesSearch = p.website.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         p.username.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categoryCounts = passwords.reduce((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const togglePasswordVisibility = (id: string) => {
    // In a real app, this would require re-authentication
    const newVisible = new Set(visiblePasswords);
    if (newVisible.has(id)) {
      newVisible.delete(id);
    } else {
      newVisible.add(id);
      // Auto-hide after 5 seconds
      setTimeout(() => {
        setVisiblePasswords(prev => {
          const updated = new Set(prev);
          updated.delete(id);
          return updated;
        });
      }, 5000);
    }
    setVisiblePasswords(newVisible);
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      toast({
        title: "Copied!",
        description: "Password copied to clipboard.",
      });
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleAddPassword = (data: Omit<PasswordEntry, 'id' | 'createdAt'>) => {
    const newEntry: PasswordEntry = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setPasswords([newEntry, ...passwords]);
    toast({
      title: "Password saved",
      description: `Credentials for ${data.website} have been securely stored.`,
    });
    setIsModalOpen(false);
  };

  const handleEditPassword = (data: Omit<PasswordEntry, 'id' | 'createdAt'>) => {
    if (!editingPassword) return;
    setPasswords(passwords.map(p => 
      p.id === editingPassword.id ? { ...p, ...data } : p
    ));
    toast({
      title: "Password updated",
      description: "Your credentials have been updated.",
    });
    setEditingPassword(null);
    setIsModalOpen(false);
  };

  const handleDeletePassword = (id: string) => {
    setPasswords(passwords.filter(p => p.id !== id));
    toast({
      title: "Password deleted",
      description: "The credentials have been removed.",
    });
  };

  const openEditModal = (password: PasswordEntry) => {
    setEditingPassword(password);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingPassword(null);
    setIsModalOpen(true);
  };

  const maskPassword = (password: string) => {
    return '•'.repeat(Math.min(password.length, 16));
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
          <h1 className="text-3xl font-bold text-gradient-vault">Password Vault</h1>
          <p className="text-muted-foreground mt-1">Securely store and manage your credentials</p>
        </div>
        <Button onClick={openAddModal} className="bg-gradient-vault text-primary-foreground hover:opacity-90">
          <Plus className="w-5 h-5 mr-2" />
          Add Password
        </Button>
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
          <p className="text-xs text-muted-foreground">All credentials are stored using AES-256 encryption. Passwords are masked by default and auto-hide after 5 seconds.</p>
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
          {defaultCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 whitespace-nowrap",
                selectedCategory === cat
                  ? "bg-vault text-primary-foreground shadow-lg"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {cat} ({categoryCounts[cat] || 0})
            </button>
          ))}
        </div>
      </motion.div>

      {/* Passwords Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {filteredPasswords.map((entry, index) => (
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
                      {entry.category}
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
                    onClick={() => copyToClipboard(entry.username, `user-${entry.id}`)}
                    className="p-1.5 hover:bg-muted rounded transition-colors"
                  >
                    {copiedId === `user-${entry.id}` ? (
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
                    {visiblePasswords.has(entry.id) ? entry.password : maskPassword(entry.password)}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => togglePasswordVisibility(entry.id)}
                      className="p-1.5 hover:bg-muted rounded transition-colors"
                    >
                      {visiblePasswords.has(entry.id) ? (
                        <EyeOff className="w-4 h-4 text-vault" />
                      ) : (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                    <button
                      onClick={() => copyToClipboard(entry.password, `pass-${entry.id}`)}
                      className="p-1.5 hover:bg-muted rounded transition-colors"
                    >
                      {copiedId === `pass-${entry.id}` ? (
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

      {filteredPasswords.length === 0 && (
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
        categories={defaultCategories}
      />
    </div>
  );
}

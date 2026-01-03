import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, Globe, User, Lock, Tag, FileText, Eye, EyeOff, Check, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { VaultEntry, VaultCategory, VaultFormData } from '@/lib/vault.service';

const passwordSchema = z.object({
  website: z.string().min(1, 'Website is required').max(100, 'Website must be less than 100 characters'),
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  categoryId: z.string().optional(),
  notes: z.string().max(500, 'Notes must be less than 500 characters').optional(),
});

type PasswordFormDataLocal = z.infer<typeof passwordSchema>;

interface PasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: VaultFormData) => void;
  password?: VaultEntry | null;
  categories: VaultCategory[];
  isLoading?: boolean;
}

const passwordStrength = (password: string) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
};

export function PasswordModal({ isOpen, onClose, onSubmit, password, categories, isLoading = false }: PasswordModalProps) {
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm<PasswordFormDataLocal>({
    resolver: zodResolver(passwordSchema),
  });

  const watchedPassword = watch('password', '');
  const strength = passwordStrength(watchedPassword);

  useEffect(() => {
    if (password) {
      reset({
        website: password.website,
        username: password.username,
        password: '', // Don't prefill password for security
        categoryId: password.categoryId || '',
        notes: password.notes || '',
      });
    } else {
      reset({
        website: '',
        username: '',
        password: '',
        categoryId: '',
        notes: '',
      });
    }
  }, [password, reset]);

  const handleFormSubmit = (data: PasswordFormDataLocal) => {
    onSubmit({
      website: data.website,
      username: data.username,
      password: data.password,
      categoryId: data.categoryId || undefined,
      notes: data.notes,
    });
  };

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let result = '';
    for (let i = 0; i < 16; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    reset({ ...watch(), password: result });
  };

  const getStrengthColor = () => {
    if (strength <= 2) return 'bg-destructive';
    if (strength <= 3) return 'bg-yellow-500';
    return 'bg-money';
  };

  const getStrengthLabel = () => {
    if (strength <= 2) return 'Weak';
    if (strength <= 3) return 'Medium';
    return 'Strong';
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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md z-50 max-h-[90vh] overflow-y-auto"
          >
            <div className="glass-card p-6 mx-4">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold">
                  {password ? 'Edit Password' : 'Add Password'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
                {/* Website */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Website / App</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="example.com"
                      className="pl-10 h-12 bg-input border-border"
                      {...register('website')}
                    />
                  </div>
                  {errors.website && (
                    <p className="text-sm text-destructive">{errors.website.message}</p>
                  )}
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Username / Email</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="your@email.com"
                      className="pl-10 h-12 bg-input border-border"
                      {...register('username')}
                    />
                  </div>
                  {errors.username && (
                    <p className="text-sm text-destructive">{errors.username.message}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-muted-foreground">Password</label>
                    <button
                      type="button"
                      onClick={generatePassword}
                      className="text-xs text-vault hover:underline"
                    >
                      Generate strong password
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter password"
                      className="pl-10 pr-10 h-12 bg-input border-border font-mono"
                      {...register('password')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {watchedPassword && (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div
                            key={i}
                            className={cn(
                              "h-1 flex-1 rounded-full transition-colors",
                              i <= strength ? getStrengthColor() : "bg-muted"
                            )}
                          />
                        ))}
                      </div>
                      <p className={cn(
                        "text-xs",
                        strength <= 2 ? "text-destructive" : strength <= 3 ? "text-yellow-500" : "text-money"
                      )}>
                        Password strength: {getStrengthLabel()}
                      </p>
                    </div>
                  )}
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Category</label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <select
                      className="w-full h-12 pl-10 pr-4 bg-input border border-border rounded-lg appearance-none cursor-pointer focus:ring-2 focus:ring-vault/20 focus:border-vault"
                      {...register('categoryId')}
                    >
                      <option value="">Select category (optional)</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  {errors.categoryId && (
                    <p className="text-sm text-destructive">{errors.categoryId.message}</p>
                  )}
                </div>

                {/* Notes */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Notes (optional)</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <textarea
                      placeholder="Add any additional notes..."
                      className="w-full min-h-[80px] pl-10 pr-4 py-3 bg-input border border-border rounded-lg resize-none focus:ring-2 focus:ring-vault/20 focus:border-vault"
                      {...register('notes')}
                    />
                  </div>
                  {errors.notes && (
                    <p className="text-sm text-destructive">{errors.notes.message}</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={onClose}
                    className="flex-1 h-12"
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1 h-12 bg-gradient-vault text-primary-foreground"
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {password ? 'Update' : 'Save'} Password
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

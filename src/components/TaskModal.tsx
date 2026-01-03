import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X, FileText, Calendar, AlignLeft, ListTodo, Play, CheckCircle2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Task, TaskFormData } from '@/lib/task.service';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
  description: z.string().max(300, 'Description must be less than 300 characters').optional(),
  status: z.enum(['todo', 'ongoing', 'completed']),
  deadline: z.string().min(1, 'Deadline is required'),
});

type FormData = z.infer<typeof taskSchema>;

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => void;
  task?: Task | null;
  isLoading?: boolean;
}

const statusOptions = [
  { value: 'todo', label: 'To Do', icon: ListTodo, colorClass: 'border-muted-foreground text-muted-foreground' },
  { value: 'ongoing', label: 'Ongoing', icon: Play, colorClass: 'border-tasks text-tasks bg-tasks/10' },
  { value: 'completed', label: 'Completed', icon: CheckCircle2, colorClass: 'border-money text-money bg-money/10' },
] as const;

export function TaskModal({ isOpen, onClose, onSubmit, task, isLoading = false }: TaskModalProps) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDeadline = tomorrow.toISOString().split('T')[0];

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      status: 'todo',
      deadline: defaultDeadline,
    },
  });

  const selectedStatus = watch('status');

  useEffect(() => {
    if (task) {
      reset({
        title: task.title,
        description: task.description || '',
        status: task.status,
        deadline: task.deadline.split('T')[0],
      });
    } else {
      reset({
        title: '',
        description: '',
        status: 'todo',
        deadline: defaultDeadline,
      });
    }
  }, [task, reset, defaultDeadline]);

  const handleFormSubmit = (data: FormData) => {
    onSubmit({
      title: data.title,
      description: data.description,
      status: data.status,
      deadline: data.deadline,
    });
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
                  {task ? 'Edit Task' : 'Add Task'}
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
                {/* Title */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Title</label>
                  <div className="relative">
                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Task title"
                      className="pl-10 h-12 bg-input border-border"
                      {...register('title')}
                    />
                  </div>
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Description (optional)</label>
                  <div className="relative">
                    <AlignLeft className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
                    <textarea
                      placeholder="Add more details..."
                      className="w-full min-h-[80px] pl-10 pr-4 py-3 bg-input border border-border rounded-lg resize-none focus:ring-2 focus:ring-tasks/20 focus:border-tasks"
                      {...register('description')}
                    />
                  </div>
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description.message}</p>
                  )}
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="grid grid-cols-3 gap-2">
                    {statusOptions.map((option) => {
                      const Icon = option.icon;
                      const isSelected = selectedStatus === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setValue('status', option.value)}
                          className={cn(
                            "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all duration-200",
                            isSelected ? option.colorClass : "border-border hover:border-muted-foreground"
                          )}
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-xs font-medium">{option.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Deadline */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Deadline</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      type="date"
                      min={new Date().toISOString().split('T')[0]}
                      className="pl-10 h-12 bg-input border-border"
                      {...register('deadline')}
                    />
                  </div>
                  {errors.deadline && (
                    <p className="text-sm text-destructive">{errors.deadline.message}</p>
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
                    className="flex-1 h-12 bg-gradient-tasks text-primary-foreground"
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {task ? 'Update' : 'Create'} Task
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

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  Calendar,
  Edit2,
  Trash2,
  ListTodo,
  Play,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { TaskModal } from '@/components/TaskModal';
import { cn } from '@/lib/utils';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'ongoing' | 'completed';
  deadline: string;
  createdAt: string;
}

// Demo data
const initialTasks: Task[] = [
  { id: '1', title: 'Review Q4 financial reports', description: 'Analyze revenue and expenses', status: 'todo', deadline: '2025-01-05', createdAt: '2025-01-01' },
  { id: '2', title: 'Update project documentation', description: 'Add new API endpoints to docs', status: 'ongoing', deadline: '2025-01-03', createdAt: '2024-12-28' },
  { id: '3', title: 'Client meeting preparation', description: 'Prepare slides and talking points', status: 'completed', deadline: '2024-12-30', createdAt: '2024-12-25' },
  { id: '4', title: 'Deploy new features', description: 'Push v2.0 to production', status: 'todo', deadline: '2025-01-10', createdAt: '2024-12-20' },
  { id: '5', title: 'Security audit', description: 'Review authentication flows', status: 'ongoing', deadline: '2025-01-08', createdAt: '2024-12-15' },
  { id: '6', title: 'Team standup notes', status: 'completed', deadline: '2024-12-28', createdAt: '2024-12-27' },
];

type StatusFilter = 'all' | 'todo' | 'ongoing' | 'completed';

export default function TasksDashboard() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const { toast } = useToast();

  const calculateSummary = () => {
    const now = new Date();
    const pending = tasks.filter(t => t.status !== 'completed').length;
    const completed = tasks.filter(t => t.status === 'completed').length;
    const overdue = tasks.filter(t => {
      if (t.status === 'completed') return false;
      return new Date(t.deadline) < now;
    }).length;
    const ongoing = tasks.filter(t => t.status === 'ongoing').length;

    return { pending, completed, overdue, ongoing };
  };

  const summary = calculateSummary();

  const filteredTasks = filter === 'all' 
    ? tasks 
    : tasks.filter(t => t.status === filter);

  const handleAddTask = (data: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString().split('T')[0],
    };
    setTasks([newTask, ...tasks]);
    toast({
      title: "Task created",
      description: `"${data.title}" has been added.`,
    });
    setIsModalOpen(false);
  };

  const handleEditTask = (data: Omit<Task, 'id' | 'createdAt'>) => {
    if (!editingTask) return;
    setTasks(tasks.map(t => 
      t.id === editingTask.id ? { ...t, ...data } : t
    ));
    toast({
      title: "Task updated",
      description: "Your task has been updated.",
    });
    setEditingTask(null);
    setIsModalOpen(false);
  };

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
    toast({
      title: "Task deleted",
      description: "The task has been removed.",
    });
  };

  const handleStatusChange = (id: string, newStatus: Task['status']) => {
    const task = tasks.find(t => t.id === id);
    if (task?.status === 'completed') {
      toast({
        title: "Cannot modify",
        description: "Completed tasks are read-only.",
        variant: "destructive",
      });
      return;
    }
    setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus } : t));
    toast({
      title: "Status updated",
      description: `Task marked as ${newStatus}.`,
    });
  };

  const openEditModal = (task: Task) => {
    if (task.status === 'completed') {
      toast({
        title: "Cannot edit",
        description: "Completed tasks are read-only.",
        variant: "destructive",
      });
      return;
    }
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const openAddModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const isOverdue = (task: Task) => {
    if (task.status === 'completed') return false;
    return new Date(task.deadline) < new Date();
  };

  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'todo': return ListTodo;
      case 'ongoing': return Play;
      case 'completed': return CheckCircle2;
    }
  };

  const getStatusColor = (status: Task['status'], overdue: boolean) => {
    if (overdue) return 'text-destructive bg-destructive/20';
    switch (status) {
      case 'todo': return 'text-muted-foreground bg-muted';
      case 'ongoing': return 'text-tasks bg-tasks/20';
      case 'completed': return 'text-money bg-money/20';
    }
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
          <h1 className="text-3xl font-bold text-gradient-tasks">Tasks Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your to-dos and deadlines</p>
        </div>
        <Button onClick={openAddModal} className="bg-gradient-tasks text-primary-foreground hover:opacity-90">
          <Plus className="w-5 h-5 mr-2" />
          Add Task
        </Button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card-tasks p-6 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-muted-foreground text-sm font-medium">Pending</span>
            <Clock className="w-5 h-5 text-tasks" />
          </div>
          <p className="text-3xl font-bold">{summary.pending}</p>
          <p className="text-muted-foreground text-sm mt-1">Tasks to complete</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="card-tasks p-6 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-muted-foreground text-sm font-medium">In Progress</span>
            <Play className="w-5 h-5 text-tasks" />
          </div>
          <p className="text-3xl font-bold text-tasks">{summary.ongoing}</p>
          <p className="text-muted-foreground text-sm mt-1">Currently working on</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card-tasks p-6 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-muted-foreground text-sm font-medium">Completed</span>
            <CheckCircle2 className="w-5 h-5 text-money" />
          </div>
          <p className="text-3xl font-bold text-money">{summary.completed}</p>
          <p className="text-muted-foreground text-sm mt-1">Successfully done</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card-tasks p-6 transition-all duration-300"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-muted-foreground text-sm font-medium">Overdue</span>
            <AlertCircle className="w-5 h-5 text-destructive" />
          </div>
          <p className="text-3xl font-bold text-destructive">{summary.overdue}</p>
          <p className="text-muted-foreground text-sm mt-1">Need attention</p>
        </motion.div>
      </div>

      {/* Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex gap-2 p-1 bg-muted/50 rounded-xl w-fit"
      >
        {(['all', 'todo', 'ongoing', 'completed'] as StatusFilter[]).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              filter === status
                ? "bg-tasks text-primary-foreground shadow-lg"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </motion.div>

      {/* Tasks List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="space-y-3"
      >
        <AnimatePresence>
          {filteredTasks.map((task, index) => {
            const StatusIcon = getStatusIcon(task.status);
            const overdue = isOverdue(task);

            return (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  "glass-card p-4 flex items-center gap-4 transition-all duration-200",
                  overdue && "border-destructive/30"
                )}
              >
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  getStatusColor(task.status, overdue)
                )}>
                  <StatusIcon className="w-5 h-5" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={cn(
                      "font-medium truncate",
                      task.status === 'completed' && "line-through text-muted-foreground"
                    )}>
                      {task.title}
                    </h3>
                    {overdue && (
                      <span className="px-2 py-0.5 bg-destructive/20 text-destructive text-xs rounded-full shrink-0">
                        Overdue
                      </span>
                    )}
                  </div>
                  {task.description && (
                    <p className="text-sm text-muted-foreground truncate">{task.description}</p>
                  )}
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>Due: {new Date(task.deadline).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {task.status !== 'completed' && (
                    <div className="flex gap-1">
                      {task.status === 'todo' && (
                        <button
                          onClick={() => handleStatusChange(task.id, 'ongoing')}
                          className="p-2 hover:bg-tasks/20 rounded-lg transition-colors"
                          title="Start task"
                        >
                          <Play className="w-4 h-4 text-tasks" />
                        </button>
                      )}
                      <button
                        onClick={() => handleStatusChange(task.id, 'completed')}
                        className="p-2 hover:bg-money/20 rounded-lg transition-colors"
                        title="Mark complete"
                      >
                        <Check className="w-4 h-4 text-money" />
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => openEditModal(task)}
                    className={cn(
                      "p-2 hover:bg-muted rounded-lg transition-colors",
                      task.status === 'completed' && "opacity-50"
                    )}
                  >
                    <Edit2 className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-2 hover:bg-destructive/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>

        {filteredTasks.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <ListTodo className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No tasks found. Create your first task!</p>
          </div>
        )}
      </motion.div>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={editingTask ? handleEditTask : handleAddTask}
        task={editingTask}
      />
    </div>
  );
}

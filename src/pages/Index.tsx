import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Wallet, CheckSquare, KeyRound, ArrowRight, Shield, Zap, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';

const features = [
  {
    icon: Wallet,
    title: 'Money Management',
    description: 'Track income and expenses with detailed analytics',
    gradient: 'bg-gradient-money',
    color: 'text-money',
  },
  {
    icon: CheckSquare,
    title: 'Task Tracking',
    description: 'Organize tasks with deadlines and status tracking',
    gradient: 'bg-gradient-tasks',
    color: 'text-tasks',
  },
  {
    icon: KeyRound,
    title: 'Password Vault',
    description: 'Securely store and manage all your credentials',
    gradient: 'bg-gradient-vault',
    color: 'text-vault',
  },
];

export default function Index() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-money/5 via-transparent to-vault/5" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-money/10 rounded-full blur-3xl opacity-30" />
      
      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-money/10 rounded-full text-money text-sm font-medium mb-6"
          >
            <Shield className="w-4 h-4" />
            Secure & Production-Ready
          </motion.div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Your All-in-One
            <span className="text-gradient-money"> Productivity</span> Suite
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Manage your finances, tasks, and passwords in one secure platform. Built with security-first architecture.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-gradient-money text-primary-foreground hover:opacity-90 h-14 px-8 text-lg">
                Get Started Free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg border-border hover:bg-muted">
                Sign In
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="glass-card p-8 text-center hover:scale-105 transition-transform duration-300"
            >
              <div className={`w-14 h-14 ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-5`}>
                <feature.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className={`text-xl font-semibold mb-3 ${feature.color}`}>{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-wrap justify-center gap-8 text-muted-foreground"
        >
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-money" />
            <span>AES-256 Encryption</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-tasks" />
            <span>JWT Authentication</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-vault" />
            <span>Real-time Sync</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

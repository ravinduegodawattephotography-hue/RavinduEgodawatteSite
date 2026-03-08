import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  FolderOpen, 
  Images, 
  MessageSquareQuote, 
  Mail, 
  TrendingUp,
  Eye
} from 'lucide-react';
import { useData } from '@/context/DataContext';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  trend?: string;
  trendUp?: boolean;
  color: string;
}

function StatCard({ title, value, icon: Icon, trend, trendUp, color }: StatCardProps) {
  return (
    <motion.div
      className="bg-neutral-950 border border-neutral-800 rounded-xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-neutral-500 text-sm">{title}</p>
          <h3 className="text-3xl font-display text-white mt-2">{value}</h3>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${trendUp ? 'text-green-500' : 'text-red-500'}`}>
              <TrendingUp className="w-4 h-4" />
              <span>{trend}</span>
            </div>
          )}
        </div>
        <div className={`w-12 h-12 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { categories, galleryImages, testimonials, messages } = useData();
  const [stats, setStats] = useState({
    categories: 0,
    images: 0,
    testimonials: 0,
    messages: 0,
    unreadMessages: 0,
  });

  useEffect(() => {
    const totalImages = categories.reduce((sum, cat) => sum + (cat.imageCount || 0), 0);
    const unreadMessages = messages.filter(m => !m.isRead).length;

    setStats({
      categories: categories.length,
      images: totalImages,
      testimonials: testimonials.length,
      messages: messages.length,
      unreadMessages,
    });
  }, [categories, galleryImages, testimonials, messages]);

  const recentMessages = messages.slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display text-white">Dashboard</h1>
        <p className="text-neutral-500 mt-1">Welcome back! Here&apos;s what&apos;s happening.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Categories"
          value={stats.categories}
          icon={FolderOpen}
          trend="+2 this month"
          trendUp={true}
          color="bg-blue-500/20"
        />
        <StatCard
          title="Total Images"
          value={stats.images}
          icon={Images}
          trend="+15 this week"
          trendUp={true}
          color="bg-purple-500/20"
        />
        <StatCard
          title="Testimonials"
          value={stats.testimonials}
          icon={MessageSquareQuote}
          trend="+3 this month"
          trendUp={true}
          color="bg-green-500/20"
        />
        <StatCard
          title="Messages"
          value={stats.messages}
          icon={Mail}
          trend={`${stats.unreadMessages} unread`}
          trendUp={stats.unreadMessages === 0}
          color="bg-amber-500/20"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          className="bg-neutral-950 border border-neutral-800 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-white">Recent Messages</h3>
            <button className="text-amber-500 text-sm hover:underline">View All</button>
          </div>

          {recentMessages.length > 0 ? (
            <div className="space-y-4">
              {recentMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-4 p-4 rounded-lg transition-colors ${
                    message.isRead ? 'bg-neutral-900/50' : 'bg-amber-500/5 border border-amber-500/20'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-medium">{message.name[0]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium truncate">{message.name}</span>
                      {!message.isRead && (
                        <span className="w-2 h-2 bg-amber-500 rounded-full" />
                      )}
                    </div>
                    <p className="text-neutral-500 text-sm truncate">{message.message}</p>
                    <p className="text-neutral-600 text-xs mt-1">
                      {new Date(message.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-neutral-500 text-center py-8">No messages yet</p>
          )}
        </motion.div>

        <motion.div
          className="bg-neutral-950 border border-neutral-800 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-medium text-white mb-6">Quick Actions</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <motion.button
              onClick={() => navigate('/admin/gallery')}
              className="p-4 bg-neutral-900 rounded-lg text-left hover:bg-neutral-800 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Images className="w-6 h-6 text-amber-500 mb-3" />
              <span className="text-white font-medium block">Upload Photos</span>
              <span className="text-neutral-500 text-sm">Add to gallery</span>
            </motion.button>

            <motion.button
              onClick={() => navigate('/admin/categories')}
              className="p-4 bg-neutral-900 rounded-lg text-left hover:bg-neutral-800 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FolderOpen className="w-6 h-6 text-blue-500 mb-3" />
              <span className="text-white font-medium block">New Category</span>
              <span className="text-neutral-500 text-sm">Create album</span>
            </motion.button>

            <motion.button
              onClick={() => navigate('/admin/testimonials')}
              className="p-4 bg-neutral-900 rounded-lg text-left hover:bg-neutral-800 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <MessageSquareQuote className="w-6 h-6 text-green-500 mb-3" />
              <span className="text-white font-medium block">Add Review</span>
              <span className="text-neutral-500 text-sm">New testimonial</span>
            </motion.button>

            <motion.button
              onClick={() => window.open('/', '_blank')}
              className="p-4 bg-neutral-900 rounded-lg text-left hover:bg-neutral-800 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Eye className="w-6 h-6 text-purple-500 mb-3" />
              <span className="text-white font-medium block">View Site</span>
              <span className="text-neutral-500 text-sm">Preview changes</span>
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

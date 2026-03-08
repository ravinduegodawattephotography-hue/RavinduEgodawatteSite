import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  MailOpen, 
  Trash2, 
  Search, 
  Reply,
  Calendar,
  User,
  CheckCircle,
  Send,
  Loader2,
  X,
} from 'lucide-react';
import type { ContactMessage } from '@/types';
import { useData } from '@/context/DataContext';

export default function InboxPage() {
  const { messages, markMessageAsRead, markMessageAsReplied, deleteMessage } = useData();
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [replyOpen, setReplyOpen] = useState(false);
  const [replyBody, setReplyBody] = useState('');
  const [isSendingReply, setIsSendingReply] = useState(false);
  const [replyError, setReplyError] = useState('');
  const [replySuccess, setReplySuccess] = useState(false);

  const handleSelectMessage = (message: ContactMessage) => {
    setSelectedMessage(message);
    if (!message.isRead) {
      markMessageAsRead(message.id);
    }
  };

  const handleDelete = (messageId: string) => {
    if (!confirm('Are you sure you want to delete this message?')) return;
    deleteMessage(messageId);
    if (selectedMessage?.id === messageId) {
      setSelectedMessage(null);
    }
  };

  const handleMarkAllAsRead = () => {
    messages.filter(m => !m.isRead).forEach(m => markMessageAsRead(m.id));
  };

  const openReplyModal = () => {
    setReplyBody('');
    setReplyError('');
    setReplySuccess(false);
    setReplyOpen(true);
  };

  const handleSendReply = async () => {
    if (!selectedMessage || !replyBody.trim()) return;
    setIsSendingReply(true);
    setReplyError('');
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'reply',
          to: selectedMessage.email,
          name: selectedMessage.name,
          replyBody: replyBody.trim(),
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? 'Email send failed');
      }
      await markMessageAsReplied(selectedMessage.id);
      setReplySuccess(true);
      setTimeout(() => {
        setReplyOpen(false);
        setReplySuccess(false);
      }, 2000);
    } catch (err: unknown) {
      setReplyError(err instanceof Error ? err.message : 'Failed to send reply');
    } finally {
      setIsSendingReply(false);
    }
  };

  const filteredMessages = messages.filter(message => {
    const matchesSearch = 
      message.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      message.message.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = 
      filter === 'all' ? true :
      filter === 'unread' ? !message.isRead :
      message.isRead;
    
    return matchesSearch && matchesFilter;
  });

  const unreadCount = messages.filter(m => !m.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display text-white">Inbox</h1>
          <p className="text-neutral-500 mt-1">
            {unreadCount > 0 ? `${unreadCount} unread messages` : 'No new messages'}
          </p>
        </div>
        
        {unreadCount > 0 && (
          <motion.button
            onClick={handleMarkAllAsRead}
            className="flex items-center gap-2 px-4 py-2 text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <CheckCircle className="w-4 h-4" />
            Mark all as read
          </motion.button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            className="w-full pl-12 pr-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:border-amber-500 focus:outline-none transition-colors"
          />
        </div>
        
        <div className="flex gap-2">
          {(['all', 'unread', 'read'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg capitalize transition-colors ${
                filter === f
                  ? 'bg-amber-500 text-black'
                  : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              {f}
              {f === 'unread' && unreadCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-black/20 rounded-full text-xs">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-neutral-800">
            <h3 className="text-white font-medium">
              Messages ({filteredMessages.length})
            </h3>
          </div>
          
          <div className="max-h-[600px] overflow-y-auto">
            {filteredMessages.length > 0 ? (
              <div className="divide-y divide-neutral-800">
                {filteredMessages.map((message) => (
                  <motion.button
                    key={message.id}
                    onClick={() => handleSelectMessage(message)}
                    className={`w-full p-4 text-left transition-colors ${
                      selectedMessage?.id === message.id
                        ? 'bg-amber-500/10'
                        : 'hover:bg-neutral-900'
                    } ${!message.isRead ? 'bg-amber-500/5' : ''}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.isRead ? 'bg-neutral-800' : 'bg-amber-500/20'
                      }`}>
                        {message.isRead ? (
                          <MailOpen className="w-4 h-4 text-neutral-500" />
                        ) : (
                          <Mail className="w-4 h-4 text-amber-500" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`truncate ${!message.isRead ? 'text-white font-medium' : 'text-neutral-300'}`}>
                            {message.name}
                          </span>
                          {!message.isRead && (
                            <span className="w-2 h-2 bg-amber-500 rounded-full flex-shrink-0" />
                          )}
                          {message.isReplied && (
                            <span className="px-1.5 py-0.5 text-[10px] bg-green-500/20 text-green-400 rounded flex-shrink-0">
                              Replied
                            </span>
                          )}
                        </div>
                        <p className="text-neutral-500 text-sm truncate">
                          {message.message}
                        </p>
                        <p className="text-neutral-600 text-xs mt-1">
                          {new Date(message.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Mail className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                <p className="text-neutral-500">No messages found</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {selectedMessage ? (
              <motion.div
                key={selectedMessage.id}
                className="bg-neutral-950 border border-neutral-800 rounded-xl overflow-hidden h-full"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                <div className="p-6 border-b border-neutral-800">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center">
                        <User className="w-6 h-6 text-amber-500" />
                      </div>
                      <div>
                        <h3 className="text-white font-medium text-lg">{selectedMessage.name}</h3>
                        <a 
                          href={`mailto:${selectedMessage.email}`}
                          className="text-amber-500 text-sm hover:underline"
                        >
                          {selectedMessage.email}
                        </a>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDelete(selectedMessage.id)}
                        className="w-9 h-9 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4 text-neutral-500 text-sm">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Received on {new Date(selectedMessage.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="prose prose-invert max-w-none">
                    <p className="text-neutral-300 whitespace-pre-wrap leading-relaxed">
                      {selectedMessage.message}
                    </p>
                  </div>
                </div>

                <div className="p-6 border-t border-neutral-800 flex items-center gap-3">
                  <motion.button
                    onClick={openReplyModal}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-black font-medium rounded-lg hover:bg-amber-400 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Reply className="w-4 h-4" />
                    Reply
                  </motion.button>
                  {selectedMessage.isReplied && (
                    <span className="flex items-center gap-1.5 text-sm text-green-400">
                      <CheckCircle className="w-4 h-4" />
                      Replied
                    </span>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                className="bg-neutral-950 border border-neutral-800 rounded-xl h-full flex items-center justify-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-center p-12">
                  <Mail className="w-16 h-16 text-neutral-700 mx-auto mb-4" />
                  <h3 className="text-xl text-white font-medium">Select a message</h3>
                  <p className="text-neutral-500 mt-2">
                    Click on a message from the list to view its contents
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Reply Modal ─────────────────────────────────── */}
      <AnimatePresence>
        {replyOpen && selectedMessage && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => !isSendingReply && setReplyOpen(false)}
            />

            {/* Modal */}
            <motion.div
              className="relative z-10 w-full max-w-lg bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-neutral-800">
                <div>
                  <h3 className="text-white font-medium text-lg">Reply to {selectedMessage.name}</h3>
                  <p className="text-amber-500 text-sm mt-0.5">{selectedMessage.email}</p>
                </div>
                <button
                  onClick={() => setReplyOpen(false)}
                  disabled={isSendingReply}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors disabled:opacity-50"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-neutral-400 mb-2">Your Reply</label>
                  <textarea
                    value={replyBody}
                    onChange={(e) => setReplyBody(e.target.value)}
                    rows={6}
                    placeholder="Type your reply here..."
                    className="w-full px-4 py-3 bg-neutral-950 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:border-amber-500 focus:outline-none transition-colors resize-none"
                    disabled={isSendingReply}
                  />
                </div>

                {replyError && (
                  <motion.p
                    className="text-red-400 text-sm"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {replyError}
                  </motion.p>
                )}

                {replySuccess && (
                  <motion.div
                    className="flex items-center gap-2 text-green-400 text-sm"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Reply sent successfully!
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <div className="flex gap-3 px-6 pb-6">
                <button
                  onClick={() => setReplyOpen(false)}
                  disabled={isSendingReply}
                  className="flex-1 px-4 py-3 border border-neutral-700 text-neutral-300 rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={handleSendReply}
                  disabled={isSendingReply || !replyBody.trim()}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-amber-500 text-black font-medium rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: isSendingReply ? 1 : 1.02 }}
                  whileTap={{ scale: isSendingReply ? 1 : 0.98 }}
                >
                  {isSendingReply ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Send Reply
                    </>
                  )}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

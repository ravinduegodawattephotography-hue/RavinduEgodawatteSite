import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  Lock, 
  Bell, 
  Palette,
  Save,
  CheckCircle
} from 'lucide-react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display text-white">Settings</h1>
        <p className="text-neutral-500 mt-1">Manage your account and preferences</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                activeTab === tab.id
                  ? 'bg-amber-500 text-black'
                  : 'bg-neutral-950 border border-neutral-800 text-neutral-400 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-neutral-950 border border-neutral-800 rounded-xl p-6"
      >
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <h2 className="text-xl font-medium text-white">Profile Settings</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Full Name</label>
                <input
                  type="text"
                  defaultValue="Admin User"
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Email</label>
                <input
                  type="email"
                  defaultValue="admin@example.com"
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Phone</label>
                <input
                  type="tel"
                  defaultValue="+94 77 123 4567"
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Company</label>
                <input
                  type="text"
                  defaultValue="Ravindu Egodawatte Photography"
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white focus:border-amber-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            <h2 className="text-xl font-medium text-white">Security Settings</h2>
            
            <div className="space-y-4 max-w-md">
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Current Password</label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:border-amber-500 focus:outline-none transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm text-neutral-400 mb-2">New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:border-amber-500 focus:outline-none transition-colors"
                />
              </div>
              
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  className="w-full px-4 py-3 bg-neutral-900 border border-neutral-800 rounded-lg text-white placeholder-neutral-600 focus:border-amber-500 focus:outline-none transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <h2 className="text-xl font-medium text-white">Notification Preferences</h2>
            
            <div className="space-y-4">
              {[
                { id: 'email_new_message', label: 'Email me when I receive a new message', default: true },
                { id: 'email_new_booking', label: 'Email me when someone books a session', default: true },
                { id: 'browser_notifications', label: 'Enable browser notifications', default: false },
                { id: 'weekly_digest', label: 'Send weekly activity digest', default: true },
              ].map((setting) => (
                <div key={setting.id} className="flex items-center justify-between py-3 border-b border-neutral-800 last:border-0">
                  <span className="text-neutral-300">{setting.label}</span>
                  <button
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      setting.default ? 'bg-amber-500' : 'bg-neutral-700'
                    }`}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                        setting.default ? 'left-7' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <h2 className="text-xl font-medium text-white">Appearance Settings</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Theme</label>
                <div className="flex gap-3">
                  <button className="px-4 py-2 bg-amber-500 text-black rounded-lg font-medium">
                    Dark
                  </button>
                  <button className="px-4 py-2 bg-neutral-900 border border-neutral-800 text-neutral-400 rounded-lg">
                    Light
                  </button>
                  <button className="px-4 py-2 bg-neutral-900 border border-neutral-800 text-neutral-400 rounded-lg">
                    System
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-neutral-400 mb-2">Accent Color</label>
                <div className="flex gap-3">
                  {['#d4af37', '#3b82f6', '#10b981', '#f43f5e', '#8b5cf6'].map((color) => (
                    <button
                      key={color}
                      className={`w-10 h-10 rounded-full border-2 transition-colors ${
                        color === '#d4af37' ? 'border-white' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="mt-8 pt-6 border-t border-neutral-800 flex items-center justify-between">
          {showSuccess && (
            <motion.div
              className="flex items-center gap-2 text-green-500"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <CheckCircle className="w-5 h-5" />
              <span>Settings saved successfully</span>
            </motion.div>
          )}
          
          <div className="ml-auto">
            <motion.button
              onClick={handleSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-3 bg-amber-500 text-black font-medium rounded-lg hover:bg-amber-400 transition-colors disabled:opacity-50"
              whileHover={{ scale: isSaving ? 1 : 1.02 }}
              whileTap={{ scale: isSaving ? 1 : 0.98 }}
            >
              <Save className="w-4 h-4" />
              {isSaving ? 'Saving...' : 'Save Changes'}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

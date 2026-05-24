import { useState } from 'react';
import { Moon, Sun, Bell, Globe, Lock, User, ChevronRight, Shield, Accessibility, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTheme } from '../../context/ThemeContext';
import { Toggle, Avatar } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { cn } from '../../lib/utils';
import { AVATAR_COLORS } from '../../lib/constants';

function SettingRow({ icon: Icon, title, sub, right, onClick, danger = false }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-4 px-4 py-4 rounded-2xl',
        'hover:bg-surface-50 dark:hover:bg-surface-800/50',
        'transition-colors duration-200 text-left',
        danger && 'text-red-500'
      )}
    >
      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
        danger ? 'bg-red-500/10' : 'bg-surface-100 dark:bg-surface-800'
      )}>
        <Icon className={cn('w-4 h-4', danger ? 'text-red-500' : 'text-surface-500')} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-semibold', danger ? 'text-red-500' : 'text-surface-900 dark:text-surface-100')}>{title}</p>
        {sub && <p className="text-xs text-surface-400 mt-0.5">{sub}</p>}
      </div>
      {right || <ChevronRight className="w-4 h-4 text-surface-400 flex-shrink-0" />}
    </button>
  );
}

export default function SettingsPage() {
  const { state, dispatch, toast } = useApp();
  const { user } = state;
  const { isDark, toggleTheme, theme, setTheme } = useTheme();
  const [notifs, setNotifs] = useState(true);
  const [orderNotifs, setOrderNotifs] = useState(true);
  const [promoNotifs, setPromoNotifs] = useState(true);
  const [fontSize, setFontSize] = useState('md');

  // Edit Profile States
  const [profileOpen, setProfileOpen] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || user?.username || '');
  const [avatarColor, setAvatarColor] = useState(user?.avatarColor || '');
  const [profilePic, setProfilePic] = useState(user?.profilePic || '');

  // Change Password States
  const [passOpen, setPassOpen] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');

  const applyFontSize = (size) => {
    setFontSize(size);
    const root = document.documentElement;
    root.style.fontSize = { sm: '14px', md: '16px', lg: '18px' }[size] || '16px';
    toast('success', 'Font Size Updated', `Set to ${size}`);
  };

  const openProfileEdit = () => {
    setDisplayName(user?.displayName || user?.username || '');
    setAvatarColor(user?.avatarColor || '');
    setProfilePic(user?.profilePic || '');
    setProfileOpen(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast('error', 'File Too Large', 'Maximum image size is 2MB');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      setProfilePic(event.target.result);
      toast('success', 'Photo Loaded', 'Custom profile picture loaded from gallery');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = () => {
    if (!displayName.trim()) {
      toast('error', 'Required', 'Display name cannot be empty');
      return;
    }
    const updatedUser = {
      ...user,
      displayName: displayName.trim(),
      avatarColor: avatarColor,
      profilePic: profilePic
    };
    dispatch({ type: 'SET_USER', payload: updatedUser });
    toast('success', 'Profile Updated', 'Your profile details have been saved successfully');
    setProfileOpen(false);
  };

  const handlePasswordChange = () => {
    if (!currentPass || !newPass || !confirmPass) {
      toast('error', 'Error', 'Please fill all password fields');
      return;
    }
    const realCurrentPass = user?.password || (user?.username === 'admin' ? 'admin123' : 'student123');
    if (currentPass !== realCurrentPass) {
      toast('error', 'Error', 'Incorrect current password');
      return;
    }
    if (newPass.length < 6) {
      toast('error', 'Error', 'New password must be at least 6 characters');
      return;
    }
    if (newPass !== confirmPass) {
      toast('error', 'Error', 'Passwords do not match');
      return;
    }
    const updatedUser = {
      ...user,
      password: newPass
    };
    dispatch({ type: 'SET_USER', payload: updatedUser });
    toast('success', 'Password Updated', 'Your password has been changed successfully');
    setPassOpen(false);
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
  };

  return (
    <div className="max-w-lg mx-auto pb-24 px-4 pt-4">
      <h1 className="text-h2 mb-5">Settings</h1>

      {/* Appearance */}
      <div className="mb-4">
        <p className="text-xs font-bold text-surface-400 uppercase tracking-wider px-2 mb-2">Appearance</p>
        <div className="bg-white dark:bg-surface-900 border border-surface-100 dark:border-surface-800 rounded-2xl overflow-hidden divide-y divide-surface-100 dark:divide-surface-800">
          <SettingRow
            icon={isDark ? Moon : Sun}
            title="Theme"
            sub={isDark ? 'Dark mode is on' : 'Light mode is on'}
            right={<Toggle checked={isDark} onChange={toggleTheme} />}
          />
          <div className="px-4 py-3">
            <p className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-3">Color Theme</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'dark',  label: 'Dark',   bg: 'bg-surface-950',  ring: 'ring-surface-500' },
                { id: 'light', label: 'Light',  bg: 'bg-surface-50',   ring: 'ring-surface-300' },
                { id: 'auto',  label: 'System', bg: 'bg-gradient-to-r from-surface-50 to-surface-950', ring: 'ring-blue-500' },
              ].map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    if (t.id === 'auto') {
                      const sys = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                      setTheme(sys);
                    } else {
                      setTheme(t.id);
                    }
                    toast('success', 'Theme changed', `Switched to ${t.label}`);
                  }}
                  className={cn('p-3 rounded-xl border text-xs font-medium transition-all',
                    theme === t.id || (t.id === 'auto' && false)
                      ? `ring-2 ${t.ring} border-transparent`
                      : 'border-surface-200 dark:border-surface-700'
                  )}
                >
                  <div className={cn('w-full h-8 rounded-lg mb-2', t.bg)} />
                  <span className="text-surface-700 dark:text-surface-300">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="px-4 py-3">
            <p className="text-sm font-semibold text-surface-900 dark:text-surface-100 mb-3 flex items-center gap-2">
              <Accessibility className="w-4 h-4" /> Text Size
            </p>
            <div className="flex gap-2">
              {[['sm', 'Small', 'text-xs'], ['md', 'Default', 'text-sm'], ['lg', 'Large', 'text-base']].map(([id, label, cls]) => (
                <button
                  key={id}
                  onClick={() => applyFontSize(id)}
                  className={cn('flex-1 py-2 rounded-xl border text-center transition-all',
                    fontSize === id
                      ? 'bg-brand-500 border-brand-500 text-white'
                      : 'bg-white dark:bg-surface-800 border-surface-200 dark:border-surface-700 text-surface-700 dark:text-surface-300'
                  )}
                >
                  <span className={cls}>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div className="mb-4">
        <p className="text-xs font-bold text-surface-400 uppercase tracking-wider px-2 mb-2">Notifications</p>
        <div className="bg-white dark:bg-surface-900 border border-surface-100 dark:border-surface-800 rounded-2xl overflow-hidden divide-y divide-surface-100 dark:divide-surface-800">
          <SettingRow
            icon={Bell}
            title="All Notifications"
            sub="Enable or disable all alerts"
            right={<Toggle checked={notifs} onChange={v => { setNotifs(v); toast('info', v ? 'Notifications On' : 'Notifications Off', ''); }} />}
          />
          {notifs && (
            <>
              <SettingRow
                icon={Bell}
                title="Order Updates"
                sub="Status changes, ready alerts"
                right={<Toggle checked={orderNotifs} onChange={setOrderNotifs} />}
              />
              <SettingRow
                icon={Bell}
                title="Promotions & Offers"
                sub="Deals, coupons, new items"
                right={<Toggle checked={promoNotifs} onChange={setPromoNotifs} />}
              />
            </>
          )}
        </div>
      </div>

      {/* Account */}
      <div className="mb-4">
        <p className="text-xs font-bold text-surface-400 uppercase tracking-wider px-2 mb-2">Account</p>
        <div className="bg-white dark:bg-surface-900 border border-surface-100 dark:border-surface-800 rounded-2xl overflow-hidden divide-y divide-surface-100 dark:divide-surface-800">
          <SettingRow
            icon={User}
            title="Edit Profile"
            sub="Change display name and avatar"
            onClick={openProfileEdit}
          />
          <SettingRow
            icon={Lock}
            title="Change Password"
            sub="Update your password"
            onClick={() => setPassOpen(true)}
          />
          <SettingRow
            icon={Globe}
            title="Language"
            sub="English (India)"
            onClick={() => toast('info', 'Coming Soon', 'Language settings coming soon')}
          />
        </div>
      </div>

      {/* Privacy */}
      <div className="mb-4">
        <p className="text-xs font-bold text-surface-400 uppercase tracking-wider px-2 mb-2">Privacy & Security</p>
        <div className="bg-white dark:bg-surface-900 border border-surface-100 dark:border-surface-800 rounded-2xl overflow-hidden divide-y divide-surface-100 dark:divide-surface-800">
          <SettingRow
            icon={Shield}
            title="Privacy Policy"
            sub="Read our data practices"
            onClick={() => toast('info', 'Privacy Policy', 'Your data stays on campus servers')}
          />
        </div>
      </div>

      {/* Danger zone */}
      <div className="mb-4">
        <p className="text-xs font-bold text-surface-400 uppercase tracking-wider px-2 mb-2">Data</p>
        <div className="bg-white dark:bg-surface-900 border border-surface-100 dark:border-surface-800 rounded-2xl overflow-hidden">
          <SettingRow
            icon={User}
            title="Clear Order History"
            sub="Remove all past orders from this device"
            danger
            onClick={() => {
              if (window.confirm('Clear all order history? This cannot be undone.')) {
                dispatch({ type: 'SET_ORDER_HISTORY', payload: [] });
                toast('success', 'Cleared', 'Order history removed from this device');
              }
            }}
          />
        </div>
      </div>

      <p className="text-center text-xs text-surface-400 mt-8">SmartCanteen v3.0 · JJ College of Engineering</p>

      {/* Edit Profile Modal */}
      <Modal open={profileOpen} onClose={() => setProfileOpen(false)} title="Edit Profile" size="sm">
        <div className="p-5 space-y-4">
          <div className="flex flex-col items-center gap-3 mb-2">
            <div className="relative group cursor-pointer">
              <Avatar 
                name={displayName || user?.username || 'U'} 
                colorOverride={avatarColor} 
                imageSrc={profilePic}
                size="xl" 
              />
              <label className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                <span className="text-[10px] text-white font-bold uppercase tracking-wider">Change</span>
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageUpload} 
                />
              </label>
            </div>
            <div className="flex gap-2">
              <label className="text-xs font-semibold text-brand-500 hover:text-brand-600 cursor-pointer">
                Upload Photo
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageUpload} 
                />
              </label>
              {profilePic && (
                <>
                  <span className="text-surface-300 text-xs">·</span>
                  <button 
                    type="button" 
                    onClick={() => setProfilePic('')} 
                    className="text-xs font-semibold text-red-500 hover:text-red-600"
                  >
                    Remove
                  </button>
                </>
              )}
            </div>
          </div>

          <Input
            label="Display Name"
            value={displayName}
            onChange={e => setDisplayName(e.target.value)}
            placeholder="Enter display name"
            maxLength={20}
          />

          <div>
            <label className="block text-xs font-bold text-surface-500 uppercase tracking-wider mb-2 font-display">Avatar Color</label>
            <div className="grid grid-cols-4 gap-2">
              {AVATAR_COLORS.map(color => {
                const isSelected = avatarColor === color;
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setAvatarColor(color)}
                    className={cn(
                      'h-10 rounded-xl bg-gradient-to-br transition-all flex items-center justify-center',
                      color,
                      isSelected ? 'ring-2 ring-brand-500 ring-offset-2 dark:ring-offset-surface-900 scale-95 shadow-sm' : 'hover:scale-105'
                    )}
                  >
                    {isSelected && <Check className="w-4 h-4 text-white" />}
                  </button>
                );
              })}
            </div>
          </div>

          <Button variant="primary" className="w-full mt-2" onClick={handleSaveProfile}>
            Save Changes
          </Button>
        </div>
      </Modal>

      {/* Change Password Modal */}
      <Modal open={passOpen} onClose={() => setPassOpen(false)} title="Change Password" size="sm">
        <div className="p-5 space-y-4">
          <Input
            label="Current Password"
            type="password"
            value={currentPass}
            onChange={e => setCurrentPass(e.target.value)}
            placeholder="Enter current password"
          />
          <Input
            label="New Password"
            type="password"
            value={newPass}
            onChange={e => setNewPass(e.target.value)}
            placeholder="Enter new password (min 6 chars)"
          />
          <Input
            label="Confirm New Password"
            type="password"
            value={confirmPass}
            onChange={e => setConfirmPass(e.target.value)}
            placeholder="Confirm new password"
          />

          <Button variant="primary" className="w-full mt-2" onClick={handlePasswordChange}>
            Update Password
          </Button>
        </div>
      </Modal>
    </div>
  );
}

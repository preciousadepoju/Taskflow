import React, { useState, useRef } from 'react';
import {
  User,
  Shield,
  Settings as SettingsIcon,
  CreditCard,
  Camera,
  Mail,
  Moon,
  BarChart3,
  Trash2,
  LogOut
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { useNavigate } from 'react-router-dom';

const SECTIONS = [
  { id: 'profile', label: 'Profile Information', icon: <User size={17} /> },
  { id: 'security', label: 'Security', icon: <Shield size={17} /> },
  { id: 'preferences', label: 'Preferences', icon: <SettingsIcon size={17} /> },
  { id: 'billing', label: 'Billing & Plan', icon: <CreditCard size={17} /> },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('profile');
  const navigate = useNavigate();

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(`settings-${id}`);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="flex h-full -m-8 overflow-hidden">
      {/* Settings Sidebar */}
      <aside className="w-56 border-r border-slate-200 bg-white flex flex-col shrink-0">
        <div className="p-5 flex-1">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 px-1">Settings</p>
          <nav className="space-y-0.5">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollToSection(s.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg transition-colors font-medium text-sm text-left",
                  activeSection === s.id
                    ? "bg-indigo-600 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                )}
              >
                {s.icon}
                {s.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Logout */}
        <div className="p-4 border-t border-slate-200">
          <button
            onClick={() => navigate('/login')}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors font-medium text-sm"
          >
            <LogOut size={17} />
            Logout
          </button>
        </div>
      </aside>

      {/* Settings Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-10 py-10 space-y-16">

          {/* Profile Information */}
          <section id="settings-profile" className="space-y-6">
            <div className="border-b border-slate-200 pb-5">
              <h2 className="text-2xl font-bold text-slate-900">Profile Information</h2>
              <p className="text-slate-500 mt-1">Update your photo and personal details here.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8 items-start">
              <div className="relative group shrink-0">
                <div className="w-28 h-28 rounded-full overflow-hidden bg-slate-200 border-4 border-white shadow-sm">
                  <img
                    src="https://picsum.photos/seed/alex/200/200"
                    alt="Avatar"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <button className="absolute bottom-0 right-0 p-2 bg-indigo-600 text-white rounded-full shadow-lg hover:scale-105 transition-transform flex items-center justify-center">
                  <Camera size={14} />
                </button>
              </div>

              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-5 w-full">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">First Name</label>
                  <input
                    type="text"
                    defaultValue="Alex"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">Last Name</label>
                  <input
                    type="text"
                    defaultValue="Johnson"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-semibold mb-2 text-slate-700">Email Address</label>
                  <input
                    type="email"
                    defaultValue="alex.johnson@taskflow.com"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors shadow-sm">
                Save Changes
              </button>
            </div>
          </section>

          {/* Security */}
          <section id="settings-security" className="space-y-6">
            <div className="border-b border-slate-200 pb-5">
              <h2 className="text-2xl font-bold text-slate-900">Security</h2>
              <p className="text-slate-500 mt-1">Manage your password and account security settings.</p>
            </div>

            <div className="grid grid-cols-1 gap-5 max-w-2xl">
              <div>
                <label className="block text-sm font-semibold mb-2 text-slate-700">Current Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-slate-700">Confirm New Password</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors shadow-sm">
                Update Password
              </button>
            </div>
          </section>

          {/* Preferences */}
          <section id="settings-preferences" className="space-y-6">
            <div className="border-b border-slate-200 pb-5">
              <h2 className="text-2xl font-bold text-slate-900">Preferences</h2>
              <p className="text-slate-500 mt-1">Customize your TaskFlow experience and notifications.</p>
            </div>

            <div className="space-y-3">
              <PreferenceToggle
                icon={<Mail className="text-indigo-600" size={18} />}
                title="Email Notifications"
                description="Receive weekly productivity reports and activity digests"
                defaultChecked
              />
              <PreferenceToggle
                icon={<Moon className="text-indigo-600" size={18} />}
                title="Dark Mode"
                description="Switch between light and dark interface themes"
              />
              <PreferenceToggle
                icon={<BarChart3 className="text-indigo-600" size={18} />}
                title="Usage Analytics"
                description="Help us improve by sharing anonymous usage data"
                defaultChecked
              />
            </div>

            <div className="flex justify-end">
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors shadow-sm">
                Save Preferences
              </button>
            </div>
          </section>

          {/* Billing & Plan */}
          <section id="settings-billing" className="space-y-6">
            <div className="border-b border-slate-200 pb-5">
              <h2 className="text-2xl font-bold text-slate-900">Billing & Plan</h2>
              <p className="text-slate-500 mt-1">Manage your subscription and payment details.</p>
            </div>

            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-6 flex items-center justify-between">
              <div>
                <span className="inline-block bg-indigo-600 text-white text-xs font-bold px-2.5 py-1 rounded-full mb-2">Pro Plan</span>
                <p className="font-bold text-slate-900">$12 / month</p>
                <p className="text-sm text-slate-500 mt-1">Next billing date: Feb 28, 2026</p>
              </div>
              <button className="px-5 py-2.5 border border-slate-200 bg-white text-slate-700 font-semibold text-sm rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                Manage Plan
              </button>
            </div>

            <div className="flex justify-end">
              <button className="px-5 py-2.5 border border-red-200 text-red-600 font-semibold text-sm rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2">
                <Trash2 size={16} />
                Delete Account
              </button>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

function PreferenceToggle({ icon, title, description, defaultChecked }: {
  icon: React.ReactNode;
  title: string;
  description: string;
  defaultChecked?: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked ?? false);
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white transition-colors">
      <div className="flex gap-4 items-center">
        <div className="p-2 bg-indigo-50 rounded-lg shrink-0">
          {icon}
        </div>
        <div>
          <p className="font-semibold text-slate-900 text-sm">{title}</p>
          <p className="text-xs text-slate-500 mt-0.5">{description}</p>
        </div>
      </div>
      <button
        role="switch"
        aria-checked={checked}
        onClick={() => setChecked(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shrink-0 ${checked ? 'bg-indigo-600' : 'bg-slate-200'
          }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-6' : 'translate-x-1'
            }`}
        />
      </button>
    </div>
  );
}

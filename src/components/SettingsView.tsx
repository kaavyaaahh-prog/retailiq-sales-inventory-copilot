import React, { useState } from 'react';
import { Settings, Store, Bell, Shield, Sliders, Database, Save, CheckCircle2, RefreshCcw } from 'lucide-react';
import { STORE_INFO } from '../data/mockData';
import { UserProfile, StoreLocationProfile } from '../types';

interface SettingsViewProps {
  userProfile?: UserProfile;
  storeProfile?: StoreLocationProfile;
  onShowToast: (title: string, desc?: string, type?: 'success' | 'info') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ userProfile, storeProfile, onShowToast }) => {
  const [threshold, setThreshold] = useState('aggressive');
  const [autoApprove, setAutoApprove] = useState(false);
  const [syncInterval, setSyncInterval] = useState('realtime');
  const [emailAlerts, setEmailAlerts] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onShowToast('Settings Saved', 'Copilot threshold and sync preferences updated.', 'success');
  };

  return (
    <div id="settings-screen" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Settings className="w-5 h-5" />
          </span>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            Store & Copilot Settings
          </h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Configure AI decision rules, threshold multipliers, and notification preferences.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 text-xs">
        {/* Store Profile Card */}
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800 pb-3">
            <Store className="w-4 h-4 text-cyan-400" />
            <span>Store Location & Shift Profile</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold uppercase text-slate-400 tracking-wider mb-1">
                Store Branch Name
              </label>
              <input
                id="settings-store-branch-name"
                type="text"
                disabled
                value={storeProfile ? storeProfile.fullBranchDisplayName : STORE_INFO.name + ' – ' + STORE_INFO.branch}
                className="w-full p-2.5 bg-slate-800/40 border border-slate-700/60 rounded-xl text-slate-300 font-semibold cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block font-bold uppercase text-slate-400 tracking-wider mb-1">
                Store ID & POS Terminal
              </label>
              <input
                id="settings-store-id-terminal"
                type="text"
                disabled
                value={storeProfile ? storeProfile.posTerminal : STORE_INFO.storeId + ' (Terminal A-102)'}
                className="w-full p-2.5 bg-slate-800/40 border border-slate-700/60 rounded-xl text-slate-300 font-mono cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block font-bold uppercase text-slate-400 tracking-wider mb-1">
                Store Manager In-Charge
              </label>
              <input
                type="text"
                disabled
                value={userProfile ? `${userProfile.name} (${userProfile.role})` : STORE_INFO.manager.name + ' (' + STORE_INFO.manager.role + ')'}
                className="w-full p-2.5 bg-slate-800/40 border border-slate-700/60 rounded-xl text-slate-300 font-semibold cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block font-bold uppercase text-slate-400 tracking-wider mb-1">
                Manager Session Identity
              </label>
              <input
                type="text"
                disabled
                value={userProfile?.email ? `${userProfile.email} • Initial: [${userProfile.initials}]` : STORE_INFO.manager.shift}
                className="w-full p-2.5 bg-slate-800/40 border border-slate-700/60 rounded-xl text-cyan-300 font-mono text-xs cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* AI Copilot Sensitivity Settings */}
        <div className="p-6 rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800 pb-3">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <span>AI Copilot Decision Sensitivity</span>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block font-bold text-slate-300 mb-1">
                Inventory Hazard Sensitivity
              </label>
              <p className="text-[11px] text-slate-400 mb-2">
                Controls when AI triggers "Restock Now" vs "Restock Soon".
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'conservative', label: 'Conservative', desc: 'Trigger when stock <= 50% reorder' },
                  { id: 'aggressive', label: 'Standard / High Demand', desc: 'Trigger when stock <= 100% reorder' },
                  { id: 'just_in_time', label: 'Just-In-Time', desc: 'Trigger when run-rate < 2 days left' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setThreshold(opt.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      threshold === opt.id
                        ? 'bg-cyan-950/40 border-cyan-500/80 text-white shadow-sm'
                        : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="font-bold block text-xs">{opt.label}</span>
                    <span className="text-[10px] text-slate-400 mt-1 block">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-200 block">Simulated Real-Time POS Sync</span>
                <span className="text-[11px] text-slate-400">
                  Stream sales velocity transactions every 10 seconds.
                </span>
              </div>
              <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                Connected
              </span>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>
    </div>
  );
};

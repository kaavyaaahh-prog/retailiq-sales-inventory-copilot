import React from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  Package,
  Boxes,
  ClipboardList,
  Bot,
  Settings,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Lightbulb
} from 'lucide-react';
import { STORE_INFO } from '../data/mockData';
import { ActiveSection, StoreLocationProfile } from '../types';

interface SidebarProps {
  activeSection: ActiveSection;
  onSelectSection: (section: ActiveSection) => void;
  lowStockCount: number;
  urgentRecsCount: number;
  pendingRestockCount?: number;
  storeProfile?: StoreLocationProfile;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSelectSection,
  lowStockCount,
  urgentRecsCount,
  pendingRestockCount = 1,
  storeProfile,
}) => {
  const navItems: {
    id: ActiveSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string | number | null;
    badgeColor?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'sales',
      label: 'Sales',
      icon: TrendingUp,
      badge: '+14.2%',
      badgeColor: 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60',
    },
    {
      id: 'inventory',
      label: 'Inventory',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} Low` : null,
      badgeColor: 'bg-amber-950/80 text-amber-300 border-amber-800/60',
    },
    {
      id: 'products',
      label: 'Products',
      icon: Boxes,
    },
    {
      id: 'restock_requests',
      label: 'Restock Requests',
      icon: ClipboardList,
      badge: pendingRestockCount > 0 ? `${pendingRestockCount} Pending` : null,
      badgeColor: 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60',
    },
    {
      id: 'copilot',
      label: 'AI Copilot',
      icon: Bot,
      badge: 'Online',
      badgeColor: 'bg-indigo-950/80 text-cyan-300 border-cyan-800/60',
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <aside
      id="sidebar-navigation"
      className="w-64 lg:w-72 bg-slate-950/90 backdrop-blur-2xl text-slate-200 flex flex-col shrink-0 border-r border-slate-800/80 select-none transition-all"
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 p-0.5 flex items-center justify-center shadow-lg shadow-cyan-500/20">
          <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-cyan-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-extrabold tracking-tight text-white">
              Retail<span className="text-cyan-400">IQ</span>
            </h1>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 tracking-wider">
              AI COPILOT
            </span>
          </div>
          <p className="text-[11px] text-slate-400 font-medium">Sales & Inventory Intelligence</p>
        </div>
      </div>

      {/* Main Navigation List */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Main Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            activeSection === item.id ||
            (item.id === 'dashboard' && activeSection === 'overview');
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => onSelectSection(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 group cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-white border border-cyan-500/40 shadow-md shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/80 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-cyan-400'
                  }`}
                />
                <span className="tracking-wide">{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${
                    isActive ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* AI Decision Copilot Card */}
      <div className="p-3.5 m-3 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800/80 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-xl pointer-events-none"></div>
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Bot className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-white tracking-tight">Copilot Live Engine</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
          Auto-evaluates inventory risk, velocity spikes, and supplier restock buffers.
        </p>
        <button
          id="btn-sidebar-ask-copilot"
          onClick={() => onSelectSection('copilot')}
          className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-cyan-500/20 cursor-pointer"
        >
          <span>Open AI Copilot</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Store Sync Footer */}
      <div className="p-3.5 border-t border-slate-800/80 bg-slate-950/60 flex items-center justify-between">
        <div className="min-w-0">
          <p id="sidebar-store-branch" className="text-xs font-bold text-white truncate">
            {storeProfile?.branchName || STORE_INFO.branch}
          </p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs shadow-emerald-500 animate-pulse"></span>
            <span className="text-[10px] text-emerald-400 font-semibold">POS Engine Synced</span>
          </div>
        </div>
        <span id="sidebar-store-id" className="text-[10px] text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded-lg border border-slate-800">
          {storeProfile?.storeId || STORE_INFO.storeId}
        </span>
      </div>
    </aside>
  );
};

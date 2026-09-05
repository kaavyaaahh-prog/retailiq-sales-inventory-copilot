import React from 'react';
import {
  LayoutDashboard,
  Package,
  BarChart3,
  Lightbulb,
  Sparkles,
  Bot,
  Store,
  ChevronRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { STORE_INFO } from '../data/mockData';

export type ActiveSection = 'overview' | 'inventory' | 'sales' | 'recommendations' | 'copilot';

interface SidebarProps {
  activeSection: ActiveSection;
  onSelectSection: (section: ActiveSection) => void;
  lowStockCount: number;
  urgentRecsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeSection,
  onSelectSection,
  lowStockCount,
  urgentRecsCount,
}) => {
  const navItems = [
    {
      id: 'overview' as ActiveSection,
      label: 'Overview',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'inventory' as ActiveSection,
      label: 'Inventory',
      icon: Package,
      badge: lowStockCount > 0 ? `${lowStockCount} Low` : null,
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    },
    {
      id: 'sales' as ActiveSection,
      label: 'Sales Analytics',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'recommendations' as ActiveSection,
      label: 'Smart Recommendations',
      icon: Lightbulb,
      badge: urgentRecsCount > 0 ? `${urgentRecsCount} Action` : null,
      badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    },
    {
      id: 'copilot' as ActiveSection,
      label: 'AI Copilot',
      icon: Bot,
      badge: 'AI Active',
      badgeColor: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    },
  ];

  return (
    <aside
      id="sidebar-navigation"
      className="w-72 bg-slate-900 text-slate-200 flex flex-col shrink-0 border-r border-slate-800 select-none"
    >
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800/80 flex items-center gap-3.5">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
          <Store className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h1 className="text-base font-bold tracking-tight text-white">RetailIQ</h1>
            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              COPILOT
            </span>
          </div>
          <p className="text-xs text-slate-400 font-medium">Sales & Inventory Intelligence</p>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 py-5 px-3 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Operations
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              id={`nav-item-${item.id}`}
              onClick={() => onSelectSection(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'
                  }`}
                />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-semibold border ${
                    isActive ? 'bg-white/20 text-white border-white/20' : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Quick Copilot Callout Card */}
      <div className="p-3.5 m-3 rounded-xl bg-slate-800/80 border border-slate-700/60">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1 rounded-md bg-indigo-500/20 text-indigo-400">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold text-slate-200">Decision Copilot</span>
        </div>
        <p className="text-[12px] text-slate-400 leading-relaxed mb-3">
          Daily business decision engine running on store run-rates and inventory buffers.
        </p>
        <button
          id="btn-sidebar-ask-copilot"
          onClick={() => onSelectSection('copilot')}
          className="w-full py-1.5 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium flex items-center justify-center gap-1.5 transition-colors shadow-sm"
        >
          <span>Ask Copilot Today</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Store Location Footer */}
      <div className="p-3.5 border-t border-slate-800/80 bg-slate-900/50 flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-slate-200 truncate">{STORE_INFO.branch}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[11px] text-emerald-400 font-medium">POS Live Sync</span>
          </div>
        </div>
        <span className="text-[10px] text-slate-400 font-mono bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
          {STORE_INFO.storeId}
        </span>
      </div>
    </aside>
  );
};

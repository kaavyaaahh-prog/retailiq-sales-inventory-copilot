import React from 'react';
import { Play, CheckCircle2, ChevronRight, Sparkles, X } from 'lucide-react';
import { ActiveSection } from './Sidebar';
import { Product } from '../types';

export interface DemoStep {
  step: number;
  title: string;
  description: string;
  actionText: string;
  targetSection?: ActiveSection;
  targetProductId?: string;
  copilotQuery?: string;
}

interface HackathonDemoGuideProps {
  currentStepIndex: number;
  isActive: boolean;
  onNextStep: () => void;
  onClose: () => void;
  onJumpToStep: (step: number) => void;
}

export const DEMO_STEPS: DemoStep[] = [
  {
    step: 1,
    title: '1. Manager opens Dashboard',
    description: 'Dashboard surfaces real-time sales KPIs and low-stock critical alerts.',
    actionText: 'Review Dashboard Alerts',
    targetSection: 'overview',
  },
  {
    step: 2,
    title: '2. Low Stock Alerts flagged',
    description: 'Urgent notice: Cooking Oil (5 units left) and Rice (8 units left).',
    actionText: 'Open Inventory Management',
    targetSection: 'inventory',
  },
  {
    step: 3,
    title: '3. Inspect Cooking Oil in Catalog',
    description: 'Notice 5 units remaining, 110 sold, reorder threshold 15.',
    actionText: 'Analyze Cooking Oil',
    targetProductId: 'p-1',
  },
  {
    step: 4,
    title: '4. System Recommends: "RESTOCK NOW"',
    description: 'Diagnostic highlights Critical stock health and Urgent priority.',
    actionText: 'Open AI Copilot',
    targetSection: 'copilot',
  },
  {
    step: 5,
    title: '5. Ask AI Copilot for Decision Guidance',
    description: 'Ask: "Which products should I restock today?"',
    actionText: 'Ask Copilot Question',
    targetSection: 'copilot',
    copilotQuery: 'Which products should I restock?',
  },
  {
    step: 6,
    title: '6. Copilot Recommends Restocking',
    description: 'AI details Cooking Oil (Urgent), Rice (High), and Milk (Medium).',
    actionText: 'Click "Create Restock Request"',
    targetProductId: 'p-1',
  },
  {
    step: 7,
    title: '7. Restock Request Confirmed',
    description: 'Toast displays: "Restock request created successfully."',
    actionText: 'Finish Demo Flow',
  },
];

export const HackathonDemoGuide: React.FC<HackathonDemoGuideProps> = ({
  currentStepIndex,
  isActive,
  onNextStep,
  onClose,
  onJumpToStep,
}) => {
  if (!isActive) return null;

  const currentStep = DEMO_STEPS[currentStepIndex] || DEMO_STEPS[0];
  const isLast = currentStepIndex >= DEMO_STEPS.length - 1;

  return (
    <div
      id="hackathon-demo-banner"
      className="bg-slate-900 text-white border-b border-indigo-500/30 px-6 py-2.5 flex items-center justify-between text-xs sticky top-16 z-20 shadow-md"
    >
      <div className="flex items-center gap-3 min-w-0">
        <span className="px-2 py-0.5 rounded-full bg-indigo-500 text-white font-extrabold text-[10px] tracking-wide uppercase flex items-center gap-1 shrink-0">
          <Sparkles className="w-3 h-3" />
          Hackathon Demo Flow
        </span>
        <div className="flex items-center gap-2 truncate">
          <span className="font-bold text-white">{currentStep.title}</span>
          <span className="text-slate-400 hidden md:inline truncate">
            — {currentStep.description}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          id="btn-demo-next-action"
          onClick={onNextStep}
          className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
        >
          <span>{currentStep.actionText}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>

        <button
          id="btn-close-demo-guide"
          onClick={onClose}
          className="p-1 text-slate-400 hover:text-white transition-colors"
          title="Dismiss demo bar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

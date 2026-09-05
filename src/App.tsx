import React, { useState } from 'react';
import { Sidebar, ActiveSection } from './components/Sidebar';
import { Header } from './components/Header';
import { Overview } from './components/Overview';
import { Inventory } from './components/Inventory';
import { SalesAnalytics } from './components/SalesAnalytics';
import { SmartRecommendations } from './components/SmartRecommendations';
import { AICopilot } from './components/AICopilot';
import { ProductAnalysisModal } from './components/ProductAnalysisModal';
import { RestockModal } from './components/RestockModal';
import { AlertsDrawer } from './components/AlertsDrawer';
import { ToastContainer, ToastMessage } from './components/Toast';
import { HackathonDemoGuide, DEMO_STEPS } from './components/HackathonDemoGuide';
import { INITIAL_PRODUCTS, SALES_TREND_DAYS, INITIAL_ALERTS } from './data/mockData';
import { Product, AlertNotification, PriorityLevel } from './types';
import { generateSmartRecommendations } from './utils/analysis';

export default function App() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [alerts, setAlerts] = useState<AlertNotification[]>(INITIAL_ALERTS);
  const [activeSection, setActiveSection] = useState<ActiveSection>('overview');

  // Modals & Drawers
  const [selectedProductForAnalysis, setSelectedProductForAnalysis] = useState<Product | null>(null);
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [suggestedRestockQty, setSuggestedRestockQty] = useState<number | undefined>(undefined);
  const [isAlertsDrawerOpen, setIsAlertsDrawerOpen] = useState<boolean>(false);

  // Notifications Toast State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Hackathon Demo Flow State
  const [isDemoActive, setIsDemoActive] = useState<boolean>(false);
  const [demoStepIndex, setDemoStepIndex] = useState<number>(0);

  // Show toast utility
  const showToast = (title: string, description?: string, type: 'success' | 'error' | 'info' = 'success') => {
    const newToast: ToastMessage = {
      id: `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      title,
      description,
      type,
    };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
    }, 4000);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Restock action trigger
  const handleOpenRestockModal = (product: Product, suggestedQty?: number) => {
    setRestockProduct(product);
    setSuggestedRestockQty(suggestedQty);
  };

  // Submit Restock Request (Matches prompt specification: "Restock request created successfully.")
  const handleSubmitRestockRequest = (details: {
    productId: string;
    productName: string;
    currentStock: number;
    quantity: number;
    priority: PriorityLevel;
    supplier: string;
  }) => {
    // Update product to mark restock pending
    setProducts((prev) =>
      prev.map((p) =>
        p.id === details.productId
          ? { ...p, restockPending: true }
          : p
      )
    );

    // Close restock modal & product analysis modal if open
    setRestockProduct(null);
    setSelectedProductForAnalysis(null);

    // Show the exact specified success toast
    showToast(
      'Restock request created successfully.',
      `Purchase Order for ${details.quantity} units of ${details.productName} dispatched to ${details.supplier}.`,
      'success'
    );

    // Acknowledge any active alert for this product
    setAlerts((prev) =>
      prev.map((alt) =>
        alt.productId === details.productId ? { ...alt, acknowledged: true } : alt
      )
    );

    // If in demo flow, advance step
    if (isDemoActive && (demoStepIndex === 2 || demoStepIndex === 5 || demoStepIndex === 6)) {
      setDemoStepIndex(DEMO_STEPS.length - 1);
    }
  };

  // Acknowledge Alert Handlers
  const handleAcknowledgeAlert = (id: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === id ? { ...a, acknowledged: true } : a))
    );
    showToast('Alert Acknowledged', 'Logged in manager shift records.', 'info');
  };

  const handleAcknowledgeAllAlerts = () => {
    setAlerts((prev) => prev.map((a) => ({ ...a, acknowledged: true })));
    showToast('All Alerts Acknowledged', 'Store operational register updated.', 'info');
  };

  // Demo Flow step advancement
  const handleNextDemoStep = () => {
    const nextIdx = demoStepIndex + 1;
    if (nextIdx >= DEMO_STEPS.length) {
      setIsDemoActive(false);
      setDemoStepIndex(0);
      showToast('Hackathon Demo Complete', 'All 7 key workflow scenarios demonstrated successfully.', 'info');
      return;
    }

    setDemoStepIndex(nextIdx);
    const step = DEMO_STEPS[nextIdx];

    if (step.targetSection) {
      setActiveSection(step.targetSection);
    }

    if (step.targetProductId) {
      const target = products.find((p) => p.id === step.targetProductId);
      if (target) {
        if (nextIdx === 2 || nextIdx === 3) {
          setSelectedProductForAnalysis(target);
        } else if (nextIdx === 5) {
          handleOpenRestockModal(target, 50);
        }
      }
    }
  };

  const handleStartDemoFlow = () => {
    setIsDemoActive(true);
    setDemoStepIndex(0);
    setActiveSection('overview');
    showToast('Hackathon Demo Started', 'Follow the top banner to demonstrate the end-to-end manager workflow.', 'info');
  };

  // Counts for Badges
  const lowStockCount = products.filter((p) => p.currentStock > 0 && p.currentStock <= p.reorderLevel).length;
  const recommendations = generateSmartRecommendations(products);
  const urgentRecsCount = recommendations.filter((r) => r.type === 'RESTOCK NOW').length;
  const unacknowledgedAlertsCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 text-slate-900 font-sans antialiased">
      {/* Sidebar Navigation */}
      <Sidebar
        activeSection={activeSection}
        onSelectSection={setActiveSection}
        lowStockCount={lowStockCount}
        urgentRecsCount={urgentRecsCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header
          products={products}
          unacknowledgedAlertsCount={unacknowledgedAlertsCount}
          onOpenAlerts={() => setIsAlertsDrawerOpen(true)}
          onSelectProduct={(p) => setSelectedProductForAnalysis(p)}
          onStartDemoFlow={handleStartDemoFlow}
          currentDemoStep={isDemoActive ? DEMO_STEPS[demoStepIndex]?.title : null}
        />

        {/* Hackathon Interactive Demo Guide Banner */}
        <HackathonDemoGuide
          currentStepIndex={demoStepIndex}
          isActive={isDemoActive}
          onNextStep={handleNextDemoStep}
          onClose={() => setIsDemoActive(false)}
          onJumpToStep={(s) => setDemoStepIndex(s)}
        />

        {/* Dynamic Page Views */}
        <main className="flex-1 overflow-y-auto bg-slate-50">
          {activeSection === 'overview' && (
            <Overview
              products={products}
              salesTrend={SALES_TREND_DAYS}
              onSelectProduct={(p) => setSelectedProductForAnalysis(p)}
              onNavigateToInventory={() => setActiveSection('inventory')}
              onNavigateToRecommendations={() => setActiveSection('recommendations')}
              onNavigateToCopilot={() => setActiveSection('copilot')}
              onRequestRestock={(p) => handleOpenRestockModal(p)}
            />
          )}

          {activeSection === 'inventory' && (
            <Inventory
              products={products}
              onSelectProduct={(p) => setSelectedProductForAnalysis(p)}
              onRequestRestock={(p) => handleOpenRestockModal(p)}
            />
          )}

          {activeSection === 'sales' && (
            <SalesAnalytics
              products={products}
              salesTrend={SALES_TREND_DAYS}
              onSelectProduct={(p) => setSelectedProductForAnalysis(p)}
              onRequestRestock={(p) => handleOpenRestockModal(p)}
            />
          )}

          {activeSection === 'recommendations' && (
            <SmartRecommendations
              products={products}
              onSelectProduct={(p) => setSelectedProductForAnalysis(p)}
              onRequestRestock={(p, qty) => handleOpenRestockModal(p, qty)}
            />
          )}

          {activeSection === 'copilot' && (
            <AICopilot
              products={products}
              onRequestRestock={(p, qty) => handleOpenRestockModal(p, qty)}
              onSelectProduct={(p) => setSelectedProductForAnalysis(p)}
            />
          )}
        </main>
      </div>

      {/* Product Analysis Detailed Modal */}
      <ProductAnalysisModal
        product={selectedProductForAnalysis}
        onClose={() => setSelectedProductForAnalysis(null)}
        onCreateRestockRequest={(p) => {
          setSelectedProductForAnalysis(null);
          handleOpenRestockModal(p);
        }}
      />

      {/* Restock Request Modal */}
      <RestockModal
        product={restockProduct}
        suggestedQty={suggestedRestockQty}
        onClose={() => setRestockProduct(null)}
        onSubmitRestock={handleSubmitRestockRequest}
      />

      {/* Alerts Slide-Over Drawer */}
      <AlertsDrawer
        isOpen={isAlertsDrawerOpen}
        onClose={() => setIsAlertsDrawerOpen(false)}
        alerts={alerts}
        products={products}
        onAcknowledgeAlert={handleAcknowledgeAlert}
        onAcknowledgeAll={handleAcknowledgeAllAlerts}
        onSelectProduct={(p) => setSelectedProductForAnalysis(p)}
        onRequestRestock={(p) => handleOpenRestockModal(p)}
      />

      {/* Toast Notification Stack */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}

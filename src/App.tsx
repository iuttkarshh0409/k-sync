import React, { useState } from 'react';
import { KitchenProvider } from './context/KitchenContext';
import { Sidebar, PageId } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { OverviewView } from './components/OverviewView';
import { OrderFoodView } from './components/OrderFoodView';
import { StudentComboView } from './components/StudentComboView';
import { KitchenKDSView } from './components/KitchenKDSView';
import { BatchesView } from './components/BatchesView';
import { TextParserView } from './components/TextParserView';
import { AnalyticsView } from './components/AnalyticsView';
import { BranchesView } from './components/BranchesView';
import { CostSettingsView } from './components/CostSettingsView';
import { Menu, X } from 'lucide-react';

function KitchenApp() {
  const [currentPage, setCurrentPage] = useState<PageId>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavigate = (page: PageId) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#fbf9f5] flex text-[#201f1c]">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex">
        <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-72 bg-[#f4f1ea] h-full shadow-2xl flex flex-col">
            <div className="p-4 flex justify-end">
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 rounded-xl bg-white border border-[#ded8cc] text-[#201f1c]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar currentPage={currentPage} onNavigate={handleNavigate} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Bar button */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#f4f1ea] border-b border-[#e8e4db]">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-xl bg-white border border-[#ded8cc] text-[#201f1c]"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-athelas text-lg font-bold text-[#201f1c]">
            KitchenSync
          </span>
          <span className="w-9" />
        </div>

        <Topbar currentPage={currentPage} onNavigate={handleNavigate} />

        <main className="flex-1 p-6 sm:p-10 max-w-7xl w-full mx-auto">
          {currentPage === 'overview' && <OverviewView onNavigate={handleNavigate} />}
          {currentPage === 'order' && (
            <OrderFoodView onOrderPlaced={() => handleNavigate('kitchen')} />
          )}
          {currentPage === 'student-combo' && (
            <StudentComboView onComboAdded={() => handleNavigate('order')} />
          )}
          {currentPage === 'kitchen' && <KitchenKDSView />}
          {currentPage === 'batches' && <BatchesView />}
          {currentPage === 'parser' && (
            <TextParserView onDispatched={() => handleNavigate('kitchen')} />
          )}
          {currentPage === 'analytics' && <AnalyticsView />}
          {currentPage === 'branches' && <BranchesView />}
          {currentPage === 'settings' && <CostSettingsView />}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <KitchenProvider>
      <KitchenApp />
    </KitchenProvider>
  );
}

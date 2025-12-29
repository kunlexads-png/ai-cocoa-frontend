
import React, { useState } from 'react';
import { ViewState } from '../types';
import { 
  LayoutDashboard, Camera, Factory, FileText, Activity, X, 
  ThermometerSun, Sun, Flame, PieChart, ShieldAlert, GitMerge, 
  Presentation, FileCheck, Gauge, ClipboardCheck, MonitorPlay,
  ChevronLeft, ChevronRight
} from 'lucide-react';

interface SidebarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  isOpen: boolean;
  onClose: () => void;
  allowedViews: ViewState[];
}

export const OFISidebar: React.FC<SidebarProps> = ({ currentView, onNavigate, isOpen, onClose, allowedViews }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    { id: ViewState.OPERATIONAL, label: 'Operational View', icon: MonitorPlay },
    { id: ViewState.MANAGEMENT, label: 'Executive KPIs', icon: Presentation },
    { id: ViewState.WORKFLOW, label: 'Production Workflow', icon: GitMerge },
    { id: ViewState.EFFICIENCY, label: 'Efficiency Analysis', icon: Gauge },
    { id: ViewState.TRACEABILITY, label: 'Traceability', icon: Activity },
    { id: ViewState.FERMENTATION, label: 'Fermentation', icon: ThermometerSun },
    { id: ViewState.DRYING, label: 'Drying Process', icon: Sun },
    { id: ViewState.PROCESSING, label: 'Roasting & Processing', icon: Flame },
    { id: ViewState.YIELD_LOSS, label: 'Yield & Loss', icon: PieChart },
    { id: ViewState.SAFETY, label: 'Safety', icon: ShieldAlert },
    { id: ViewState.QUALITY_VISION, label: 'Quality AI', icon: Camera },
    { id: ViewState.MACHINES, label: 'Machine Health', icon: Factory },
    { id: ViewState.COMPLIANCE, label: 'Export & Compliance', icon: FileCheck },
    { id: ViewState.REPORTS, label: 'AI Reports', icon: FileText },
    { id: ViewState.DEPLOYMENT, label: 'System Setup', icon: ClipboardCheck },
  ];

  const visibleNavItems = navItems.filter(item => allowedViews.includes(item.id));

  // Shared classes for desktop/tablet vs mobile
  const sidebarBase = "h-full bg-[#1A1A1A] border-r border-[#D9A441]/10 flex flex-col transition-all duration-300 ease-in-out shadow-2xl";
  
  return (
    <>
      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={onClose}
        ></div>
      )}

      {/* Sidebar Navigation */}
      <aside className={`
        ${sidebarBase}
        fixed lg:relative z-50
        ${isOpen ? 'translate-x-0 w-72' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-20' : 'lg:w-72'}
      `}>
        
        {/* Header/Logo Section */}
        <div className="p-6 border-b border-[#D9A441]/10 flex items-center justify-between overflow-hidden">
          <div className="flex items-center">
            <h1 className={`text-4xl font-black tracking-tighter text-[#D9A441] transition-opacity duration-300 ${isCollapsed ? 'lg:opacity-0' : 'opacity-100'}`}>
              ofi
            </h1>
          </div>
          <button 
            onClick={onClose}
            className="lg:hidden text-[#D9A441] hover:text-white"
          >
            <X size={24} />
          </button>
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex text-[#D9A441]/40 hover:text-[#D9A441] transition-colors"
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Scrollable Nav Area */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose(); 
                }}
                className={`
                  group w-full flex items-center p-3 rounded-xl transition-all duration-200 relative
                  ${isActive 
                    ? 'bg-[#E6007E] text-white shadow-lg shadow-pink-900/20' 
                    : 'text-[#D9A441]/70 hover:bg-[#D9A441]/5 hover:text-[#D9A441]'
                  }
                `}
                title={isCollapsed ? item.label : ''}
              >
                <div className={`shrink-0 ${isActive ? 'text-white' : 'text-[#D9A441]'}`}>
                  <Icon size={22} />
                </div>
                <span className={`
                  ml-3 font-semibold text-sm whitespace-nowrap transition-all duration-300
                  ${isCollapsed ? 'lg:opacity-0 lg:pointer-events-none' : 'opacity-100'}
                `}>
                  {item.label}
                </span>

                {/* Tablet Hover Label (when collapsed) */}
                {isCollapsed && (
                  <div className="absolute left-full ml-4 px-3 py-2 bg-[#3E2723] text-[#D9A441] text-xs font-bold rounded-md opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 shadow-xl border border-[#D9A441]/20 whitespace-nowrap">
                    {item.label}
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Info */}
        <div className={`p-4 border-t border-[#D9A441]/10 bg-black/20 ${isCollapsed ? 'text-center' : ''}`}>
           {!isCollapsed ? (
              <div className="flex items-center justify-between text-[10px] text-[#D9A441]/40 uppercase tracking-widest font-black">
                <span>Enterprise v2.4</span>
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              </div>
           ) : (
              <div className="flex justify-center">
                 <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
           )}
        </div>
      </aside>
    </>
  );
};

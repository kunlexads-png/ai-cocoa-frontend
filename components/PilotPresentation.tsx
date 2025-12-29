
import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Mic, MonitorPlay, BarChart3, AlertCircle, CheckCircle, Factory } from 'lucide-react';

interface PilotPresentationProps {
  onClose: () => void;
}

const SLIDES = [
  {
    id: 1,
    title: "AI Cocoa Processing Dashboard — OFI Pilot",
    subtitle: "Kumasi Main Processing Plant — Demo Date: Oct 2023",
    bullets: [], // Title slide
    icon: Factory,
    note: "Today I’ll show a pilot that reduces waste and improves consistency using AI and live analytics. This dashboard isn't just a concept; it's a window into a smarter factory."
  },
  {
    id: 2,
    title: "The Problem",
    subtitle: "Current operational challenges",
    bullets: [
      "Quality variance across batches (inconsistent fermentation).",
      "Late detection of defects (often caught only at final QC).",
      "Manual traceability is painful, slow, and error-prone.",
      "Reactive maintenance leads to avoidable downtime."
    ],
    icon: AlertCircle,
    note: "Current manual checks are slow and let defects pass through. That costs money and reputation. We are reacting to issues instead of preventing them."
  },
  {
    id: 3,
    title: "What The Dashboard Does",
    subtitle: "Key Features & Capabilities",
    bullets: [
      "Real-time Sensor Monitoring (Temp, Moisture, Vibration).",
      "AI Computer Vision for instant defect detection.",
      "Predictive Quality Scoring before batches finish.",
      "End-to-End Traceability from farm to package.",
      "Automated Alerts & Actionable Insights."
    ],
    icon: MonitorPlay,
    note: "We detect defective beans on the line instantly and predict final quality before the expensive processing steps. It gives operators superpowers."
  },
  {
    id: 4,
    title: "Impact & Projected Metrics",
    subtitle: "Business Value",
    bullets: [
      "Reduce rejected batches by 15% (Projected).",
      "Reduce drying energy consumption by 10% via optimization.",
      "Shorten reaction time to safety alerts from hours to minutes.",
      "Eliminate paper-based compliance logging."
    ],
    icon: BarChart3,
    note: "With conservative estimates, OFI could save significant costs in rework and reduce energy bills. The ROI comes from consistency and speed."
  },
  {
    id: 5,
    title: "Ask & Next Steps",
    subtitle: "Pilot Proposal",
    bullets: [
      "Deploy Pilot at Kumasi Plant for 8 weeks.",
      "Integrate existing cameras & IoT sensors.",
      "Define success KPIs (Acceptance Rate, OEE).",
      "Training session for shift supervisors."
    ],
    icon: CheckCircle,
    note: "My proposal: An 8-week pilot run with full tech support and weekly checkpoints. I’ll handle the deployment and training personally to ensure success."
  }
];

export const PilotPresentation: React.FC<PilotPresentationProps> = ({ onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const handleNext = () => {
    if (currentSlide < SLIDES.length - 1) setCurrentSlide(c => c + 1);
  };

  const handlePrev = () => {
    if (currentSlide > 0) setCurrentSlide(c => c - 1);
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'ArrowLeft') handlePrev();
    if (e.key === 'Escape') onClose();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide]);

  const slide = SLIDES[currentSlide];
  const Icon = slide.icon;

  return (
    <div className="fixed inset-0 z-[100] bg-black text-white flex flex-col animate-fade-in">
      {/* Header Controls */}
      <div className="flex justify-between items-center p-6 bg-white/5 border-b border-white/10">
        <div className="flex items-center space-x-2 text-[#D9A441]">
           <MonitorPlay size={20} />
           <span className="font-bold tracking-widest text-sm">PILOT PRESENTATION MODE</span>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <X size={24} />
        </button>
      </div>

      {/* Main Slide Content */}
      <div className="flex-1 flex items-center justify-center p-12 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E6007E]/20 rounded-full blur-[128px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#D9A441]/10 rounded-full blur-[128px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

        <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-12 items-center z-10">
           {/* Left: Content */}
           <div className="space-y-8">
              <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 mb-6">
                 <Icon size={32} className="text-[#D9A441]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-[#E6007E] uppercase tracking-wider mb-2">{slide.subtitle}</h2>
                <h1 className="text-5xl lg:text-6xl font-black tracking-tight leading-tight mb-6">{slide.title}</h1>
              </div>
              
              {slide.bullets.length > 0 && (
                <ul className="space-y-4 text-lg text-gray-300">
                  {slide.bullets.map((bullet, idx) => (
                    <li key={idx} className="flex items-start">
                      <span className="mr-4 text-[#D9A441] mt-1.5">•</span>
                      <span>{bullet}</span>
                    </li>
                  ))}
                </ul>
              )}
           </div>

           {/* Right: Speaker Notes (Simulated Teleprompter) */}
           <div className="hidden lg:block bg-[#1a1a1a] p-8 rounded-2xl border border-white/10 shadow-2xl relative">
              <div className="absolute -top-3 left-8 bg-[#D9A441] text-black text-[10px] font-bold px-3 py-1 rounded-full flex items-center uppercase tracking-wider">
                 <Mic size={12} className="mr-1"/> Speaker Notes
              </div>
              <p className="text-xl font-mono text-gray-400 leading-relaxed">
                "{slide.note}"
              </p>
           </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="p-6 bg-white/5 border-t border-white/10 flex justify-between items-center">
         <div className="text-sm text-gray-500 font-mono">
            SLIDE {currentSlide + 1} / {SLIDES.length}
         </div>
         
         <div className="flex space-x-4">
            <button 
              onClick={handlePrev}
              disabled={currentSlide === 0}
              className="flex items-center px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all font-bold"
            >
              <ChevronLeft size={20} className="mr-2"/> Previous
            </button>
            <button 
              onClick={handleNext}
              disabled={currentSlide === SLIDES.length - 1}
              className="flex items-center px-6 py-3 rounded-xl bg-[#E6007E] hover:bg-pink-600 disabled:opacity-30 disabled:bg-gray-700 transition-all font-bold"
            >
              Next <ChevronRight size={20} className="ml-2"/>
            </button>
         </div>
      </div>
    </div>
  );
};

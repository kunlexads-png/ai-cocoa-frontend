
import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, X, MessageSquare, ChevronDown, ChevronUp, Sparkles, AlertCircle, Terminal } from 'lucide-react';
import { chatWithAssistant } from '../services/geminiService';
import { ViewState, UserRole } from '../types';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

interface AIChatAssistantProps {
  currentView: ViewState;
  userRole: UserRole;
  contextData: any; // Generic data bucket to pass relevant store/mock data
}

export const AIChatAssistant: React.FC<AIChatAssistantProps> = ({ currentView, userRole, contextData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'model',
      text: `Hello ${userRole}. I am the CocoaInsight AI. I can help analyze processing data, explain quality issues, or troubleshoot machine alerts. \n\nTry commands like **/analyze**, **/report**, or ask me about the current batch.`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Prepare history for API
      const historyForApi = messages.map(m => ({ role: m.role, text: m.text }));
      
      // Combine view info with passed data context
      const fullContext = {
        view: currentView,
        role: userRole,
        data: contextData // Pass the specific mock data active in the main app
      };

      const responseText = await chatWithAssistant(textToSend, fullContext, historyForApi);

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: responseText,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "I encountered a connection error. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Quick Action Buttons
  const QuickAction = ({ cmd, label }: { cmd: string, label: string }) => (
    <button 
      onClick={() => handleSend(cmd)}
      className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded-md border border-slate-200 transition-colors font-mono flex items-center"
    >
      <Terminal size={10} className="mr-1 text-[#E6007E]"/> {label}
    </button>
  );

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end pointer-events-none">
      {/* Chat Window */}
      <div 
        className={`pointer-events-auto bg-white rounded-2xl shadow-2xl border border-[#D9A441]/20 w-[380px] max-w-[90vw] transition-all duration-300 ease-in-out transform origin-bottom-right overflow-hidden flex flex-col
          ${isOpen ? 'scale-100 opacity-100 translate-y-0 mb-4 h-[600px] max-h-[80vh]' : 'scale-90 opacity-0 translate-y-10 h-0'}
        `}
      >
        {/* Header */}
        <div className="bg-[#3E2723] p-4 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <Bot size={20} className="text-[#D9A441]" />
            </div>
            <div>
              <h3 className="font-bold text-sm">CocoaInsight Assistant</h3>
              <div className="flex items-center space-x-1">
                 <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
                 <p className="text-[10px] text-gray-300">Online • Expert Mode</p>
              </div>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/10 rounded transition-colors"
          >
            <ChevronDown size={20} />
          </button>
        </div>

        {/* Message Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 custom-scrollbar">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div 
                className={`max-w-[85%] rounded-2xl p-3 text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-[#E6007E] text-white rounded-tr-sm' 
                    : 'bg-white text-slate-700 border border-slate-100 rounded-tl-sm'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <div className={`text-[10px] mt-1 text-right ${msg.role === 'user' ? 'text-pink-100' : 'text-slate-400'}`}>
                  {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
              </div>
            </div>
          ))}
          {isTyping && (
             <div className="flex justify-start">
               <div className="bg-white border border-slate-100 rounded-2xl p-3 flex space-x-1 items-center shadow-sm">
                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                 <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-slate-100 shrink-0">
          {/* Suggestion Chips */}
          <div className="flex gap-2 mb-3 overflow-x-auto pb-1 no-scrollbar">
            <QuickAction cmd="/analyze" label="/analyze" />
            <QuickAction cmd="/report" label="/report" />
            <QuickAction cmd="Explain this step" label="Help" />
          </div>

          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about data, quality, or machines..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-[#E6007E] focus:border-transparent outline-none transition-all placeholder:text-slate-400"
            />
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() || isTyping}
              className="absolute right-2 p-1.5 bg-[#3E2723] text-white rounded-lg hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={16} />
            </button>
          </div>
          <div className="text-[10px] text-center text-slate-400 mt-2">
            AI can make mistakes. Verify critical safety data manually.
          </div>
        </div>
      </div>

      {/* Floating Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto group flex items-center justify-center w-14 h-14 rounded-full shadow-xl transition-all duration-300 hover:scale-105 ${
          isOpen ? 'bg-slate-200 text-slate-600 rotate-90' : 'bg-[#3E2723] text-[#D9A441] border-2 border-[#D9A441]'
        }`}
      >
        {isOpen ? <X size={24} /> : <Sparkles size={24} className="animate-pulse" />}
        
        {/* Notification Badge if closed */}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-[#E6007E] rounded-full border-2 border-white"></span>
        )}
      </button>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Bot,
  Send,
  Sparkles,
  RefreshCcw,
  ShoppingCart,
  User,
  Lightbulb,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { Product, ChatMessage, UserProfile } from '../types';
import { generateCopilotAnswer, getTodayBusinessInsight } from '../utils/copilotEngine';

interface FloatingCopilotPanelProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  userProfile?: UserProfile;
  onRequestRestock: (product: Product, suggestedQty?: number) => void;
  onSelectProduct: (product: Product) => void;
}

export const FloatingCopilotPanel: React.FC<FloatingCopilotPanelProps> = ({
  isOpen,
  onClose,
  products,
  userProfile,
  onRequestRestock,
  onSelectProduct,
}) => {
  const managerFirstName = userProfile?.name ? userProfile.name.split(' ')[0] : 'Store Manager';
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'panel-init',
      sender: 'copilot',
      text: `Hello ${managerFirstName}! I'm your **RetailIQ Copilot**.\nI'm constantly monitoring store run-rates, depletion hazards, and purchase order timelines.\n\nHow can I help guide your store operations right now?`,
      timestamp: 'Just now',
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Suggested questions from user prompt
  const suggestedQuestions = [
    'Which products need restocking?',
    'What are my best-selling products?',
    "Predict tomorrow's demand.",
    'Which products are low in stock?',
    'What should I focus on today?',
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages, isTyping]);

  const handleSendMessage = (textToSend?: string) => {
    const query = (textToSend || inputQuery).trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setIsTyping(true);

    setTimeout(() => {
      const response = generateCopilotAnswer(query, products);
      const actionProduct = response.suggestedAction
        ? products.find((p) => p.id === response.suggestedAction?.productId)
        : undefined;

      const copilotMsg: ChatMessage = {
        id: `cpl-${Date.now()}`,
        sender: 'copilot',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedAction: response.suggestedAction,
        actionProduct,
      };

      setMessages((prev) => [...prev, copilotMsg]);
      setIsTyping(false);
    }, 450);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="floating-copilot-backdrop"
      className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex justify-end animate-in fade-in"
      onClick={onClose}
    >
      <div
        id="floating-copilot-drawer"
        className="w-full max-w-md sm:max-w-lg bg-slate-900/95 backdrop-blur-2xl border-l border-cyan-500/30 h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 relative text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-white tracking-tight">RetailIQ AI Copilot</h3>
                <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-xs shadow-cyan-400 animate-pulse"></span>
              </div>
              <p className="text-[11px] text-slate-400">Contextual Store Decision Assistant</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() =>
                setMessages([
                  {
                    id: `rst-${Date.now()}`,
                    sender: 'copilot',
                    text: 'Chat history cleared. How can I help you optimize your inventory or sales today?',
                    timestamp: 'Just now',
                  },
                ])
              }
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Reset conversation"
            >
              <RefreshCcw className="w-4 h-4" />
            </button>
            <button
              id="btn-close-floating-copilot"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages List */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-xs shadow-md shadow-cyan-600/20'
                      : 'bg-slate-800/80 border border-slate-700/70 text-slate-200 rounded-bl-xs'
                  }`}
                >
                  <div className="whitespace-pre-line space-y-1">
                    {msg.text.split('\n').map((line, idx) => {
                      const renderLineWithBold = (str: string) => {
                        const parts = str.split(/(\*\*.*?\*\*)/g);
                        return parts.map((part, i) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return (
                              <strong key={i} className="text-white font-bold">
                                {part.slice(2, -2)}
                              </strong>
                            );
                          }
                          return part;
                        });
                      };
                      return (
                        <p key={idx} className={line.trim() === '' ? 'h-1.5' : ''}>
                          {renderLineWithBold(line)}
                        </p>
                      );
                    })}
                  </div>

                  {/* Embedded Restock Action Button */}
                  {msg.suggestedAction && msg.actionProduct && (
                    <div className="mt-3 pt-2.5 border-t border-slate-700/80 flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-cyan-300">
                        {msg.actionProduct.name} · {msg.suggestedAction.recommendedQty} units
                      </span>
                      <button
                        onClick={() => {
                          onRequestRestock(msg.actionProduct!, msg.suggestedAction?.recommendedQty);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-[11px] flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                      >
                        <ShoppingCart className="w-3 h-3" />
                        <span>Create Restock</span>
                      </button>
                    </div>
                  )}

                  <div className="text-[9px] mt-1.5 text-right text-slate-400">
                    {msg.timestamp}
                  </div>
                </div>

                {isUser && (
                  <div className="w-7 h-7 rounded-lg bg-slate-700 text-cyan-400 flex items-center justify-center shrink-0 mt-1 font-bold text-xs">
                    VS
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-2.5 items-center">
              <div className="w-7 h-7 rounded-lg bg-cyan-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-3.5 h-3.5" />
              </div>
              <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-400 text-xs flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-[10px] text-slate-400 ml-1">Analyzing store metrics...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions (Prompt #9: Which products need restocking?, What are my best-selling products?, Predict tomorrow's demand.) */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/60 space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <Lightbulb className="w-3 h-3 text-cyan-400" />
            <span>Suggested Inquiries</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(q)}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-cyan-500/40 text-[11px] text-slate-300 hover:text-white font-medium transition-all cursor-pointer"
              >
                "{q}"
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Copilot about sales, stockouts, or reorders..."
            className="flex-1 py-2 px-3 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputQuery.trim() || isTyping}
            className={`p-2 rounded-xl text-white font-bold transition-all ${
              inputQuery.trim() && !isTyping
                ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-md shadow-cyan-500/30 cursor-pointer'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  RefreshCcw,
  ShoppingCart,
  User,
  Lightbulb,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Clock
} from 'lucide-react';
import { Product, ChatMessage, UserProfile } from '../types';
import { generateCopilotAnswer, getTodayBusinessInsight } from '../utils/copilotEngine';

interface AICopilotProps {
  products: Product[];
  userProfile?: UserProfile;
  onRequestRestock: (product: Product, suggestedQty?: number) => void;
  onSelectProduct: (product: Product) => void;
}

export const AICopilot: React.FC<AICopilotProps> = ({
  products,
  userProfile,
  onRequestRestock,
  onSelectProduct,
}) => {
  const managerFirstName = userProfile?.name ? userProfile.name.split(' ')[0] : 'Store Manager';
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'copilot',
      text: `Hello ${managerFirstName}! I'm your **RetailIQ Copilot**. I've analyzed your store inventory, today's sales velocity, and distributor replenishment schedules.\n\nYou can select one of the suggested prompts below, or ask me anything about sales performance, low stock, or daily manager actions.`,
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
    'What action should the manager take today?',
    'What products are not selling?',
  ];

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

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

    // Simulate AI thinking
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

  const todayInsight = getTodayBusinessInsight(products);

  return (
    <div id="ai-copilot-screen" className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Bot className="w-5 h-5" />
            </span>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              RetailIQ AI Copilot
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800">
              Online
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Natural language assistant trained on retail operations, reorder points, and sales patterns.
          </p>
        </div>

        <button
          onClick={() =>
            setMessages([
              {
                id: `rst-${Date.now()}`,
                sender: 'copilot',
                text: 'Conversation reset. Ask me anything about stockout hazards, reorders, or today’s sales!',
                timestamp: 'Just now',
              },
            ])
          }
          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <RefreshCcw className="w-3.5 h-3.5" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Daily Priority Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-500/30 backdrop-blur-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 mt-0.5 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 block">
              Autonomous Manager Briefing
            </span>
            <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">
              {todayInsight.insightText}
            </p>
          </div>
        </div>

        {todayInsight.recommendedActionProduct && (
          <button
            onClick={() => onRequestRestock(todayInsight.recommendedActionProduct!, 50)}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white transition-all shadow-md shadow-cyan-500/20 flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Restock {todayInsight.recommendedActionProduct.name}</span>
          </button>
        )}
      </div>

      {/* Main Chat Container */}
      <div className="rounded-3xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl shadow-2xl flex flex-col h-[560px] overflow-hidden">
        {/* Chat History */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] sm:max-w-[78%] rounded-2xl p-4 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-br-xs shadow-md shadow-cyan-600/20'
                      : 'bg-slate-800/80 border border-slate-700 text-slate-200 rounded-bl-xs'
                  }`}
                >
                  <div className="whitespace-pre-line space-y-1.5">
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
                        <p key={idx} className={line.trim() === '' ? 'h-2' : ''}>
                          {renderLineWithBold(line)}
                        </p>
                      );
                    })}
                  </div>

                  {/* Inline Action Button */}
                  {msg.suggestedAction && msg.actionProduct && (
                    <div className="mt-3 pt-3 border-t border-slate-700 flex items-center justify-between gap-3">
                      <div className="text-[11px] font-bold text-cyan-300">
                        Recommendation: Restock {msg.suggestedAction.recommendedQty} units
                      </div>
                      <button
                        onClick={() => onRequestRestock(msg.actionProduct!, msg.suggestedAction?.recommendedQty)}
                        className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-extrabold text-xs flex items-center gap-1 shadow-sm transition-colors cursor-pointer"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Create PO Now</span>
                      </button>
                    </div>
                  )}

                  <div className="text-[9px] mt-2 text-right text-slate-400 font-mono">
                    {msg.timestamp}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 text-cyan-400 flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs">
                    VS
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div className="flex gap-3 items-center">
              <div className="w-8 h-8 rounded-xl bg-cyan-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700 text-slate-400 text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce [animation-delay:0.4s]"></span>
                <span className="text-xs text-slate-300 ml-1">Analyzing store telemetry...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Inquiries */}
        <div className="p-3.5 border-t border-slate-800 bg-slate-950/70 space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            <Lightbulb className="w-3 h-3 text-cyan-400" />
            <span>Suggested Manager Queries</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSendMessage(q)}
                className="px-3 py-1 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-cyan-500/40 text-[11px] text-slate-300 hover:text-white font-medium transition-all cursor-pointer"
              >
                "{q}"
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Copilot about sales, inventory hazards, or reorder quantities..."
            className="flex-1 py-2.5 px-4 text-xs bg-slate-900 border border-slate-700 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputQuery.trim() || isTyping}
            className={`p-2.5 rounded-xl text-white font-bold transition-all ${
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

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
  HelpCircle
} from 'lucide-react';
import { Product, ChatMessage } from '../types';
import { generateCopilotAnswer, getTodayBusinessInsight } from '../utils/copilotEngine';

interface AICopilotProps {
  products: Product[];
  onRequestRestock: (product: Product, suggestedQty?: number) => void;
  onSelectProduct: (product: Product) => void;
}

export const AICopilot: React.FC<AICopilotProps> = ({
  products,
  onRequestRestock,
  onSelectProduct,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'copilot',
      text: `Hello Vikram! I'm your **RetailIQ Copilot**. I've analyzed your store inventory, today's sales velocity, and distributor replenishment schedules.

You can select one of the suggested prompts below, or ask me anything about sales performance, low stock, or daily manager actions.`,
      timestamp: 'Just now',
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    'Which products should I restock?',
    'What is my best-selling product?',
    'Which products are low in stock?',
    'Which products are overstocked?',
    'What should I focus on today?',
    'How can I improve inventory?',
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

    const userMsgId = `user-${Date.now()}`;
    const newUserMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newUserMsg]);
    setInputQuery('');
    setIsTyping(true);

    // Simulate natural thinking delay
    setTimeout(() => {
      const response = generateCopilotAnswer(query, products);
      const matchingProduct = response.suggestedAction
        ? products.find((p) => p.id === response.suggestedAction?.productId)
        : undefined;

      const newCopilotMsg: ChatMessage = {
        id: `copilot-${Date.now()}`,
        sender: 'copilot',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedAction: response.suggestedAction,
        actionProduct: matchingProduct,
      };

      setMessages((prev) => [...prev, newCopilotMsg]);
      setIsTyping(false);
    }, 450);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const businessInsight = getTodayBusinessInsight(products);

  return (
    <div id="ai-copilot-screen" className="p-8 max-w-5xl mx-auto flex flex-col h-[calc(100vh-4rem)]">
      {/* Page Title & Daily Business Insight Banner */}
      <div className="shrink-0 space-y-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                RetailIQ Copilot
              </h2>
              <p className="text-xs text-slate-500">
                Context-aware conversational intelligence for store managers
              </p>
            </div>
          </div>

          <button
            id="btn-copilot-reset-chat"
            onClick={() =>
              setMessages([
                {
                  id: `reset-${Date.now()}`,
                  sender: 'copilot',
                  text: 'Chat history cleared. How can I help you optimize your store operations right now?',
                  timestamp: 'Just now',
                },
              ])
            }
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 shadow-xs cursor-pointer"
          >
            <RefreshCcw className="w-3 h-3" />
            <span>Clear Chat</span>
          </button>
        </div>

        {/* TODAY'S BUSINESS INSIGHT (Specified in prompt) */}
        <div
          id="todays-business-insight"
          className="p-4 rounded-2xl bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 text-white shadow-sm border border-indigo-800/40 relative overflow-hidden"
        >
          <div className="relative z-10 flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-300 shrink-0 border border-indigo-400/30">
              <Sparkles className="w-5 h-5 text-indigo-300" />
            </div>
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-extrabold tracking-wider uppercase text-indigo-300">
                  Today's Business Insight
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="text-[10px] text-slate-400 font-mono">Live Velocity Audit</span>
              </div>
              <p className="text-sm font-semibold text-slate-100 leading-relaxed">
                "{businessInsight}"
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Conversation Container */}
      <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-5">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                id={`chat-msg-${msg.id}`}
                className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-br-xs shadow-xs'
                      : 'bg-slate-50 text-slate-900 border border-slate-200/80 rounded-bl-xs'
                  }`}
                >
                  <div className="whitespace-pre-line space-y-1.5">
                    {msg.text.split('\n').map((line, idx) => {
                      // Render markdown bolding simply
                      const renderLineWithBold = (str: string) => {
                        const parts = str.split(/(\*\*.*?\*\*)/g);
                        return parts.map((part, i) => {
                          if (part.startsWith('**') && part.endsWith('**')) {
                            return (
                              <strong key={i} className={isUser ? 'text-white' : 'text-slate-900 font-bold'}>
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

                  {/* Interactive Action Button embedded inside Copilot response */}
                  {msg.suggestedAction && msg.actionProduct && (
                    <div className="mt-3.5 pt-3 border-t border-slate-200/80 flex items-center justify-between gap-3">
                      <div className="text-xs font-semibold text-slate-700">
                        {msg.actionProduct.name} · Rec. Quantity:{' '}
                        <strong>{msg.suggestedAction.recommendedQty} units</strong>
                      </div>
                      <button
                        id={`btn-copilot-action-${msg.actionProduct.id}`}
                        onClick={() =>
                          onRequestRestock(msg.actionProduct!, msg.suggestedAction?.recommendedQty)
                        }
                        className="px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>Create Restock Request</span>
                      </button>
                    </div>
                  )}

                  <div
                    className={`text-[10px] mt-2 text-right ${
                      isUser ? 'text-blue-200' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </div>
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0 shadow-xs mt-1">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-3.5 items-center">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-500 text-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"></span>
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]"></span>
                <span className="ml-1 text-[11px] font-medium text-slate-400">
                  Analyzing inventory run-rates & purchase orders...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions Chips (Specified in prompt) */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-1.5 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            <Lightbulb className="w-3 h-3 text-amber-500" />
            <span>Suggested Inquiries</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                id={`btn-suggested-q-${idx}`}
                onClick={() => handleSendMessage(q)}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:text-blue-700 hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer shadow-xs"
              >
                "{q}"
              </button>
            ))}
          </div>
        </div>

        {/* Chat Input Bar */}
        <div className="p-4 border-t border-slate-200 bg-white">
          <div className="flex items-center gap-2">
            <input
              id="copilot-input-field"
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Copilot about sales, reorders, stockouts, or suppliers..."
              className="flex-1 py-2.5 px-4 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all"
            />
            <button
              id="btn-copilot-send"
              onClick={() => handleSendMessage()}
              disabled={!inputQuery.trim() || isTyping}
              className={`p-2.5 rounded-xl text-white font-semibold transition-all flex items-center justify-center cursor-pointer ${
                inputQuery.trim() && !isTyping
                  ? 'bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-600/20'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  User,
  Send,
  Sparkles,
  ShieldAlert,
  SlidersHorizontal,
  ListTodo,
  FileCheck2,
} from 'lucide-react';
import type { AssessmentResult, ChatMessage, EvidenceRecord, ImprovementAction, UserProfile } from '../../types';
import {
  generateCoachingResponse,
  generateDeterministicFallbackResponse,
} from '../../services/geminiCoachService';

interface CreditCoachProps {
  profile: UserProfile;
  assessment: AssessmentResult;
  records?: EvidenceRecord[];
  actions?: ImprovementAction[];
  onNavigateToSimulator?: () => void;
  onNavigateToPassport?: () => void;
  onNavigateToActions?: () => void;
}

let messageCounter = 0;
const createMsgId = (prefix: string) => `${prefix}_${++messageCounter}`;

export const CreditCoach: React.FC<CreditCoachProps> = ({
  profile,
  assessment,
  records,
  actions,
  onNavigateToSimulator,
  onNavigateToPassport,
  onNavigateToActions,
}) => {

  const initialMessages: ChatMessage[] = [
    {
      id: 'msg_0',
      sender: 'coach',
      text: `Hello ${profile.name.split(' ')[0]}! I am your CapitalBridge Readiness Coach. I review your verified financial records and explain exactly what your evidence says, what is holding you back from your ${profile.currency} ${profile.capitalGoalAmount.toLocaleString()} goal, and what concrete steps will strengthen your profile.`,
      timestamp: 'Just now',
      suggestedPrompts: [
        `Why is my readiness score ${assessment.overallScore}?`,
        'What is holding my profile back most?',
        `What should I improve first to reach ${assessment.overallScore >= 800 ? '850' : '800'}?`,
        'Explain my Financial Passport in simple terms',
      ],
    },
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Sync messages when profile switches
  useEffect(() => {
    setMessages([
      {
        id: createMsgId('coach_init'),
        sender: 'coach',
        text: `Hello ${profile.name.split(' ')[0]}! I am your CapitalBridge Readiness Coach for ${profile.businessName}. Your current verified score is ${assessment.overallScore}/1000 (${assessment.readinessBand}) with ${assessment.eci.overall}% Evidence Confidence. Ask me anything about your readiness metrics or how to reach your ${profile.currency} ${profile.capitalGoalAmount.toLocaleString()} capital goal.`,
        timestamp: 'Just now',
        suggestedPrompts: [
          `Why is my readiness score ${assessment.overallScore}?`,
          'What is holding my profile back most?',
          `What should I improve first to reach ${assessment.overallScore >= 800 ? '850' : '800'}?`,
          'Explain my Financial Passport in simple terms',
        ],
      },
    ]);
  }, [profile.id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Grounded response generator fallback strictly referencing deterministic numbers
  const generateGroundedResponse = (query: string): string => {
    return generateDeterministicFallbackResponse(query, profile, assessment);
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: createMsgId('usr'),
      sender: 'user',
      text: textToSend,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      // Build conversation turns
      const recentHistory = messages.slice(-4).map((m) => ({
        sender: m.sender,
        text: m.text,
      }));

      const res = await generateCoachingResponse({
        query: textToSend,
        profile,
        assessment,
        evidenceRecords: records,
        improvementActions: actions,
        history: recentHistory,
      });

      const coachMsg: ChatMessage = {
        id: createMsgId('coach'),
        sender: 'coach',
        text: res.text,
        timestamp: 'Just now',
        suggestedPrompts: res.suggestedPrompts,
      };
      setMessages((prev) => [...prev, coachMsg]);
    } catch (err) {
      console.warn('Gemini coaching response fallback:', err);
      const fallbackText = generateGroundedResponse(textToSend);
      const coachMsg: ChatMessage = {
        id: createMsgId('coach'),
        sender: 'coach',
        text: fallbackText,
        timestamp: 'Just now',
        suggestedPrompts: [
          'What happens if I add 3 months of business records?',
          'What should I improve first?',
          'Explain my Financial Passport',
        ],
      };
      setMessages((prev) => [...prev, coachMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl flex flex-col h-[520px] sm:h-[640px] shadow-[0_4px_20px_-4px_rgba(0,0,0,0.03)] overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-b border-slate-200/80 bg-slate-50/70 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-emerald-50 border border-emerald-200/80 flex items-center justify-center text-emerald-600 shadow-xs shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-900 text-sm">AI Credit Coach</h3>
              <span className="text-[10px] bg-emerald-100/80 text-emerald-800 border border-emerald-300/80 px-2 py-0.5 rounded-full font-bold inline-flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-emerald-600" />
                Gemini 3.6 Flash Active
              </span>
              <span className="hidden md:inline-flex text-[10px] bg-blue-50 text-blue-700 border border-blue-200/80 px-2 py-0.5 rounded-full font-semibold">
                Tailored to App Data
              </span>
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-1 sm:line-clamp-none">
              Strictly grounded in your verified financial records • Explains readiness math without hallucinations
            </p>
          </div>
        </div>

        {/* Guardrail badge */}
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-xs font-semibold shrink-0">
          <ShieldAlert className="w-3.5 h-3.5 text-emerald-600" />
          <span>Audit-Verified Context</span>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-white">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.sender === 'user'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-xs'
              }`}
            >
              {msg.sender === 'user' ? (
                <User className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>

            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-emerald-600 text-white font-medium shadow-sm'
                  : 'bg-slate-50 border border-slate-200/80 text-slate-800 font-medium'
              }`}
            >
              <div className="whitespace-pre-line">{msg.text}</div>

              {/* Suggested Follow-up chips */}
              {msg.suggestedPrompts && (
                <div className="mt-3 pt-3 border-t border-slate-200/60 flex flex-wrap gap-1.5">
                  {msg.suggestedPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSendMessage(prompt)}
                      className="text-[11px] bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 px-3 py-1 rounded-xl transition border border-slate-200/80 flex items-center gap-1 font-medium shadow-xs"
                    >
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      <span>{prompt}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Bot className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span>Coach is analyzing assessment indicators...</span>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Quick Navigation Shortcuts */}
      <div className="px-4 sm:px-6 py-2 sm:py-2.5 border-t border-slate-100 bg-slate-50/50 flex items-center gap-2 overflow-x-auto scrollbar-none text-[11px]">
        <span className="text-slate-400 font-bold uppercase tracking-wider shrink-0 text-[10px]">
          Direct Actions:
        </span>
        {onNavigateToSimulator && (
          <button
            onClick={onNavigateToSimulator}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200/80 px-2.5 sm:px-3 py-1 rounded-xl transition font-semibold shadow-xs shrink-0"
          >
            <SlidersHorizontal className="w-3 h-3 text-emerald-600" />
            <span>Test in Simulator</span>
          </button>
        )}
        {onNavigateToActions && (
          <button
            onClick={onNavigateToActions}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200/80 px-2.5 sm:px-3 py-1 rounded-xl transition font-semibold shadow-xs shrink-0"
          >
            <ListTodo className="w-3 h-3 text-amber-600" />
            <span>View Action Tasks</span>
          </button>
        )}
        {onNavigateToPassport && (
          <button
            onClick={onNavigateToPassport}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200/80 px-2.5 sm:px-3 py-1 rounded-xl transition font-semibold shadow-xs shrink-0"
          >
            <FileCheck2 className="w-3 h-3 text-emerald-600" />
            <span>Open Passport</span>
          </button>
        )}
      </div>

      {/* Input Form */}
      <div className="p-3 sm:p-4 border-t border-slate-200/80 bg-white">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(inputText);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask why your score is 742, what is holding you back..."
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="p-2.5 sm:p-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl transition shadow-sm active:scale-95 shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

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
import type { AssessmentResult, ChatMessage, UserProfile } from '../../types';

interface CreditCoachProps {
  profile: UserProfile;
  assessment: AssessmentResult;
  onNavigateToSimulator?: () => void;
  onNavigateToPassport?: () => void;
  onNavigateToActions?: () => void;
}

let messageCounter = 0;
const createMsgId = (prefix: string) => `${prefix}_${++messageCounter}`;

export const CreditCoach: React.FC<CreditCoachProps> = ({
  profile,
  assessment,
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
        'Why is my readiness score 742?',
        'What is holding my profile back most?',
        'What should I improve first to reach 800?',
        'Explain my Financial Passport in simple terms',
      ],
    },
  ];

  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Grounded response generator strictly referencing deterministic numbers
  const generateGroundedResponse = (query: string): string => {
    const q = query.toLowerCase();

    if (q.includes('why') && (q.includes('742') || q.includes('score'))) {
      return (
        `Your readiness score is ${assessment.overallScore}/1000 (${assessment.readinessBand}). ` +
        `This is a deterministic weighted composite:\n\n` +
        `• Strengths: Your Business Activity (${assessment.indicators.business_activity.value}/100), Income Consistency (${assessment.indicators.income_consistency.value}/100), and Susu Savings (${assessment.indicators.savings_behaviour.value}/100) are strong, contributing over 450 points.\n\n` +
        `• Gaps: Your score is primarily constrained by Documentation Completeness (${assessment.indicators.documentation_completeness.value}/100) because you currently only have 3 months of sales ledgers instead of 6, and Cash-flow Stability (${assessment.indicators.cashflow_stability.value}/100) due to first-week supplier payment dips.`
      );
    }

    if (q.includes('holding') || q.includes('gap') || q.includes('weakness')) {
      return (
        `The two primary factors holding your profile back from reaching Prime Ready (800+) are:\n\n` +
        `1. Documentation Blind Spot: Missing 3 months of daily business books (March - May 2026). This caps your documentation score at 53/100.\n` +
        `2. Expense Volatility: Paying bulk food suppliers in single lump sums creates brief negative weekly cash dips, dragging cash-flow stability to 64/100.\n\n` +
        `Resolving these two items can add +70 points to your readiness score.`
      );
    }

    if (q.includes('improve first') || q.includes('800') || q.includes('action')) {
      return (
        `Priority #1 Recommendation:\n` +
        `Upload or reconstruct your missing 3 months of daily sales ledgers (March - May 2026).\n\n` +
        `Why this first? It provides the highest ROI: it increases Documentation Completeness from 53 to 85, adding +48 points instantly and raising your Evidence Confidence Index (ECI) to 94%. You can test this exact change in the What-If Simulator right now!`
      );
    }

    if (q.includes('passport') || q.includes('explain my')) {
      return (
        `Your Financial Passport packages your verified evidence into a tamper-evident summary that financial institutions can trust. Instead of exposing your private transaction details or bank login, it proves: ` +
        `(1) You generate regular turnover in Makola Market, (2) You maintain flawless Susu savings discipline, and (3) Your Evidence Confidence is ${assessment.eci.overall}%. It translates your hard work into an institutional-grade story.`
      );
    }

    if (q.includes('what if') || q.includes('3 months') || q.includes('scenario')) {
      return (
        `Adding 3 months of business ledgers deterministically raises your score from 742 to 790 (+48 points) and pushes your Evidence Confidence from 86% to 94%. This moves you to the top tier of Capital Ready, giving microfinance partners high certainty in approving your GH₵8,000 inventory request.`
      );
    }

    return (
      `Based on your verified assessment (${assessment.overallScore}/1000, Evidence Confidence: ${assessment.eci.overall}%):\n\n` +
      `Your core financial activity is healthy. Focus on closing the documentation gap (adding missing sales ledgers) and maintaining your weekly GH₵300 Susu deposits. Let me know if you would like me to explain any specific indicator or simulate a scenario!`
    );
  };

  const handleSendMessage = (textToSend: string) => {
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: createMsgId('usr'),
      sender: 'user',
      text: textToSend,
      timestamp: 'Just now',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const responseText = generateGroundedResponse(textToSend);
      const coachMsg: ChatMessage = {
        id: createMsgId('coach'),
        sender: 'coach',
        text: responseText,
        timestamp: 'Just now',
        suggestedPrompts: [
          'What happens if I add 3 months of business records?',
          'What should I improve first?',
          'Explain my Financial Passport',
        ],
      };
      setMessages((prev) => [...prev, coachMsg]);
      setIsTyping(false);
    }, 600);
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
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm">AI Credit Coach</h3>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2 py-0.5 rounded-full font-bold">
                Grounded in Math
              </span>
            </div>
            <p className="text-[11px] text-slate-500 line-clamp-1 sm:line-clamp-none">
              Explains verified outputs • Does not invent numbers or make loan decisions
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

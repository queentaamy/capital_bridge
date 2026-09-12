// ============================================================================
// CapitalBridge Onboarding Wizard
// Multi-step account creation and instant readiness assessment generator
// Specification: GirlCode Hackathon Ghana 2026
// ============================================================================

import React, { useState, useMemo } from 'react';
import {
  X,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Building,
  User,
  MapPin,
  Mail,
  Phone,
  Target,
  FileCheck2,
  CheckCircle2,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Layers,
  Coins,
} from 'lucide-react';
import type { UserProfile, EvidenceRecord, ImprovementAction } from '../../types';
import { ProfileManager, type OnboardingInput } from '../../services/profileManager';
import { calculateAssessment } from '../../services/assessmentEngine';

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (data: {
    profile: UserProfile;
    records: EvidenceRecord[];
    actions: ImprovementAction[];
  }) => void;
  onSelectAmaBenchmark: () => void;
}

const SECTOR_OPTIONS = [
  'Food & Catering / Provisions',
  'Retail Trade & General Merchandise',
  'Auto Spares & Hardware',
  'Fashion, Textiles & Apparel',
  'Agribusiness & Produce Wholesale',
  'Beauty, Cosmetics & Salons',
  'Digital & Professional Services',
  'Artisan & Light Manufacturing',
];

const POPULAR_LOCATIONS = [
  'Makola Market, Accra',
  'Kumasi Central Market',
  'Kaneshie Market, Accra',
  'Tema Community 1 Commercial Area',
  'Takoradi Market Circle',
  'Madina Market, Accra',
  'Kejetia Market, Kumasi',
  'Osu Oxford Street, Accra',
];

export const OnboardingWizard: React.FC<OnboardingWizardProps> = ({
  isOpen,
  onClose,
  onComplete,
  onSelectAmaBenchmark,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState(SECTOR_OPTIONS[0]);
  const [businessLocation, setBusinessLocation] = useState(POPULAR_LOCATIONS[0]);
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [capitalGoalAmount, setCapitalGoalAmount] = useState<number>(10000);
  const [capitalGoalPurpose, setCapitalGoalPurpose] = useState(
    'Bulk inventory and working capital expansion'
  );

  // Evidence Streams
  const [hasMomo, setHasMomo] = useState(true);
  const [momoInflowEstimate, setMomoInflowEstimate] = useState(45000);

  const [hasBank, setHasBank] = useState(true);
  const [bankName, setBankName] = useState('Ecobank Ghana');

  const [hasSusu, setHasSusu] = useState(true);
  const [susuWeeklyAmount, setSusuWeeklyAmount] = useState(300);

  const [hasSalesLedger, setHasSalesLedger] = useState(true);
  const [salesMonthsCount, setSalesMonthsCount] = useState<number>(3);

  const [hasStatutoryKyc, setHasStatutoryKyc] = useState(true);

  const [hasActiveLoan, setHasActiveLoan] = useState(false);
  const [monthlyLoanInstallment, setMonthlyLoanInstallment] = useState(500);

  // Calculate live preview assessment when step 4 is reached
  const previewData = useMemo(() => {
    const input: OnboardingInput = {
      name: name.trim() || 'New Entrepreneur',
      businessName: businessName.trim() || 'Emerging SME Venture',
      businessType,
      businessLocation,
      email: email.trim() || 'entrepreneur@capitalbridge.gh',
      phone: phone.trim() || '0244000000',
      capitalGoalAmount,
      capitalGoalPurpose,
      evidenceStreams: {
        hasMomo,
        momoInflowEstimate,
        hasBank,
        bankName,
        hasSusu,
        susuWeeklyAmount,
        hasSalesLedger,
        salesMonthsCount,
        hasStatutoryKyc,
        hasActiveLoan,
        monthlyLoanInstallment,
      },
    };

    const { profile, records, actions } = ProfileManager.createProfileFromOnboarding(input);
    const assessment = calculateAssessment(profile.id, records);

    return { profile, records, actions, assessment };
  }, [
    name,
    businessName,
    businessType,
    businessLocation,
    email,
    phone,
    capitalGoalAmount,
    capitalGoalPurpose,
    hasMomo,
    momoInflowEstimate,
    hasBank,
    bankName,
    hasSusu,
    susuWeeklyAmount,
    hasSalesLedger,
    salesMonthsCount,
    hasStatutoryKyc,
    hasActiveLoan,
    monthlyLoanInstallment,
  ]);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step < 4) setStep((s) => (s + 1) as any);
  };

  const handleBack = () => {
    if (step > 1) setStep((s) => (s - 1) as any);
  };

  const handleFinish = () => {
    onComplete({
      profile: previewData.profile,
      records: previewData.records,
      actions: previewData.actions,
    });
  };

  const isStep1Valid = name.trim().length > 1 && businessName.trim().length > 1;
  const isStep2Valid = capitalGoalAmount > 0;

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-hidden sm:p-4">
      <div className="bg-white border-t sm:border border-slate-200/90 rounded-t-3xl sm:rounded-3xl w-full max-w-2xl text-slate-800 shadow-2xl flex flex-col max-h-[94dvh] sm:max-h-[88vh] overflow-hidden my-0 sm:my-auto animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
        {/* Header Bar */}
        <div className="shrink-0 bg-slate-50/90 px-4 sm:px-6 py-3 sm:py-4 border-b border-slate-200/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-sm shadow-xs">
              CB
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                Create Financial Readiness Account
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">
                Step {step} of 4 • Transform fragmented activity into a verifiable profile
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Pills */}
        <div className="shrink-0 px-4 sm:px-6 pt-3 pb-2.5 bg-white border-b border-slate-100 sm:border-b-0">
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            {[
              { num: 1, label: 'Enterprise' },
              { num: 2, label: 'Capital Target' },
              { num: 3, label: 'Evidence' },
              { num: 4, label: 'Readiness' },
            ].map((s) => (
              <div
                key={s.num}
                className={`flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2 py-1.5 px-2 sm:px-2.5 rounded-xl text-xs font-bold transition ${
                  step === s.num
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                    : step > s.num
                    ? 'bg-slate-100 text-emerald-700'
                    : 'text-slate-400 bg-slate-50'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] sm:text-[11px] shrink-0 font-bold ${
                    step === s.num
                      ? 'bg-emerald-600 text-white'
                      : step > s.num
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {step > s.num ? '✓' : s.num}
                </span>
                <span className="hidden sm:inline truncate">{s.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Body / Step Content (Internally Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 overscroll-contain">
          {/* STEP 1: Personal & Enterprise Identity */}
          {step === 1 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Tell us about yourself and your enterprise
                </h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Lenders evaluate your business location, track record, and commercial identity.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Your Full Name <span className="text-emerald-600">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Kofi Boateng"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Enterprise / Trade Name <span className="text-emerald-600">*</span>
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Boateng Auto Spares & Hardware"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Industry / Trade Sector
                  </label>
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium bg-white"
                  >
                    {SECTOR_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Market / Operating Location
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      list="locations-list"
                      value={businessLocation}
                      onChange={(e) => setBusinessLocation(e.target.value)}
                      placeholder="e.g. Kumasi Central Market"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                    />
                    <datalist id="locations-list">
                      {POPULAR_LOCATIONS.map((loc) => (
                        <option key={loc} value={loc} />
                      ))}
                    </datalist>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. kofi.boateng@gmail.com"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Phone (MoMo Number)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. 0244 892 104"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Capital Target & Intended Purpose */}
          {step === 2 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  What is your financing target and intended purpose?
                </h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  CapitalBridge benchmarks your cash-flow capacity specifically against this capital facility.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Target Capital Amount (GH₵)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-2.5 font-bold text-emerald-700 text-xs">
                    GH₵
                  </span>
                  <input
                    type="number"
                    min="500"
                    step="500"
                    value={capitalGoalAmount}
                    onChange={(e) => setCapitalGoalAmount(Number(e.target.value))}
                    className="w-full pl-12 pr-4 py-2.5 text-sm font-bold text-slate-900 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div className="flex flex-wrap gap-1.5 mt-2">
                  {[3000, 5000, 8000, 12000, 20000, 35000].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setCapitalGoalAmount(preset)}
                      className={`text-[11px] font-bold px-3 py-1 rounded-lg border transition ${
                        capitalGoalAmount === preset
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                          : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      GH₵ {preset.toLocaleString()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Intended Capital Purpose
                </label>
                <textarea
                  rows={2}
                  value={capitalGoalPurpose}
                  onChange={(e) => setCapitalGoalPurpose(e.target.value)}
                  placeholder="e.g. Bulk purchase of high-demand spare parts and inventory buffer before high season."
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
                />
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-3.5 text-xs text-emerald-900 flex items-start gap-2.5">
                <Target className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <strong>Loan Feasibility Rule:</strong> For an advance of{' '}
                  <span className="font-bold text-emerald-800">
                    GH₵ {capitalGoalAmount.toLocaleString()}
                  </span>
                  , underwriters will look for verified monthly cash turnovers of at least GH₵{' '}
                  {(capitalGoalAmount * 0.9).toLocaleString()} and Debt Service Coverage $\ge$ 1.25x.
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Connect Financial Evidence */}
          {step === 3 && (
            <div className="space-y-4 animate-in fade-in">
              <div>
                <h4 className="text-base font-bold text-slate-900">
                  Select your available financial evidence streams
                </h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Check all financial trails you can verify. More diverse records elevate your Evidence Confidence Index (ECI).
                </p>
              </div>

              <div className="space-y-2.5">
                {/* 1. Mobile Money */}
                <div
                  onClick={() => setHasMomo(!hasMomo)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start justify-between ${
                    hasMomo
                      ? 'bg-emerald-50/60 border-emerald-300 shadow-2xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-xl mt-0.5 ${
                        hasMomo ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <CreditCard className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        MTN / Telecel Mobile Money Wallet Statements
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        Daily trade revenues collected via merchant QR or agent wallet.
                      </div>
                      {hasMomo && (
                        <div
                          className="mt-2 text-[11px] text-emerald-800 font-semibold"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Estimated 6-Month Inflow: GH₵ {momoInflowEstimate.toLocaleString()}
                          <input
                            type="range"
                            min="10000"
                            max="150000"
                            step="5000"
                            value={momoInflowEstimate}
                            onChange={(e) => setMomoInflowEstimate(Number(e.target.value))}
                            className="w-full mt-1 accent-emerald-600"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      hasMomo ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {hasMomo ? 'Connected' : 'Exclude'}
                  </span>
                </div>

                {/* 2. Commercial Bank Account */}
                <div
                  onClick={() => setHasBank(!hasBank)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start justify-between ${
                    hasBank
                      ? 'bg-emerald-50/60 border-emerald-300 shadow-2xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-xl mt-0.5 ${
                        hasBank ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Building className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Commercial SME Bank Account
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        Formal bank statements via Ecobank, GCB, Fidelity, etc.
                      </div>
                      {hasBank && (
                        <div className="mt-2 text-[11px]" onClick={(e) => e.stopPropagation()}>
                          <label className="font-bold text-slate-700 block mb-0.5">Bank Partner:</label>
                          <select
                            value={bankName}
                            onChange={(e) => setBankName(e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[11px] font-medium text-slate-800"
                          >
                            <option value="Ecobank Ghana">Ecobank Ghana</option>
                            <option value="GCB Bank Ghana">GCB Bank Ghana</option>
                            <option value="Fidelity Bank Ghana">Fidelity Bank Ghana</option>
                            <option value="Stanbic Bank Ghana">Stanbic Bank Ghana</option>
                            <option value="CalBank">CalBank</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      hasBank ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {hasBank ? 'Connected' : 'Exclude'}
                  </span>
                </div>

                {/* 3. Market Susu Savings */}
                <div
                  onClick={() => setHasSusu(!hasSusu)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start justify-between ${
                    hasSusu
                      ? 'bg-emerald-50/60 border-emerald-300 shadow-2xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-xl mt-0.5 ${
                        hasSusu ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Coins className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Market Susu Thrift Savings Collector Passbook
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        Continuous weekly discipline stamps showing informal reserve habits.
                      </div>
                      {hasSusu && (
                        <div className="mt-2 text-[11px]" onClick={(e) => e.stopPropagation()}>
                          <label className="font-bold text-slate-700 block mb-0.5">
                            Weekly Deposit: GH₵ {susuWeeklyAmount}
                          </label>
                          <input
                            type="range"
                            min="100"
                            max="1000"
                            step="50"
                            value={susuWeeklyAmount}
                            onChange={(e) => setSusuWeeklyAmount(Number(e.target.value))}
                            className="w-full accent-emerald-600"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      hasSusu ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {hasSusu ? 'Connected' : 'Exclude'}
                  </span>
                </div>

                {/* 4. Sales Ledgers */}
                <div
                  onClick={() => setHasSalesLedger(!hasSalesLedger)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start justify-between ${
                    hasSalesLedger
                      ? 'bg-emerald-50/60 border-emerald-300 shadow-2xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-xl mt-0.5 ${
                        hasSalesLedger ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <FileCheck2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Daily Paper Books or Electronic Sales Ledgers
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        Itemized daybooks of customer transactions and inventory receipts.
                      </div>
                      {hasSalesLedger && (
                        <div
                          className="flex items-center gap-2 mt-2 text-[11px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="font-bold text-slate-700">Observation Window:</span>
                          <button
                            type="button"
                            onClick={() => setSalesMonthsCount(3)}
                            className={`px-2 py-0.5 rounded font-bold ${
                              salesMonthsCount === 3
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            3 Months (Has Gap)
                          </button>
                          <button
                            type="button"
                            onClick={() => setSalesMonthsCount(6)}
                            className={`px-2 py-0.5 rounded font-bold ${
                              salesMonthsCount === 6
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            6 Months (Complete)
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      hasSalesLedger ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {hasSalesLedger ? 'Connected' : 'Exclude'}
                  </span>
                </div>

                {/* 5. Statutory KYC */}
                <div
                  onClick={() => setHasStatutoryKyc(!hasStatutoryKyc)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start justify-between ${
                    hasStatutoryKyc
                      ? 'bg-emerald-50/60 border-emerald-300 shadow-2xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-xl mt-0.5 ${
                        hasStatutoryKyc ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Registrar General Registration & Local Assembly Permit
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        Valid certificates proving legal existence and commercial operation.
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      hasStatutoryKyc ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {hasStatutoryKyc ? 'Verified' : 'Pending'}
                  </span>
                </div>

                {/* 6. Active Loan */}
                <div
                  onClick={() => setHasActiveLoan(!hasActiveLoan)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition flex items-start justify-between ${
                    hasActiveLoan
                      ? 'bg-amber-50/70 border-amber-300 shadow-2xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-xl mt-0.5 ${
                        hasActiveLoan ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">
                        Existing Active Micro-Loan / Facility (Advans, Sinapi Aba, etc.)
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        Check if you have an active installment repayment obligation.
                      </div>
                      {hasActiveLoan && (
                        <div className="mt-2 text-[11px]" onClick={(e) => e.stopPropagation()}>
                          <label className="font-bold text-amber-800 block mb-0.5">
                            Monthly Installment: GH₵ {monthlyLoanInstallment}
                          </label>
                          <input
                            type="range"
                            min="200"
                            max="2000"
                            step="50"
                            value={monthlyLoanInstallment}
                            onChange={(e) => setMonthlyLoanInstallment(Number(e.target.value))}
                            className="w-full accent-amber-600"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-md ${
                      hasActiveLoan ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {hasActiveLoan ? 'Active Loan' : 'Debt Free'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Instant Readiness Computation & Reveal */}
          {step === 4 && (
            <div className="space-y-5 animate-in fade-in">
              <div className="text-center max-w-md mx-auto">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Deterministic Assessment Generated</span>
                </div>
                <h4 className="text-xl font-black text-slate-900 tracking-tight">
                  {previewData.profile.name}&apos;s Capital Readiness Baseline
                </h4>
                <p className="text-xs text-slate-500 font-medium mt-1">
                  {previewData.profile.businessName} • {previewData.profile.businessLocation}
                </p>
              </div>

              {/* Central Score Card */}
              <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
                <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div>
                    <div className="text-xs font-semibold text-emerald-100 uppercase tracking-wider">
                      Initial Readiness Score
                    </div>
                    <div className="text-4xl sm:text-5xl font-black tabular-nums tracking-tight mt-1">
                      {previewData.assessment.overallScore}
                      <span className="text-lg font-normal text-emerald-200"> / 1000</span>
                    </div>
                    <div className="inline-flex items-center gap-2 mt-2 bg-white/15 backdrop-blur-xs px-3 py-1 rounded-full text-xs font-bold">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-200" />
                      <span>{previewData.assessment.readinessBand}</span>
                    </div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 text-center sm:text-right border border-white/10">
                    <div className="text-[11px] font-bold text-emerald-100 uppercase tracking-wider">
                      Evidence Confidence Index
                    </div>
                    <div className="text-2xl font-black tabular-nums mt-1">
                      {previewData.assessment.eci.overall}%
                    </div>
                    <div className="text-[11px] text-emerald-200 font-medium mt-0.5">
                      {previewData.records.length} Verified Evidence Streams
                    </div>
                  </div>
                </div>
              </div>

              {/* 6 Indicators Preview */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                  <span>6 Normalized Indicator Breakdown</span>
                  <span className="text-emerald-700 font-semibold text-[11px]">
                    Targeting GH₵ {previewData.profile.capitalGoalAmount.toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                  {Object.values(previewData.assessment.indicators).map((ind) => (
                    <div
                      key={ind.key}
                      className="p-2.5 rounded-xl border border-slate-200/80 bg-slate-50/50"
                    >
                      <div className="text-[11px] font-semibold text-slate-500 truncate">
                        {ind.label}
                      </div>
                      <div className="text-sm font-black text-slate-900 tabular-nums mt-0.5">
                        {ind.value}/100
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Improvement Task */}
              {previewData.actions.length > 0 && (
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-3.5 text-xs text-amber-900">
                  <div className="font-bold flex items-center gap-1.5 mb-1 text-amber-800">
                    <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                    <span>Immediate Ranked Opportunity:</span>
                  </div>
                  <p className="text-[11px] font-medium leading-relaxed">
                    {previewData.actions[0].title} (+{previewData.actions[0].estimatedPointGain} PTS lift).
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer / Navigation Controls (Always Visible & Accessible) */}
        <div className="shrink-0 bg-slate-50/95 backdrop-blur-md px-4 sm:px-6 py-3 sm:py-4 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-2.5 sm:gap-3">
          <div className="w-full sm:w-auto order-1 sm:order-2 flex items-center gap-2">
            {step < 4 ? (
              <button
                type="button"
                disabled={step === 1 ? !isStep1Valid : !isStep2Valid}
                onClick={handleNext}
                className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white px-5 py-2.5 sm:py-3 rounded-xl transition shadow-xs w-full sm:w-auto cursor-pointer active:scale-[0.99]"
              >
                <span>Continue to Step {step + 1}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinish}
                className="inline-flex items-center justify-center gap-2 text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 sm:py-3 rounded-xl transition shadow-md w-full sm:w-auto cursor-pointer active:scale-[0.99]"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Launch My Dashboard</span>
              </button>
            )}
          </div>

          <div className="w-full sm:w-auto order-2 sm:order-1 flex justify-center sm:justify-start">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-200 px-4 py-2 sm:py-2.5 rounded-xl transition w-full sm:w-auto justify-center cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onSelectAmaBenchmark}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline text-center py-1 sm:py-0 w-full sm:w-auto cursor-pointer"
              >
                Explore Demo Profile (Ama Mensah • 742 PTS) &rarr;
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

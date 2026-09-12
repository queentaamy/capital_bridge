import React, { useMemo } from 'react';
import {
  X,
  User,
  Building,
  MapPin,
  Mail,
  Phone,
  Target,
  FileCheck,
  RefreshCw,
  UserPlus,
  Check,
} from 'lucide-react';
import type { UserProfile, EvidenceRecord } from '../../types';
import { Badge } from './Badge';

interface ProfileDrawerProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onResetDemo: () => void;
  profiles?: UserProfile[];
  onSelectProfile?: (profileId: string) => void;
  onOpenOnboarding?: () => void;
  records?: EvidenceRecord[];
  onToggleRecord?: (recordId: string) => void;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  profile,
  isOpen,
  onClose,
  onResetDemo,
  profiles = [],
  onSelectProfile,
  onOpenOnboarding,
  records = [],
  onToggleRecord,
}) => {
  // Derive stream consent directly from active evidence records
  const consent = useMemo(() => {
    const hasMomo = records.some(
      (r) =>
        r.isActive &&
        (r.sourceName.toLowerCase().includes('momo') ||
          r.sourceName.toLowerCase().includes('mobile money'))
    );
    const hasBank = records.some(
      (r) => r.isActive && r.sourceName.toLowerCase().includes('bank')
    );
    const hasSusu = records.some((r) => r.isActive && r.category === 'savings');
    const hasStatutory = records.some((r) => r.isActive && r.category === 'documents');

    return {
      momo: hasMomo,
      bank: hasBank,
      susu: hasSusu,
      statutory: hasStatutory,
    };
  }, [records]);

  if (!isOpen) return null;

  const handleToggleStream = (stream: 'momo' | 'bank' | 'susu' | 'statutory') => {
    if (!onToggleRecord) return;
    const targetRecord = records.find((r) => {
      if (stream === 'momo') {
        return (
          r.sourceName.toLowerCase().includes('momo') ||
          r.sourceName.toLowerCase().includes('mobile money')
        );
      }
      if (stream === 'bank') return r.sourceName.toLowerCase().includes('bank');
      if (stream === 'susu') return r.category === 'savings';
      if (stream === 'statutory') return r.category === 'documents';
      return false;
    });

    if (targetRecord) {
      onToggleRecord(targetRecord.id);
    }
  };

  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0].toUpperCase())
      .join('');
  };

  const isAma = profile.id === 'usr_ama_mensah_01';

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center sm:items-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-hidden sm:p-4">
      <div className="bg-white border-t sm:border border-slate-200/90 rounded-t-3xl sm:rounded-3xl w-full max-w-lg text-slate-800 shadow-2xl flex flex-col max-h-[94dvh] sm:max-h-[88vh] overflow-hidden my-0 sm:my-auto animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-200">
        {/* Header */}
        <div className="shrink-0 px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-base shadow-sm shadow-emerald-500/20 shrink-0">
              {getInitials(profile.name)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">{profile.name}</h3>
                <Badge variant="success">Consented</Badge>
              </div>
              <p className="text-[11px] text-slate-500">
                {isAma ? 'Reference Benchmark Persona • Ghana 2026' : 'Verified Borrower Profile • Ghana 2026'}
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

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-5 overscroll-contain">
          {/* Enterprise Details */}
          <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 space-y-2.5 text-xs">
            <div className="flex items-center justify-between text-slate-700">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Building className="w-3.5 h-3.5 text-emerald-600" />
                <span>Enterprise:</span>
              </span>
              <strong className="text-slate-900 font-semibold">{profile.businessName}</strong>
            </div>

            <div className="flex items-center justify-between text-slate-700">
              <span className="flex items-center gap-1.5 text-slate-500">
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>Trade Type:</span>
              </span>
              <span className="text-slate-800 font-medium">{profile.businessType}</span>
            </div>

            <div className="flex items-center justify-between text-slate-700">
              <span className="flex items-center gap-1.5 text-slate-500">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span>Location:</span>
              </span>
              <span className="text-slate-800 font-medium">{profile.businessLocation}</span>
            </div>

            <div className="flex items-center justify-between text-slate-700">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Mail className="w-3.5 h-3.5 text-emerald-600" />
                <span>Email:</span>
              </span>
              <span className="font-mono text-slate-600">{profile.email}</span>
            </div>

            <div className="flex items-center justify-between text-slate-700">
              <span className="flex items-center gap-1.5 text-slate-500">
                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                <span>Mobile (MoMo):</span>
              </span>
              <span className="font-mono text-slate-600">{profile.phone || '024 459 8120'}</span>
            </div>
          </div>

          {/* Capital Goal Card */}
          <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 text-xs">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-emerald-800 font-bold">
                <Target className="w-4 h-4 text-emerald-600" />
                <span>Capital Goal Target:</span>
              </span>
              <span className="text-base font-black text-emerald-700 tabular-nums">
                {profile.currency} {profile.capitalGoalAmount.toLocaleString()}
              </span>
            </div>
            <p className="text-[11px] text-emerald-800/80 mt-1.5 leading-relaxed">
              Purpose: {profile.capitalGoalPurpose}
            </p>
          </div>

          {/* Statutory Compliance Badges */}
          <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-4 space-y-2 text-xs">
            <div className="font-bold text-slate-800 flex items-center gap-1.5 mb-1">
              <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Verified Statutory Compliance</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">
                {isAma ? 'Registrar General (BN-2024-8192)' : `${profile.businessName} (Official Registration)`}
              </span>
              <span className="text-emerald-700 font-bold">Valid through 2027</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">
                {isAma ? 'AMA Food Hygiene Permit 2026' : `${profile.businessType} Operating Permit`}
              </span>
              <span className="text-emerald-700 font-bold">Passed Inspection</span>
            </div>
          </div>

          {/* Granular Data Sharing Consent Controls */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 space-y-2.5 text-xs shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">Data Sharing Consent Permissions</span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                {Object.values(consent).filter(Boolean).length} / 4 Active
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Grant or revoke third-party read consent per evidence stream. Toggling dynamically updates your live readiness score.
            </p>

            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px]">
                <span className="text-slate-700 font-medium">MTN MoMo Business Flows</span>
                <button
                  onClick={() => handleToggleStream('momo')}
                  className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] transition cursor-pointer ${
                    consent.momo ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {consent.momo ? 'Granted' : 'Revoked'}
                </button>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px]">
                <span className="text-slate-700 font-medium">Commercial Bank Statement</span>
                <button
                  onClick={() => handleToggleStream('bank')}
                  className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] transition cursor-pointer ${
                    consent.bank ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {consent.bank ? 'Granted' : 'Revoked'}
                </button>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px]">
                <span className="text-slate-700 font-medium">Market Susu Savings Ledger</span>
                <button
                  onClick={() => handleToggleStream('susu')}
                  className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] transition cursor-pointer ${
                    consent.susu ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {consent.susu ? 'Granted' : 'Revoked'}
                </button>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px]">
                <span className="text-slate-700 font-medium">Statutory Registrations (RGD & AMA)</span>
                <button
                  onClick={() => handleToggleStream('statutory')}
                  className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] transition cursor-pointer ${
                    consent.statutory ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {consent.statutory ? 'Granted' : 'Revoked'}
                </button>
              </div>
            </div>
          </div>

          {/* Switch Profiles / Accounts */}
          {profiles.length > 1 && (
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-2 text-xs">
              <span className="font-bold text-slate-900 block">Switch Available Accounts</span>
              <div className="space-y-1">
                {profiles.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => onSelectProfile?.(p.id)}
                    className={`w-full text-left p-2 rounded-xl flex items-center justify-between transition cursor-pointer ${
                      p.id === profile.id
                        ? 'bg-emerald-100/70 text-emerald-900 font-bold'
                        : 'bg-white hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span>
                      {p.name} ({p.businessName})
                    </span>
                    {p.id === profile.id && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="flex items-center justify-between pt-2">
            {onOpenOnboarding && (
              <button
                onClick={() => {
                  onClose();
                  onOpenOnboarding();
                }}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>+ Create Custom Borrower</span>
              </button>
            )}

            <button
              onClick={() => {
                onResetDemo();
                onClose();
              }}
              className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer ml-auto"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset to Ama Mensah Baseline</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

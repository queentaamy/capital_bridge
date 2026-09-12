import React, { useState } from 'react';
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
import type { UserProfile } from '../../types';
import { Badge } from './Badge';
import { Button } from './Button';

interface ProfileDrawerProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onResetDemo: () => void;
  profiles?: UserProfile[];
  onSelectProfile?: (profileId: string) => void;
  onOpenOnboarding?: () => void;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  profile,
  isOpen,
  onClose,
  onResetDemo,
  profiles = [],
  onSelectProfile,
  onOpenOnboarding,
}) => {
  const [consent, setConsent] = useState({
    momo: true,
    bank: true,
    susu: true,
    statutory: true,
  });

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in overflow-y-auto">
      <div className="bg-white border border-slate-200/80 rounded-3xl w-full max-w-lg p-6 text-slate-800 shadow-2xl relative overflow-hidden my-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white font-black text-lg shadow-sm shadow-emerald-500/20">
            {getInitials(profile.name)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-lg">{profile.name}</h3>
              <Badge variant="success">Consented</Badge>
            </div>
            <p className="text-xs text-slate-500">
              {isAma ? 'Reference Benchmark Persona • Hackathon Ghana 2026' : 'Verified Borrower Profile • Hackathon Ghana 2026'}
            </p>
          </div>
        </div>

        {/* Enterprise Details */}
        <div className="space-y-3 mb-6">
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
              <span className="font-mono text-slate-600">{profile.phone}</span>
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
              <span className="text-slate-500">Registrar General (BN-2024-8192)</span>
              <span className="text-emerald-700 font-bold">Valid through 2027</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-500">AMA Food Hygiene Permit 2026</span>
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
              Grant or revoke third-party read consent per evidence stream for privacy protection.
            </p>

            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px]">
                <span className="text-slate-700 font-medium">MTN MoMo Business Flows</span>
                <button
                  onClick={() => setConsent((p) => ({ ...p, momo: !p.momo }))}
                  className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] transition ${
                    consent.momo ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {consent.momo ? 'Granted' : 'Revoked'}
                </button>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px]">
                <span className="text-slate-700 font-medium">Commercial Bank Statement</span>
                <button
                  onClick={() => setConsent((p) => ({ ...p, bank: !p.bank }))}
                  className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] transition ${
                    consent.bank ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {consent.bank ? 'Granted' : 'Revoked'}
                </button>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px]">
                <span className="text-slate-700 font-medium">Market Susu Savings Ledger</span>
                <button
                  onClick={() => setConsent((p) => ({ ...p, susu: !p.susu }))}
                  className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] transition ${
                    consent.susu ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {consent.susu ? 'Granted' : 'Revoked'}
                </button>
              </div>

              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/60 text-[11px]">
                <span className="text-slate-700 font-medium">Statutory Registrations (RGD & AMA)</span>
                <button
                  onClick={() => setConsent((p) => ({ ...p, statutory: !p.statutory }))}
                  className={`px-2.5 py-0.5 rounded-md font-bold text-[10px] transition ${
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
                    className={`w-full text-left p-2 rounded-xl flex items-center justify-between transition ${
                      p.id === profile.id
                        ? 'bg-emerald-100/70 text-emerald-900 font-bold'
                        : 'bg-white hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    <span>
                      {p.name} ({p.businessName})
                    </span>
                    {p.id === profile.id && <Check className="w-3.5 h-3.5 text-emerald-700" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onResetDemo();
                onClose();
              }}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
            >
              Reset Demo
            </Button>

            {onOpenOnboarding && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose();
                  onOpenOnboarding();
                }}
                leftIcon={<UserPlus className="w-3.5 h-3.5" />}
              >
                + New Account
              </Button>
            )}
          </div>

          <Button variant="secondary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
};

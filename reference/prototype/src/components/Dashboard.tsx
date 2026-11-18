import React from 'react';
import { Patient, SessionRecord, Appointment, FinancialTransaction } from '../types/clinic';
import { CLINIC_INFO } from '../data/initialData';
import { Language, TRANSLATIONS } from '../utils/translations';
import { 
  Users, 
  Calendar, 
  TrendingDown, 
  Wallet, 
  Plus, 
  MessageSquare, 
  ArrowRight, 
  Building, 
  MapPin, 
  Star, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  Sparkles,
  Phone
} from 'lucide-react';

interface DashboardProps {
  patients: Patient[];
  sessions: SessionRecord[];
  appointments: Appointment[];
  transactions: FinancialTransaction[];
  onSelectPatient: (patient: Patient) => void;
  onOpenNewPatientModal: () => void;
  onOpenQuickSession: () => void;
  onOpenWhatsApp: (patient: Patient) => void;
  onOpenClinicAbout: () => void;
  onNavigateToTab: (tab: any) => void;
  currentLanguage: Language;
}

export const Dashboard: React.FC<DashboardProps> = ({
  patients,
  sessions,
  appointments,
  transactions,
  onSelectPatient,
  onOpenNewPatientModal,
  onOpenQuickSession,
  onOpenWhatsApp,
  onOpenClinicAbout,
  onNavigateToTab,
  currentLanguage,
}) => {
  const t = TRANSLATIONS[currentLanguage];

  const todayStr = '2026-11-02';
  const todayAppointments = appointments.filter(a => a.date === todayStr);
  const activePatients = patients.filter(p => p.status === 'active');
  const completedPatients = patients.filter(p => p.status === 'completed');

  // Calculate average pain reduction
  const totalInitialVAS = patients.reduce((acc, p) => acc + p.initialVAS, 0);
  const totalCurrentVAS = patients.reduce((acc, p) => acc + p.currentVAS, 0);
  const avgVASDropPercent = Math.round(((totalInitialVAS - totalCurrentVAS) / totalInitialVAS) * 100);

  // Financial calculations
  const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
  const netBalance = totalIncome - totalExpenses;

  // Breakdown of patients by condition
  const conditionCounts: Record<string, number> = {};
  patients.forEach(p => {
    conditionCounts[p.condition] = (conditionCounts[p.condition] || 0) + 1;
  });

  return (
    <div className="space-y-6">
      {/* Clinic Identity & Welcome Strip - Eye-friendly, soft and clean */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#E6EFE6] text-[#314230] border border-[#CFDFC0] flex items-center gap-1">
                  ⭐ 5.0 (327 Google Yorum)
                </span>
                <span className="text-xs text-slate-300">·</span>
                <span className="text-xs text-slate-500 font-medium">10+ Yıllık Klinik Deneyim</span>
                <span className="text-xs text-slate-300">·</span>
                <span className="text-xs font-semibold text-[#445B43] bg-[#F4F7F4] px-2 py-0.5 rounded border border-[#CFDFC0]">
                  Şu An Açık (08:00 – 19:00)
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                {CLINIC_INFO.name} — Klinik Yönetim Paneli
              </h1>

              <div className="text-xs text-slate-500 mt-1.5 flex items-center gap-2 flex-wrap">
                <button
                  onClick={onOpenClinicAbout}
                  className="flex items-center gap-1.5 hover:text-[#587457] transition-colors text-left font-medium"
                >
                  <MapPin className="w-3.5 h-3.5 text-[#82A381] shrink-0" />
                  <span>{CLINIC_INFO.address}</span>
                </button>
                <span className="text-slate-300">|</span>
                <a href={`tel:${CLINIC_INFO.phoneClean}`} className="flex items-center gap-1 hover:text-[#587457] font-mono">
                  <Phone className="w-3.5 h-3.5 text-[#82A381] shrink-0" />
                  <span>{CLINIC_INFO.phone}</span>
                </a>
              </div>
            </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
            <button
              onClick={onOpenClinicAbout}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-2xs"
            >
              <MapPin className="w-4 h-4 text-[#82A381]" />
              <span>Klinik & Konum</span>
            </button>
            <button
              onClick={onOpenNewPatientModal}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-2xs"
            >
              <Users className="w-4 h-4 text-slate-500" />
              <span>{t.quickNewPatient}</span>
            </button>
            <button
              onClick={onOpenQuickSession}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#82A381] hover:bg-[#6D8E6C] rounded-lg transition-colors shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>{t.quickNewSession}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Core Clinical KPI Metrics - Soft & Eye-Friendly */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Sessions */}
        <div 
          onClick={() => onNavigateToTab('appointments')}
          className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs hover:border-[#CFDFC0] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{t.statTodaySessions}</span>
            <div className="w-8 h-8 rounded-lg bg-[#F4F7F4] text-[#445B43] flex items-center justify-center group-hover:scale-105 transition-transform border border-[#CFDFC0]/50">
              <Calendar className="w-4 h-4 text-[#82A381]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {todayAppointments.length}
              </span>
              <span className="text-xs text-slate-400">Planlanan Seans</span>
            </div>
            <span className="text-[11px] text-[#587457] font-medium block mt-1">
              {todayAppointments.filter(a => a.status === 'completed').length} tamamlandı · {todayAppointments.filter(a => a.status === 'in_progress').length} sedyede
            </span>
          </div>
        </div>

        {/* Active Patients */}
        <div 
          onClick={() => onNavigateToTab('patients')}
          className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs hover:border-[#CFDFC0] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{t.statActivePatients}</span>
            <div className="w-8 h-8 rounded-lg bg-[#F4F7F4] text-[#445B43] flex items-center justify-center group-hover:scale-105 transition-transform border border-[#CFDFC0]/50">
              <Users className="w-4 h-4 text-[#82A381]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {activePatients.length}
              </span>
              <span className="text-xs text-slate-400">Aktif Paket</span>
            </div>
            <span className="text-[11px] text-[#587457] font-medium block mt-1">
              +{completedPatients.length} başarıyla taburcu edildi
            </span>
          </div>
        </div>

        {/* Average VAS Pain Relief */}
        <div 
          onClick={() => onNavigateToTab('patients')}
          className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs hover:border-[#CFDFC0] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{t.statAveragePainRelief}</span>
            <div className="w-8 h-8 rounded-lg bg-[#F4F7F4] text-[#445B43] flex items-center justify-center group-hover:scale-105 transition-transform border border-[#CFDFC0]/50">
              <TrendingDown className="w-4 h-4 text-[#82A381]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                -%{avgVASDropPercent}
              </span>
              <span className="text-xs text-[#587457] font-semibold">Klinik İyileşme</span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1">
              Ortalama VAS: {Math.round(totalInitialVAS / patients.length)} → {Math.round(totalCurrentVAS / patients.length)} / 10
            </span>
          </div>
        </div>

        {/* Monthly Net Ledger */}
        <div 
          onClick={() => onNavigateToTab('finance')}
          className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs hover:border-[#CFDFC0] transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">{t.statMonthlyNet}</span>
            <div className="w-8 h-8 rounded-lg bg-[#F4F7F4] text-[#445B43] flex items-center justify-center group-hover:scale-105 transition-transform border border-[#CFDFC0]/50">
              <Wallet className="w-4 h-4 text-[#82A381]" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-bold font-mono text-slate-900 tabular-nums">
                {netBalance.toLocaleString('tr-TR')} ₺
              </span>
            </div>
            <span className="text-[11px] text-slate-400 block mt-1 font-mono">
              Gelir: {totalIncome.toLocaleString('tr-TR')} ₺ · Gider: {totalExpenses.toLocaleString('tr-TR')} ₺
            </span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Today's Appointments & Clinical Specialization Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols): Today's Schedule */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Bugünkü Seans Randevuları ({todayAppointments.length})</h2>
              <p className="text-xs text-slate-500">Mersin Hantaş Prestij kliniği aktif tedavi akışı</p>
            </div>
            <button
              onClick={() => onNavigateToTab('appointments')}
              className="text-xs font-semibold text-[#587457] hover:text-[#314230] flex items-center gap-1"
            >
              <span>Tüm Takvim</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {todayAppointments.map((apt) => {
              const patientObj = patients.find(p => p.id === apt.patientId || p.fullName === apt.patientName);
              const isCompleted = apt.status === 'completed';
              const isInProgress = apt.status === 'in_progress';

              return (
                <div
                  key={apt.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isInProgress ? 'bg-[#F4F7F4] border-[#B2C9B1] ring-1 ring-[#82A381]/30' :
                    isCompleted ? 'bg-slate-50/60 border-slate-200 opacity-75' :
                    'bg-white border-slate-200/80 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="text-center w-12 shrink-0">
                        <span className="text-xs font-mono font-bold text-slate-900 block leading-tight">{apt.time}</span>
                        <span className="text-[10px] text-slate-400 font-mono">50 dk</span>
                      </div>
                      <div className="h-8 w-px bg-slate-200"></div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{apt.patientName}</span>
                          <span className="text-[11px] font-mono font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                            Seans {apt.sessionNumber}/{apt.totalSessions}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span className="text-[#445B43] font-medium">{apt.condition}</span>
                          <span>·</span>
                          <span>{apt.roomOrBed}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {patientObj && (
                        <button
                          type="button"
                          onClick={() => onOpenWhatsApp(patientObj)}
                          className="p-1.5 text-slate-400 hover:text-[#445B43] hover:bg-[#F4F7F4] rounded-lg transition-colors border border-slate-200"
                          title="WhatsApp Hatırlatması Gönder"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {patientObj && (
                        <button
                          type="button"
                          onClick={() => onSelectPatient(patientObj)}
                          className="px-2.5 py-1 text-xs font-semibold text-[#445B43] hover:bg-[#F4F7F4] rounded-lg border border-[#CFDFC0] transition-colors"
                        >
                          Dosya
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Specialties & Patient Distribution */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-2xs space-y-4">
            <div>
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Klinik Tedavi Branş Dağılımı
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Fzt. Hamit Gümüş özel uzmanlık alanları</p>
            </div>

            <div className="space-y-3">
              {Object.entries(conditionCounts).map(([cond, count]) => {
                const pct = Math.round((count / patients.length) * 100);
                return (
                  <div key={cond} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-700 font-medium truncate pr-2">{cond}</span>
                      <span className="font-mono text-slate-900 font-bold shrink-0">{count} Hasta (%{pct})</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div className="bg-[#82A381] h-full rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={() => onNavigateToTab('protocols')}
                className="w-full py-2 px-3 text-xs font-semibold text-[#445B43] bg-[#F4F7F4] hover:bg-[#E6EFE6] rounded-lg transition-colors flex items-center justify-center gap-1.5 border border-[#CFDFC0]"
              >
                <span>Özel Tedavi Protokollerini İncele</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick Pitch Banner Callout */}
          <div 
            onClick={() => onNavigateToTab('pitch')}
            className="bg-gradient-to-br from-[#445B43] to-slate-900 rounded-xl p-5 text-white shadow-2xs cursor-pointer group hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-2 text-emerald-200 text-xs font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Proje Fikri & Vizyonu</span>
            </div>
            <h4 className="text-sm font-bold text-white">Neden Bu Sistemi Kullanmalı?</h4>
            <p className="text-xs text-emerald-100 mt-1 leading-relaxed">
              Kağıt defterlerin maliyetini, seans kaçaklarını ve kliniğe sağlayacağı yıllık +500,000 TL katma değeri inceleyin.
            </p>
            <div className="mt-3 flex items-center gap-1 text-xs font-bold text-emerald-200 group-hover:text-white transition-colors">
              <span>Proje Detayları & ROI Hesaplayıcı</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

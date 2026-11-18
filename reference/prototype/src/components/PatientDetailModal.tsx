import React, { useState } from 'react';
import { Patient, SessionRecord, TherapyModality, BodyZone } from '../types/clinic';
import { CLINIC_INFO } from '../data/initialData';
import { AnatomicalBodyMap } from './AnatomicalBodyMap';
import { 
  X, 
  Calendar, 
  Phone, 
  User, 
  Clock, 
  CheckCircle, 
  FileText, 
  Printer, 
  Plus, 
  MessageSquare,
  ArrowRight,
  TrendingDown,
  Sparkles,
  MapPin
} from 'lucide-react';

interface PatientDetailModalProps {
  patient: Patient | null;
  sessions: SessionRecord[];
  onClose: () => void;
  onAddSession: (session: Omit<SessionRecord, 'id'>) => void;
  onOpenWhatsApp: (patient: Patient) => void;
}

const ALL_MODALITIES: TherapyModality[] = [
  'Manuel Terapi',
  'Omurga Dekompresyonu / Traksiyon',
  'Çene & Masseter İntraoral Terapi',
  'Kuru İğneleme (Dry Needling)',
  'Klinik Masaj & Miyofasiyal Gevşetme',
  'Terapötik Egzersiz',
  'Elektroterapi (TENS / EMS)',
  'Kupa Terapisi / Hacamat',
  'Kinezyolojik Bantlama',
];

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  patient,
  sessions,
  onClose,
  onAddSession,
  onOpenWhatsApp,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'sessions' | 'new_session' | 'print_card'>('overview');

  // New session form state
  const [sessionDate, setSessionDate] = useState('2026-11-02');
  const [sessionTime, setSessionTime] = useState('16:00');
  const [vasBefore, setVasBefore] = useState(patient?.currentVAS || 5);
  const [vasAfter, setVasAfter] = useState(Math.max(1, (patient?.currentVAS || 5) - 2));
  const [selectedModalities, setSelectedModalities] = useState<TherapyModality[]>(['Manuel Terapi']);
  const [clinicalObs, setClinicalObs] = useState('');
  const [homeEx, setHomeEx] = useState('');
  const [nextDate, setNextDate] = useState('2026-11-05 16:00');

  if (!patient) return null;

  const patientSessions = sessions.filter(s => s.patientId === patient.id);
  const nextSessionNumber = (patient.packageCompletedSessions || 0) + 1;
  const progressPercent = Math.min(100, Math.round((patient.packageCompletedSessions / patient.packageTotalSessions) * 100));

  const toggleModality = (mod: TherapyModality) => {
    if (selectedModalities.includes(mod)) {
      setSelectedModalities(selectedModalities.filter(m => m !== mod));
    } else {
      setSelectedModalities([...selectedModalities, mod]);
    }
  };

  const handleSaveSession = (e: React.FormEvent) => {
    e.preventDefault();
    onAddSession({
      patientId: patient.id,
      patientName: patient.fullName,
      sessionNumber: nextSessionNumber,
      date: sessionDate,
      time: sessionTime,
      therapist: CLINIC_INFO.therapistName,
      vasScoreBefore: Number(vasBefore),
      vasScoreAfter: Number(vasAfter),
      modalities: selectedModalities,
      clinicalObservations: clinicalObs || 'Manuel terapi ve mobilizasyon başarıyla uygulandı.',
      homeExercisesPrescribed: homeEx || 'Günde 2 kez germe ve postür egzersizleri.',
      nextSessionDate: nextDate,
      isPaid: true,
    });
    setActiveTab('sessions');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm border border-teal-200">
              {patient.fullName.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">{patient.fullName}</h2>
                <span className="text-xs font-mono text-slate-500 font-medium">#{patient.fileNumber}</span>
                <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                  patient.status === 'active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                  patient.status === 'completed' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                  'bg-amber-50 text-amber-700 border border-amber-200'
                }`}>
                  {patient.status === 'active' ? 'Aktif Tedavi' : patient.status === 'completed' ? 'Tamamlandı' : 'Beklemede'}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500 mt-0.5">
                <span className="flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {patient.age} Yaş · {patient.gender} · {patient.occupation}
                </span>
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {patient.phone}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenWhatsApp(patient)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
              title="WhatsApp İletişimi"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </button>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 px-6 border-b border-slate-200 bg-white shrink-0 overflow-x-auto text-xs font-medium text-slate-600">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'overview' ? 'border-[#82A381] text-[#314230] font-semibold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            Genel Değerlendirme & Ağrı Haritası
          </button>
          <button
            onClick={() => setActiveTab('sessions')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'sessions' ? 'border-[#82A381] text-[#314230] font-semibold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <span>Seans Geçmişi</span>
            <span className="px-1.5 py-0.2 bg-slate-100 rounded text-[11px] font-mono">
              {patient.packageCompletedSessions}/{patient.packageTotalSessions}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('new_session')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'new_session' ? 'border-[#82A381] text-[#314230] font-semibold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Plus className="w-3.5 h-3.5 text-[#82A381]" />
            <span>Yeni Seans Kaydet</span>
          </button>
          <button
            onClick={() => setActiveTab('print_card')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'print_card' ? 'border-[#82A381] text-[#314230] font-semibold' : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Klinik Seans Takip Kartı</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: OVERVIEW & ANATOMICAL BODY MAP */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Clinical Progress Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <span className="text-xs font-medium text-slate-500 block mb-1">Tanı / Şikayet</span>
                  <span className="text-sm font-bold text-slate-900 block">{patient.condition}</span>
                  <span className="text-[11px] text-slate-500 mt-1 block">Kayıt: {patient.registrationDate}</span>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-500">Ağrı İyileşme Durumu</span>
                    <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                      <TrendingDown className="w-3 h-3" />
                      -%{Math.round(((patient.initialVAS - patient.currentVAS) / patient.initialVAS) * 100)} Azalma
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold tabular-nums text-slate-900">{patient.currentVAS}</span>
                    <span className="text-xs text-slate-500">/ 10 VAS</span>
                    <span className="text-xs text-slate-400 font-mono">(Başlangıç: {patient.initialVAS}/10)</span>
                  </div>
                  {/* Visual VAS bar */}
                  <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden flex">
                    <div 
                      className={`h-full transition-all ${
                        patient.currentVAS <= 3 ? 'bg-emerald-500' : patient.currentVAS <= 6 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${(patient.currentVAS / 10) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-slate-500">Seans Paketi</span>
                    <span className="text-xs font-semibold text-teal-700">%{progressPercent} Tamamlandı</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold tabular-nums text-slate-900">{patient.packageCompletedSessions}</span>
                    <span className="text-sm text-slate-500 font-medium">/ {patient.packageTotalSessions} Seans</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="bg-teal-600 h-full transition-all" 
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Anatomical Body Map */}
              <AnatomicalBodyMap 
                selectedZones={patient.affectedBodyZones} 
                vasScore={patient.currentVAS}
                interactive={false}
              />

              {/* Medical History & Clinical Notes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    Anamnez & Tıbbi Geçmiş
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                    {patient.medicalHistory}
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-4">
                  <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5 text-teal-600" />
                    Fzt. Hamit Gümüş Klinik Değerlendirmesi
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed bg-teal-50/40 p-3 rounded-lg border border-teal-100">
                    {patient.clinicalNotes}
                  </p>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => onOpenWhatsApp(patient)}
                  className="text-xs font-medium text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Hastaya WhatsApp ile Egzersiz / Randevu Gönder</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('new_session')}
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Bu Hastaya Yeni Seans Kaydet</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SESSION HISTORY LOG */}
          {activeTab === 'sessions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Uygulanan Klinik Seanslar</h3>
                  <p className="text-xs text-slate-500">Tamamlanan toplam {patientSessions.length} seans kaydı mevcuttur.</p>
                </div>
                <button
                  onClick={() => setActiveTab('new_session')}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Yeni Seans Ekle</span>
                </button>
              </div>

              {patientSessions.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <Calendar className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-500 font-medium">Bu hasta için henüz seans kaydı girilmedi.</p>
                  <button
                    onClick={() => setActiveTab('new_session')}
                    className="mt-3 text-xs font-semibold text-teal-700 hover:underline"
                  >
                    + İlk Seansı Kaydet
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {patientSessions.map((session) => (
                    <div 
                      key={session.id}
                      className="bg-white border border-slate-200 rounded-xl p-4 transition-all hover:border-slate-300 shadow-xs"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2.5">
                          <span className="w-7 h-7 rounded-lg bg-teal-700 text-white font-bold text-xs flex items-center justify-center font-mono">
                            #{session.sessionNumber}
                          </span>
                          <div>
                            <span className="text-xs font-bold text-slate-900">Seans #{session.sessionNumber}</span>
                            <span className="text-xs text-slate-400 ml-2">· {session.date} {session.time}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-slate-500">Ağrı Değişimi:</span>
                          <span className="font-mono text-rose-600 line-through">{session.vasScoreBefore} VAS</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                          <span className="font-mono font-bold text-emerald-600">{session.vasScoreAfter} VAS</span>
                        </div>
                      </div>

                      {/* Modalities tags */}
                      <div className="flex flex-wrap gap-1.5 my-2.5">
                        {session.modalities.map((mod, idx) => (
                          <span 
                            key={idx}
                            className="text-[11px] font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200"
                          >
                            {mod}
                          </span>
                        ))}
                      </div>

                      {/* Observations */}
                      <div className="mt-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                        <span className="font-semibold text-slate-900">Klinik Not: </span>
                        {session.clinicalObservations}
                      </div>

                      {session.homeExercisesPrescribed && (
                        <div className="mt-1.5 text-xs text-teal-800 bg-teal-50/60 p-2 rounded-lg border border-teal-100 flex items-center gap-1.5">
                          <Sparkles className="w-3 h-3 text-teal-600 shrink-0" />
                          <span><strong className="font-semibold">Ev Egzersizi:</strong> {session.homeExercisesPrescribed}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: NEW SESSION RECORD FORM */}
          {activeTab === 'new_session' && (
            <form onSubmit={handleSaveSession} className="space-y-4">
              <div className="bg-teal-50/70 border border-teal-100 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-teal-900 uppercase tracking-wide">
                    {patient.fullName} — Seans #{nextSessionNumber} Girişi
                  </h4>
                  <p className="text-xs text-teal-700 mt-0.5">
                    Toplam {patient.packageTotalSessions} seanslık paketin {nextSessionNumber}. seansı kaydedilecek.
                  </p>
                </div>
                <span className="text-xs font-mono font-semibold text-teal-800 bg-white px-2.5 py-1 rounded-md border border-teal-200">
                  Uygulayan: {CLINIC_INFO.therapistName}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Seans Tarihi</label>
                  <input
                    type="date"
                    required
                    value={sessionDate}
                    onChange={(e) => setSessionDate(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-teal-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Seans Saati</label>
                  <input
                    type="time"
                    required
                    value={sessionTime}
                    onChange={(e) => setSessionTime(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-teal-600"
                  />
                </div>
              </div>

              {/* VAS Pain Scale Before and After */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">Seans Öncesi Ağrı (VAS)</label>
                    <span className="text-xs font-bold text-rose-600 tabular-nums">{vasBefore} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={vasBefore}
                    onChange={(e) => setVasBefore(Number(e.target.value))}
                    className="w-full accent-rose-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>1 (Hafif)</span>
                    <span>5 (Orta)</span>
                    <span>10 (Şiddetli)</span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-slate-700">Seans Sonrası Ağrı (VAS)</label>
                    <span className="text-xs font-bold text-emerald-600 tabular-nums">{vasAfter} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={vasAfter}
                    onChange={(e) => setVasAfter(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                    <span>0 (Ağrısız)</span>
                    <span>5 (Orta)</span>
                    <span>10 (Değişmedi)</span>
                  </div>
                </div>
              </div>

              {/* Modalities Checkboxes */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-2">
                  Uygulanan Manuel Terapi & Tedavi Modaliteleri:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {ALL_MODALITIES.map((mod) => {
                    const isSelected = selectedModalities.includes(mod);
                    return (
                      <button
                        type="button"
                        key={mod}
                        onClick={() => toggleModality(mod)}
                        className={`text-left p-2 rounded-lg border text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-teal-50 border-teal-600 text-teal-900 font-semibold shadow-2xs'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[10px] ${isSelected ? 'bg-teal-600 text-white' : 'border border-slate-300'}`}>
                            {isSelected && '✓'}
                          </span>
                          <span className="truncate">{mod}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Clinical Observations */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Klinik Gözlemler, Eklem Hareket Açıklığı (ROM) & Uygulanan Manipülasyonlar
                </label>
                <textarea
                  rows={3}
                  value={clinicalObs}
                  onChange={(e) => setClinicalObs(e.target.value)}
                  placeholder="Örn: C5-C6 aksiyel traksiyon uygulandı, parestezi geriledi. Rotasyon açısı 45 dereceden 70 dereceye yükseldi."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-teal-600"
                />
              </div>

              {/* Home Exercises */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Hastaya Verilen Ev Egzersizleri
                  </label>
                  <input
                    type="text"
                    value={homeEx}
                    onChange={(e) => setHomeEx(e.target.value)}
                    placeholder="Örn: McKenzie Sfinks 3x10 + Chin tuck"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-teal-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Sonraki Seans Randevusu
                  </label>
                  <input
                    type="text"
                    value={nextDate}
                    onChange={(e) => setNextDate(e.target.value)}
                    placeholder="2026-11-05 16:00"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-teal-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveTab('overview')}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#82A381] hover:bg-[#6D8E6C] rounded-lg transition-colors shadow-2xs"
                >
                  Seansı Sisteme Kaydet
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: PRINTABLE CLINICAL SESSION CARD (SEANS TAKİP KARTI) */}
          {activeTab === 'print_card' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 no-print">
                <p className="text-xs text-slate-500">
                  Bu kartı yazdırıp hastaya teslim edebilir veya kliniğinizin fiziksel arşivine dosya çıktısı olarak ekleyebilirsiniz.
                </p>
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Yazdır / PDF Olarak Kaydet</span>
                </button>
              </div>

              {/* Official Clinic Letterhead Card */}
              <div className="bg-white border-2 border-slate-300 rounded-xl p-6 max-w-2xl mx-auto shadow-sm text-slate-900 font-sans print:border-none print:shadow-none">
                {/* Header */}
                <div className="flex items-start justify-between border-b-2 border-teal-800 pb-4 mb-4">
                  <div className="flex items-start gap-3">
                    <img
                      src={CLINIC_INFO.logoUrl}
                      alt={CLINIC_INFO.name}
                      className="h-12 w-auto object-contain shrink-0"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div>
                      <h2 className="text-lg font-extrabold text-teal-900 tracking-tight">{CLINIC_INFO.name}</h2>
                      <p className="text-xs font-semibold text-slate-700">{CLINIC_INFO.unitTitle}</p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {CLINIC_INFO.address}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono">Tel: {CLINIC_INFO.phone} · Web: {CLINIC_INFO.website}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Klinik Takip Belgesi</span>
                    <span className="text-sm font-mono font-bold text-slate-800">#{patient.fileNumber}</span>
                    <span className="text-[10px] text-slate-500 block font-mono mt-1">{new Date().toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>

                {/* Patient Info Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs mb-4">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Hasta Adı:</span>
                    <strong className="text-slate-900 font-bold">{patient.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Telefon:</span>
                    <strong className="text-slate-900 font-mono">{patient.phone}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Teşhis / Şikayet:</span>
                    <strong className="text-slate-900">{patient.condition}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Paket Durumu:</span>
                    <strong className="text-teal-700 font-mono">{patient.packageCompletedSessions} / {patient.packageTotalSessions} Seans</strong>
                  </div>
                </div>

                {/* Session Grid Matrix */}
                <div className="mb-4">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">Seans Takip Çizelgesi</h4>
                  <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5 text-center text-xs">
                    {Array.from({ length: patient.packageTotalSessions }).map((_, index) => {
                      const sessionNum = index + 1;
                      const isCompleted = sessionNum <= patient.packageCompletedSessions;
                      return (
                        <div 
                          key={sessionNum}
                          className={`p-2 rounded-lg border flex flex-col items-center justify-center ${
                            isCompleted 
                              ? 'bg-teal-50 border-teal-500 text-teal-900 font-bold' 
                              : 'bg-white border-slate-200 text-slate-400 border-dashed'
                          }`}
                        >
                          <span className="text-[10px] font-mono">S-{sessionNum}</span>
                          <span className="text-sm mt-0.5">{isCompleted ? '✓' : '—'}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Latest Observations */}
                <div className="border border-slate-200 rounded-lg p-3 text-xs mb-4">
                  <span className="font-bold text-slate-900 block mb-1">Son Klinik Not & Ev Egzersizleri:</span>
                  <p className="text-slate-700 leading-relaxed">
                    {patient.clinicalNotes || 'Hasta tedavi planına uyum göstermektedir.'}
                  </p>
                </div>

                {/* Footer Signature Box */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Sorumlu Fizyoterapist:</span>
                    <strong className="text-slate-900">{CLINIC_INFO.therapistName}</strong>
                    <span className="text-[10px] text-slate-500 block">Kaşe & İmza</span>
                  </div>
                  <div className="w-24 h-12 border border-slate-300 rounded flex items-center justify-center text-[10px] text-slate-400 italic">
                    [Klinik Mühür]
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

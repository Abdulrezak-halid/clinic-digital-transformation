import React, { useState } from 'react';
import { Patient, SessionRecord, TherapyModality } from '../types/clinic';
import { CLINIC_INFO } from '../data/initialData';
import { X, Activity, ArrowRight } from 'lucide-react';

interface QuickSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  patients: Patient[];
  onSaveSession: (session: Omit<SessionRecord, 'id'>) => void;
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

export const QuickSessionModal: React.FC<QuickSessionModalProps> = ({
  isOpen,
  onClose,
  patients,
  onSaveSession,
}) => {
  const [selectedPatientId, setSelectedPatientId] = useState(patients[0]?.id || '');
  const [date, setDate] = useState('2026-11-02');
  const [time, setTime] = useState('16:30');
  const [vasBefore, setVasBefore] = useState(6);
  const [vasAfter, setVasAfter] = useState(3);
  const [selectedModalities, setSelectedModalities] = useState<TherapyModality[]>(['Manuel Terapi']);
  const [clinicalObs, setClinicalObs] = useState('');
  const [homeEx, setHomeEx] = useState('');
  const [nextDate, setNextDate] = useState('2026-11-05 16:30');

  if (!isOpen) return null;

  const currentPatient = patients.find(p => p.id === selectedPatientId) || patients[0];
  const nextSessionNumber = currentPatient ? (currentPatient.packageCompletedSessions + 1) : 1;

  const toggleModality = (mod: TherapyModality) => {
    if (selectedModalities.includes(mod)) {
      setSelectedModalities(selectedModalities.filter(m => m !== mod));
    } else {
      setSelectedModalities([...selectedModalities, mod]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPatient) return;

    onSaveSession({
      patientId: currentPatient.id,
      patientName: currentPatient.fullName,
      sessionNumber: nextSessionNumber,
      date,
      time,
      therapist: CLINIC_INFO.therapistName,
      vasScoreBefore: Number(vasBefore),
      vasScoreAfter: Number(vasAfter),
      modalities: selectedModalities,
      clinicalObservations: clinicalObs || 'Manuel terapi ve mobilizasyon başarıyla uygulandı.',
      homeExercisesPrescribed: homeEx || 'Günde 2 kez germe ve postür egzersizleri.',
      nextSessionDate: nextDate,
      isPaid: true,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Hızlı Seans Kaydı Girişi</h2>
              <p className="text-xs text-slate-500">Tamamlanan terapi seansını hastanın dosyasına işleyin</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Patient Selector */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Hasta Seçin</label>
            <select
              value={selectedPatientId}
              onChange={(e) => {
                setSelectedPatientId(e.target.value);
                const p = patients.find(item => item.id === e.target.value);
                if (p) {
                  setVasBefore(p.currentVAS);
                  setVasAfter(Math.max(1, p.currentVAS - 2));
                }
              }}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-teal-600 font-medium"
            >
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} — {p.condition} (Kalan: {p.packageTotalSessions - p.packageCompletedSessions} Seans)
                </option>
              ))}
            </select>
            {currentPatient && (
              <div className="mt-1 text-[11px] text-teal-800 font-mono flex items-center justify-between">
                <span>Dosya: #{currentPatient.fileNumber}</span>
                <span>Bu işlem ile Seans #{nextSessionNumber} / {currentPatient.packageTotalSessions} tamamlanacak</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Tarih</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-teal-600"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">Saat</label>
              <input
                type="time"
                required
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-teal-600"
              />
            </div>
          </div>

          {/* VAS Pain Scale */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Seans Öncesi Ağrı</span>
                <span className="text-rose-600 font-mono font-bold">{vasBefore} VAS</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={vasBefore}
                onChange={(e) => setVasBefore(Number(e.target.value))}
                className="w-full accent-rose-600 cursor-pointer"
              />
            </div>
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Seans Sonrası Ağrı</span>
                <span className="text-emerald-600 font-mono font-bold">{vasAfter} VAS</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={vasAfter}
                onChange={(e) => setVasAfter(Number(e.target.value))}
                className="w-full accent-emerald-600 cursor-pointer"
              />
            </div>
          </div>

          {/* Modalities */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1.5">Uygulanan Modaliteler:</label>
            <div className="grid grid-cols-2 gap-1.5">
              {ALL_MODALITIES.slice(0, 6).map((mod) => {
                const isSelected = selectedModalities.includes(mod);
                return (
                  <button
                    key={mod}
                    type="button"
                    onClick={() => toggleModality(mod)}
                    className={`text-left text-xs p-1.5 px-2 rounded-lg border transition-all truncate ${
                      isSelected ? 'bg-teal-50 border-teal-600 text-teal-900 font-semibold' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '} {mod}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">Klinik Not & Manipülasyon</label>
            <input
              type="text"
              value={clinicalObs}
              onChange={(e) => setClinicalObs(e.target.value)}
              placeholder="Örn: Manuel traksiyon ve faset eklem mobilizasyonu yapıldı."
              className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-teal-600"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-[#82A381] hover:bg-[#6D8E6C] rounded-lg shadow-2xs"
            >
              Seansı Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Patient, PatientCondition } from '../types/clinic';
import { Language, TRANSLATIONS } from '../utils/translations';
import { 
  Search, 
  Plus, 
  FileText, 
  MessageSquare, 
  ChevronRight, 
  TrendingDown,
  User,
  Filter
} from 'lucide-react';

interface PatientsListProps {
  patients: Patient[];
  onSelectPatient: (patient: Patient) => void;
  onOpenNewPatientModal: () => void;
  onOpenWhatsApp: (patient: Patient) => void;
  currentLanguage: Language;
}

export const PatientsList: React.FC<PatientsListProps> = ({
  patients,
  onSelectPatient,
  onOpenNewPatientModal,
  onOpenWhatsApp,
  currentLanguage,
}) => {
  const t = TRANSLATIONS[currentLanguage];
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCondition, setSelectedCondition] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch = 
      patient.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      patient.phone.includes(searchQuery) ||
      patient.fileNumber.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCondition = selectedCondition === 'all' || patient.condition === selectedCondition;
    const matchesStatus = selectedStatus === 'all' || patient.status === selectedStatus;

    return matchesSearch && matchesCondition && matchesStatus;
  });

  const CONDITIONS_LIST = [
    'Bel Fıtığı (Lomber Disk)',
    'Boyun Fıtığı (Servikal)',
    'Diş Sıkma / Çene Terapisi (TMJ)',
    'Donuk Omuz / Rotator Cuff',
    'Diz Menisküs / Ön Çapraz Bağ',
    'Skolyoz / Postür Bozukluğu',
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            {t.navPatients}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Fzt. Hamit Gümüş Kliniği kayıtlı tüm hastalar ve tedavi seans takipleri ({filteredPatients.length} / {patients.length})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenNewPatientModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#82A381] hover:bg-[#6D8E6C] rounded-lg transition-colors shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>{t.quickNewPatient}</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPatientPlaceholder}
              className="w-full text-xs pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-[#82A381] bg-slate-50/50"
            />
          </div>

          {/* Condition Dropdown */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="text-xs p-2.5 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-[#82A381] w-full md:w-56"
            >
              <option value="all">Tüm Klinik Branşlar / Şikayetler</option>
              {CONDITIONS_LIST.map((cond) => (
                <option key={cond} value={cond}>{cond}</option>
              ))}
            </select>

            {/* Status Segmented */}
            <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200 text-xs shrink-0">
              <button
                onClick={() => setSelectedStatus('all')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${selectedStatus === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'}`}
              >
                Tümü
              </button>
              <button
                onClick={() => setSelectedStatus('active')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${selectedStatus === 'active' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600'}`}
              >
                Aktif
              </button>
              <button
                onClick={() => setSelectedStatus('completed')}
                className={`px-2.5 py-1 rounded font-medium transition-colors ${selectedStatus === 'completed' ? 'bg-white text-blue-800 shadow-2xs' : 'text-slate-600'}`}
              >
                Tamamlandı
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Patient Table / List */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Hasta & Dosya No</th>
                <th className="py-3 px-4">Tanı / Şikayet</th>
                <th className="py-3 px-4">Seans İlerlemesi</th>
                <th className="py-3 px-4">Ağrı Skoru (VAS)</th>
                <th className="py-3 px-4">Durum</th>
                <th className="py-3 px-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Arama kriterine uygun hasta bulunamadı.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => {
                  const percent = Math.round((patient.packageCompletedSessions / patient.packageTotalSessions) * 100);
                  const vasDrop = patient.initialVAS - patient.currentVAS;

                  return (
                    <tr 
                      key={patient.id} 
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => onSelectPatient(patient)}
                    >
                      {/* Name & File No */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#E6EFE6] text-[#314230] font-bold flex items-center justify-center text-xs border border-[#CFDFC0]/60">
                            {patient.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 group-hover:text-[#587457] transition-colors">
                              {patient.fullName}
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono mt-0.5">
                              <span>#{patient.fileNumber}</span>
                              <span>·</span>
                              <span>{patient.phone}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Condition */}
                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-800 block">{patient.condition}</span>
                        <span className="text-[11px] text-slate-400 block">{patient.occupation}</span>
                      </td>

                      {/* Package Progress */}
                      <td className="py-3.5 px-4">
                        <div className="w-36">
                          <div className="flex items-center justify-between text-[11px] mb-1">
                            <span className="font-mono font-bold text-slate-700">
                              {patient.packageCompletedSessions} / {patient.packageTotalSessions} Seans
                            </span>
                            <span className="text-[#587457] font-semibold font-mono">%{percent}</span>
                          </div>
                          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-[#82A381] h-full rounded-full transition-all"
                              style={{ width: `${percent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* VAS Pain Scale */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className={`font-mono font-bold text-sm ${
                            patient.currentVAS <= 3 ? 'text-emerald-700' :
                            patient.currentVAS <= 6 ? 'text-amber-700' : 'text-rose-600'
                          }`}>
                            {patient.currentVAS} / 10
                          </span>
                          {vasDrop > 0 && (
                            <span className="text-[10px] text-[#445B43] bg-[#E6EFE6] px-1.5 py-0.5 rounded flex items-center gap-0.5 font-medium border border-[#CFDFC0]">
                              <TrendingDown className="w-3 h-3" />
                              -{vasDrop} puan
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                          patient.status === 'active' ? 'bg-[#E6EFE6] text-[#314230] border border-[#CFDFC0]' :
                          patient.status === 'completed' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {patient.status === 'active' ? 'Aktif Seans' :
                           patient.status === 'completed' ? 'Tamamlandı' : 'Beklemede'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => onOpenWhatsApp(patient)}
                            className="p-1.5 text-slate-400 hover:text-[#445B43] hover:bg-[#F4F7F4] rounded-lg transition-colors"
                            title="WhatsApp Hatırlatması Gönder"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onSelectPatient(patient)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#445B43] hover:bg-[#F4F7F4] rounded-lg transition-colors"
                          >
                            <span>Dosya</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

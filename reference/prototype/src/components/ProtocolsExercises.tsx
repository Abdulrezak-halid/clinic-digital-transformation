import React, { useState } from 'react';
import { CLINICAL_PROTOCOLS, CLINIC_INFO } from '../data/initialData';
import { ClinicalProtocol } from '../types/clinic';
import { 
  BookOpen, 
  Activity, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Printer, 
  Share2,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

export const ProtocolsExercises: React.FC = () => {
  const [selectedProtocol, setSelectedProtocol] = useState<ClinicalProtocol>(CLINICAL_PROTOCOLS[0]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Klinik Manuel Terapi & Egzersiz Protokolleri</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Fzt. Hamit Gümüş özel uzmanlık alanları (Bel/Boyun Fıtığı, Çene/TMJ, Donuk Omuz) tedavi metodolojileri
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-2xs self-start sm:self-auto"
        >
          <Printer className="w-3.5 h-3.5 text-slate-500" />
          <span>Protokolü Yazdır / PDF</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Protocol Selector List */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-1">
            Klinik Protokol Kütüphanesi
          </span>
          {CLINICAL_PROTOCOLS.map((proto) => {
            const isSelected = selectedProtocol.id === proto.id;
            return (
              <button
                key={proto.id}
                onClick={() => setSelectedProtocol(proto)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-teal-700 border-teal-800 text-white shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 text-slate-800'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className={`text-[11px] font-semibold uppercase tracking-wider block mb-1 ${isSelected ? 'text-teal-200' : 'text-teal-700'}`}>
                    {proto.condition}
                  </span>
                  <ChevronRight className={`w-4 h-4 shrink-0 ${isSelected ? 'text-white' : 'text-slate-300'}`} />
                </div>
                <h3 className="text-xs font-bold leading-snug">{proto.title}</h3>
                <div className={`mt-2 text-[11px] flex items-center gap-2 ${isSelected ? 'text-teal-100' : 'text-slate-500'}`}>
                  <span>{proto.treatmentPhases.length} Tedavi Fazı</span>
                  <span>·</span>
                  <span>{proto.primaryTechniques.length} Modalite</span>
                </div>
              </button>
            );
          })}

          <div className="bg-slate-100/80 rounded-xl p-4 border border-slate-200 text-xs text-slate-600 mt-4">
            <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
              <ShieldCheck className="w-4 h-4 text-teal-700" />
              <span>Klinik Standart</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Her seans öncesinde hastanın VAS ağrı skoru ve hareket açıklığı kaydedilir. Bu protokoller Fzt. Hamit Gümüş'ün 10+ yıllık manuel terapi tecrübesine dayanmaktadır.
            </p>
          </div>
        </div>

        {/* Protocol Detail View */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
            <div>
              <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                {selectedProtocol.condition}
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-2">{selectedProtocol.title}</h2>
              <p className="text-xs text-slate-600 leading-relaxed mt-2 bg-slate-50 p-3.5 rounded-lg border border-slate-100">
                {selectedProtocol.description}
              </p>
            </div>

            {/* Techniques */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide mb-2">
                Uygulanan Birincil Teknikler & Modaliteler:
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {selectedProtocol.primaryTechniques.map((tech) => (
                  <span
                    key={tech}
                    className="text-xs font-semibold px-2.5 py-1 rounded-md bg-teal-50 text-teal-800 border border-teal-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>

            {/* Treatment Phases */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Klinik Tedavi Fazları & İlerleme Aşamaları:
              </h4>
              <div className="space-y-3">
                {selectedProtocol.treatmentPhases.map((phase, idx) => (
                  <div key={idx} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-1">
                      <h5 className="text-xs font-bold text-slate-900">{phase.phase}</h5>
                      <span className="text-[11px] font-mono font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                        {phase.durationWeeks}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mb-2.5">{phase.focus}</p>

                    <div>
                      <span className="text-[11px] font-semibold text-slate-700 block mb-1">Önerilen Egzersizler:</span>
                      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {phase.exercises.map((ex, exIdx) => (
                          <li key={exIdx} className="text-xs text-slate-700 flex items-center gap-1.5 bg-white p-2 rounded border border-slate-100">
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            <span>{ex}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Contraindications */}
            <div className="border border-amber-200 bg-amber-50/50 rounded-xl p-4">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900 mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Kontrendikasyonlar & Dikkat Edilmesi Gereken Durumlar:</span>
              </div>
              <ul className="list-disc list-inside text-xs text-amber-800 space-y-0.5 pl-1">
                {selectedProtocol.contraindications.map((contra, cIdx) => (
                  <li key={cIdx}>{contra}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

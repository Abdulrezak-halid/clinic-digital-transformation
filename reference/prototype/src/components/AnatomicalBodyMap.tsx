import React from 'react';
import { BodyZone } from '../types/clinic';

interface AnatomicalBodyMapProps {
  selectedZones: BodyZone[];
  onToggleZone?: (zone: BodyZone) => void;
  interactive?: boolean;
  vasScore?: number;
}

const ZONE_LABELS: Record<BodyZone, { tr: string; ar: string; en: string }> = {
  head_jaw: { tr: 'Çene & Şakak (TMJ)', ar: 'الفك والصدغ (TMJ)', en: 'Jaw & TMJ' },
  cervical_neck: { tr: 'Boyun (Servikal)', ar: 'الرقبة والفقرات العنقية', en: 'Neck (Cervical)' },
  thoracic_back: { tr: 'Sırt & Kürek Kemiği (Torakal)', ar: 'أعلى الظهر ولوح الكتف', en: 'Upper Back & Thoracic' },
  lumbar_lower_back: { tr: 'Bel (Lomber Disk)', ar: 'أسفل الظهر (الفقرات القطنية)', en: 'Lower Back (Lumbar)' },
  left_shoulder: { tr: 'Sol Omuz', ar: 'الكتف الأيسر', en: 'Left Shoulder' },
  right_shoulder: { tr: 'Sağ Omuz', ar: 'الكتف الأيمن', en: 'Right Shoulder' },
  left_elbow: { tr: 'Sol Dirsek', ar: 'المرفق الأيسر', en: 'Left Elbow' },
  right_elbow: { tr: 'Sağ Dirsek', ar: 'المرفق الأيمن', en: 'Right Elbow' },
  left_wrist: { tr: 'Sol El / Bilek', ar: 'اليد والرسغ الأيسر', en: 'Left Wrist / Hand' },
  right_wrist: { tr: 'Sağ El / Bilek', ar: 'اليد والرسغ الأيمن', en: 'Right Wrist / Hand' },
  pelvis_hip: { tr: 'Kalça & Pelvis', ar: 'الورك والحوض', en: 'Pelvis & Hip' },
  left_knee: { tr: 'Sol Diz (Menisküs)', ar: 'الركبة اليسرى', en: 'Left Knee' },
  right_knee: { tr: 'Sağ Diz (Menisküs)', ar: 'الركبة اليمنى', en: 'Right Knee' },
  left_ankle: { tr: 'Sol Ayak Bileği', ar: 'الكاحل الأيسر', en: 'Left Ankle' },
  right_ankle: { tr: 'Sağ Ayak Bileği', ar: 'الكاحل الأيمن', en: 'Right Ankle' },
};

export const AnatomicalBodyMap: React.FC<AnatomicalBodyMapProps> = ({
  selectedZones,
  onToggleZone,
  interactive = false,
  vasScore = 5,
}) => {
  const getZoneFill = (zone: BodyZone) => {
    const isSelected = selectedZones.includes(zone);
    if (!isSelected) return 'fill-slate-100 hover:fill-teal-100 stroke-slate-300';
    if (vasScore >= 7) return 'fill-rose-500 stroke-rose-600 shadow-sm';
    if (vasScore >= 4) return 'fill-amber-500 stroke-amber-600 shadow-sm';
    return 'fill-teal-500 stroke-teal-600 shadow-sm';
  };

  const getLabelColor = (zone: BodyZone) => {
    return selectedZones.includes(zone) ? 'text-teal-700 font-semibold' : 'text-slate-500';
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div>
          <h4 className="text-sm font-semibold text-slate-900">Anatomik Ağrı ve Lezyon Haritası</h4>
          <p className="text-xs text-slate-500">
            {interactive ? 'Ağrılı vücut bölgelerine tıklayarak işaretleyin veya kaldırın' : 'Muayenede tespit edilen aktif ağrı ve spazm odakları'}
          </p>
        </div>
        {vasScore > 0 && (
          <div className="text-right">
            <span className="text-xs text-slate-500 block">Şiddet (VAS)</span>
            <span className={`text-sm font-bold tabular-nums ${vasScore >= 7 ? 'text-rose-600' : vasScore >= 4 ? 'text-amber-600' : 'text-teal-600'}`}>
              {vasScore} / 10
            </span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        {/* Silhouette Visualization */}
        <div className="flex justify-center items-center gap-6 py-2 bg-slate-50/60 rounded-lg border border-slate-100 p-4">
          {/* Front View */}
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-medium text-slate-400 mb-2 tracking-wide uppercase">Ön Görünüm</span>
            <svg viewBox="0 0 160 300" className="w-36 h-64 overflow-visible select-none drop-shadow-xs">
              {/* Head & Jaw */}
              <g 
                onClick={() => interactive && onToggleZone && onToggleZone('head_jaw')}
                className={interactive ? 'cursor-pointer transition-colors' : ''}
              >
                <circle cx="80" cy="30" r="18" className={getZoneFill('head_jaw')} strokeWidth="1.5" />
                <path d="M 72 38 Q 80 44 88 38" fill="none" stroke="currentColor" className="text-slate-400" strokeWidth="1.5" />
              </g>

              {/* Neck */}
              <g 
                onClick={() => interactive && onToggleZone && onToggleZone('cervical_neck')}
                className={interactive ? 'cursor-pointer transition-colors' : ''}
              >
                <rect x="73" y="48" width="14" height="12" rx="3" className={getZoneFill('cervical_neck')} strokeWidth="1.5" />
              </g>

              {/* Shoulders */}
              <g 
                onClick={() => interactive && onToggleZone && onToggleZone('right_shoulder')}
                className={interactive ? 'cursor-pointer transition-colors' : ''}
              >
                <circle cx="50" cy="68" r="11" className={getZoneFill('right_shoulder')} strokeWidth="1.5" />
              </g>
              <g 
                onClick={() => interactive && onToggleZone && onToggleZone('left_shoulder')}
                className={interactive ? 'cursor-pointer transition-colors' : ''}
              >
                <circle cx="110" cy="68" r="11" className={getZoneFill('left_shoulder')} strokeWidth="1.5" />
              </g>

              {/* Chest / Thoracic */}
              <rect x="62" y="62" width="36" height="34" rx="6" className="fill-slate-100 stroke-slate-200" strokeWidth="1.5" />

              {/* Lumbar / Abdomen */}
              <g 
                onClick={() => interactive && onToggleZone && onToggleZone('lumbar_lower_back')}
                className={interactive ? 'cursor-pointer transition-colors' : ''}
              >
                <rect x="65" y="98" width="30" height="26" rx="4" className={getZoneFill('lumbar_lower_back')} strokeWidth="1.5" />
              </g>

              {/* Arms & Elbows */}
              <rect x="42" y="80" width="10" height="32" rx="3" className="fill-slate-100 stroke-slate-200" strokeWidth="1.5" />
              <rect x="108" y="80" width="10" height="32" rx="3" className="fill-slate-100 stroke-slate-200" strokeWidth="1.5" />
              
              <g onClick={() => interactive && onToggleZone && onToggleZone('right_elbow')} className={interactive ? 'cursor-pointer' : ''}>
                <circle cx="47" cy="114" r="7" className={getZoneFill('right_elbow')} strokeWidth="1.5" />
              </g>
              <g onClick={() => interactive && onToggleZone && onToggleZone('left_elbow')} className={interactive ? 'cursor-pointer' : ''}>
                <circle cx="113" cy="114" r="7" className={getZoneFill('left_elbow')} strokeWidth="1.5" />
              </g>

              {/* Wrists */}
              <g onClick={() => interactive && onToggleZone && onToggleZone('right_wrist')} className={interactive ? 'cursor-pointer' : ''}>
                <circle cx="44" cy="148" r="6" className={getZoneFill('right_wrist')} strokeWidth="1.5" />
              </g>
              <g onClick={() => interactive && onToggleZone && onToggleZone('left_wrist')} className={interactive ? 'cursor-pointer' : ''}>
                <circle cx="116" cy="148" r="6" className={getZoneFill('left_wrist')} strokeWidth="1.5" />
              </g>

              {/* Pelvis */}
              <g onClick={() => interactive && onToggleZone && onToggleZone('pelvis_hip')} className={interactive ? 'cursor-pointer' : ''}>
                <path d="M 60 126 L 100 126 L 94 150 L 66 150 Z" className={getZoneFill('pelvis_hip')} strokeWidth="1.5" />
              </g>

              {/* Thighs */}
              <rect x="63" y="152" width="14" height="48" rx="4" className="fill-slate-100 stroke-slate-200" strokeWidth="1.5" />
              <rect x="83" y="152" width="14" height="48" rx="4" className="fill-slate-100 stroke-slate-200" strokeWidth="1.5" />

              {/* Knees */}
              <g onClick={() => interactive && onToggleZone && onToggleZone('right_knee')} className={interactive ? 'cursor-pointer' : ''}>
                <circle cx="70" cy="204" r="9" className={getZoneFill('right_knee')} strokeWidth="1.5" />
              </g>
              <g onClick={() => interactive && onToggleZone && onToggleZone('left_knee')} className={interactive ? 'cursor-pointer' : ''}>
                <circle cx="90" cy="204" r="9" className={getZoneFill('left_knee')} strokeWidth="1.5" />
              </g>

              {/* Calves & Ankles */}
              <rect x="65" y="215" width="11" height="45" rx="3" className="fill-slate-100 stroke-slate-200" strokeWidth="1.5" />
              <rect x="84" y="215" width="11" height="45" rx="3" className="fill-slate-100 stroke-slate-200" strokeWidth="1.5" />

              <g onClick={() => interactive && onToggleZone && onToggleZone('right_ankle')} className={interactive ? 'cursor-pointer' : ''}>
                <circle cx="70" cy="265" r="6" className={getZoneFill('right_ankle')} strokeWidth="1.5" />
              </g>
              <g onClick={() => interactive && onToggleZone && onToggleZone('left_ankle')} className={interactive ? 'cursor-pointer' : ''}>
                <circle cx="90" cy="265" r="6" className={getZoneFill('left_ankle')} strokeWidth="1.5" />
              </g>
            </svg>
          </div>

          {/* Back View */}
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-medium text-slate-400 mb-2 tracking-wide uppercase">Arka Görünüm</span>
            <svg viewBox="0 0 160 300" className="w-36 h-64 overflow-visible select-none drop-shadow-xs">
              {/* Back Head */}
              <circle cx="80" cy="30" r="18" className="fill-slate-100 stroke-slate-200" strokeWidth="1.5" />
              
              {/* Cervical Spine */}
              <g onClick={() => interactive && onToggleZone && onToggleZone('cervical_neck')} className={interactive ? 'cursor-pointer' : ''}>
                <rect x="74" y="48" width="12" height="14" rx="2" className={getZoneFill('cervical_neck')} strokeWidth="1.5" />
              </g>

              {/* Upper Back / Scapula / Thoracic Spine */}
              <g onClick={() => interactive && onToggleZone && onToggleZone('thoracic_back')} className={interactive ? 'cursor-pointer' : ''}>
                <rect x="63" y="64" width="34" height="34" rx="5" className={getZoneFill('thoracic_back')} strokeWidth="1.5" />
                {/* Spine midline */}
                <line x1="80" y1="64" x2="80" y2="98" stroke="currentColor" className="text-slate-400" strokeWidth="2" strokeDasharray="3 2" />
              </g>

              {/* Shoulders Back */}
              <g onClick={() => interactive && onToggleZone && onToggleZone('left_shoulder')} className={interactive ? 'cursor-pointer' : ''}>
                <circle cx="50" cy="68" r="11" className={getZoneFill('left_shoulder')} strokeWidth="1.5" />
              </g>
              <g onClick={() => interactive && onToggleZone && onToggleZone('right_shoulder')} className={interactive ? 'cursor-pointer' : ''}>
                <circle cx="110" cy="68" r="11" className={getZoneFill('right_shoulder')} strokeWidth="1.5" />
              </g>

              {/* Lumbar Spine / Lower Back */}
              <g onClick={() => interactive && onToggleZone && onToggleZone('lumbar_lower_back')} className={interactive ? 'cursor-pointer' : ''}>
                <rect x="66" y="100" width="28" height="26" rx="4" className={getZoneFill('lumbar_lower_back')} strokeWidth="1.5" />
                <line x1="80" y1="100" x2="80" y2="126" stroke="currentColor" className="text-slate-400" strokeWidth="2" strokeDasharray="3 2" />
              </g>

              {/* Gluteal / Sacrum / Pelvis */}
              <g onClick={() => interactive && onToggleZone && onToggleZone('pelvis_hip')} className={interactive ? 'cursor-pointer' : ''}>
                <path d="M 60 128 L 100 128 C 104 148 94 154 80 154 C 66 154 56 148 60 128 Z" className={getZoneFill('pelvis_hip')} strokeWidth="1.5" />
              </g>

              {/* Legs Back */}
              <rect x="63" y="156" width="14" height="48" rx="4" className="fill-slate-100 stroke-slate-200" strokeWidth="1.5" />
              <rect x="83" y="156" width="14" height="48" rx="4" className="fill-slate-100 stroke-slate-200" strokeWidth="1.5" />

              {/* Popliteal / Knees back */}
              <g onClick={() => interactive && onToggleZone && onToggleZone('left_knee')} className={interactive ? 'cursor-pointer' : ''}>
                <circle cx="70" cy="206" r="8" className={getZoneFill('left_knee')} strokeWidth="1.5" />
              </g>
              <g onClick={() => interactive && onToggleZone && onToggleZone('right_knee')} className={interactive ? 'cursor-pointer' : ''}>
                <circle cx="90" cy="206" r="8" className={getZoneFill('right_knee')} strokeWidth="1.5" />
              </g>

              {/* Calves */}
              <rect x="65" y="216" width="11" height="44" rx="3" className="fill-slate-100 stroke-slate-200" strokeWidth="1.5" />
              <rect x="84" y="216" width="11" height="44" rx="3" className="fill-slate-100 stroke-slate-200" strokeWidth="1.5" />
            </svg>
          </div>
        </div>

        {/* Selected Zone Badges and Description */}
        <div className="space-y-3">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">
            Tespit Edilen / Seçili Odaklar ({selectedZones.length}):
          </div>

          {selectedZones.length === 0 ? (
            <p className="text-sm text-slate-400 italic">Henüz odak bölge seçilmedi. Diyagram üzerindeki noktalara tıklayabilirsiniz.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {selectedZones.map((zone) => (
                <div 
                  key={zone}
                  className="flex items-center gap-1.5 py-1 px-2.5 bg-slate-100 text-slate-800 rounded-md text-xs font-medium border border-slate-200"
                >
                  <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                  <span>{ZONE_LABELS[zone]?.tr || zone}</span>
                  {interactive && onToggleZone && (
                    <button 
                      onClick={() => onToggleZone(zone)}
                      className="ml-1 text-slate-400 hover:text-rose-600 transition-colors"
                      title="Kaldır"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Quick zone shortcuts if interactive */}
          {interactive && onToggleZone && (
            <div className="pt-3 border-t border-slate-100">
              <span className="text-[11px] text-slate-400 font-medium block mb-1.5">Sık Karşılaşılan Şikayetler (Hızlı Seçim):</span>
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  onClick={() => onToggleZone('lumbar_lower_back')}
                  className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 transition-colors"
                >
                  + Bel (L4-L5)
                </button>
                <button
                  type="button"
                  onClick={() => onToggleZone('cervical_neck')}
                  className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 transition-colors"
                >
                  + Boyun (C5-C6)
                </button>
                <button
                  type="button"
                  onClick={() => onToggleZone('head_jaw')}
                  className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 transition-colors"
                >
                  + Çene (Bruksizm)
                </button>
                <button
                  type="button"
                  onClick={() => onToggleZone('right_knee')}
                  className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 transition-colors"
                >
                  + Diz (Menisküs)
                </button>
                <button
                  type="button"
                  onClick={() => onToggleZone('right_shoulder')}
                  className="text-xs px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-700 transition-colors"
                >
                  + Donuk Omuz
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

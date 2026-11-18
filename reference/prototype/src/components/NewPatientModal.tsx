import React, { useState } from 'react';
import { Patient, PatientCondition, BodyZone } from '../types/clinic';
import { AnatomicalBodyMap } from './AnatomicalBodyMap';
import { X, UserPlus, Sparkles } from 'lucide-react';

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPatient: (patient: Omit<Patient, 'id' | 'fileNumber'>) => void;
}

export const NewPatientModal: React.FC<NewPatientModalProps> = ({
  isOpen,
  onClose,
  onAddPatient,
}) => {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('05');
  const [age, setAge] = useState<number | ''>(35);
  const [gender, setGender] = useState<'Erkek' | 'Kadın'>('Erkek');
  const [occupation, setOccupation] = useState('');
  const [condition, setCondition] = useState<PatientCondition>('Bel Fıtığı (Lomber Disk)');
  const [packageTotalSessions, setPackageTotalSessions] = useState(10);
  const [packagePrice, setPackagePrice] = useState(15000);
  const [paidAmount, setPaidAmount] = useState(15000);
  const [initialVAS, setInitialVAS] = useState(8);
  const [selectedZones, setSelectedZones] = useState<BodyZone[]>(['lumbar_lower_back']);
  const [medicalHistory, setMedicalHistory] = useState('');
  const [clinicalNotes, setClinicalNotes] = useState('');

  if (!isOpen) return null;

  const handleToggleZone = (zone: BodyZone) => {
    if (selectedZones.includes(zone)) {
      setSelectedZones(selectedZones.filter(z => z !== zone));
    } else {
      setSelectedZones([...selectedZones, zone]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    onAddPatient({
      fullName,
      phone,
      age: Number(age) || 30,
      gender,
      occupation: occupation || 'Serbest Meslek',
      condition,
      packageTotalSessions: Number(packageTotalSessions),
      packageCompletedSessions: 0,
      packagePrice: Number(packagePrice),
      paidAmount: Number(paidAmount),
      status: 'active',
      initialVAS: Number(initialVAS),
      currentVAS: Number(initialVAS),
      targetVAS: 1,
      affectedBodyZones: selectedZones,
      medicalHistory: medicalHistory || 'Manuel terapi öncesi klinik değerlendirme yapıldı.',
      clinicalNotes: clinicalNotes || 'Tedavi protokolü başlatıldı.',
      registrationDate: new Date().toISOString().split('T')[0],
      preferredLanguage: 'tr',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-teal-700 text-white flex items-center justify-center">
              <UserPlus className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Yeni Hasta Kaydı & Klinik Kabul</h2>
              <p className="text-xs text-slate-500">Fzt. Hamit Gümüş Mersin Kliniği Anamnez ve Seans Paketi Girişi</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto flex-1 space-y-6">
          
          {/* Personal Info */}
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3">1. Hasta Kimlik & İletişim Bilgileri</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-semibold text-slate-700 block mb-1">Ad Soyad</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Örn: Selin Aydın"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-teal-600"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Telefon</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0532 123 45 67"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-teal-600 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Yaş</label>
                <input
                  type="number"
                  required
                  min="5"
                  max="100"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-teal-600 font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Cinsiyet</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-teal-600"
                >
                  <option value="Erkek">Erkek</option>
                  <option value="Kadın">Kadın</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Meslek</label>
                <input
                  type="text"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="Örn: Mühendis, Öğretmen"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-teal-600"
                />
              </div>
            </div>
          </div>

          {/* Condition & Package */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3">2. Klinik Tanı & Seans Paketi</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Klinik Tanı / Şikayet</label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value as PatientCondition)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-teal-600"
                >
                  <option value="Bel Fıtığı (Lomber Disk)">Bel Fıtığı (Lomber Disk)</option>
                  <option value="Boyun Fıtığı (Servikal)">Boyun Fıtığı (Servikal)</option>
                  <option value="Diş Sıkma / Çene Terapisi (TMJ)">Diş Sıkma / Çene Terapisi (TMJ)</option>
                  <option value="Donuk Omuz / Rotator Cuff">Donuk Omuz / Rotator Cuff</option>
                  <option value="Diz Menisküs / Ön Çapraz Bağ">Diz Menisküs / Ön Çapraz Bağ</option>
                  <option value="Skolyoz / Postür Bozukluğu">Skolyoz / Postür Bozukluğu</option>
                  <option value="Tenisçi / Golfçü Dirseği">Tenisçi / Golfçü Dirseği</option>
                  <option value="Fibromiyalji / Kronik Ağrı">Fibromiyalji / Kronik Ağrı</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Paket Seansı</label>
                  <select
                    value={packageTotalSessions}
                    onChange={(e) => {
                      const total = Number(e.target.value);
                      setPackageTotalSessions(total);
                      setPackagePrice(total === 6 ? 9000 : total === 8 ? 12000 : total === 10 ? 15000 : 18000);
                      setPaidAmount(total === 6 ? 9000 : total === 8 ? 12000 : total === 10 ? 15000 : 18000);
                    }}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-teal-600 font-mono"
                  >
                    <option value="6">6 Seans Paketi</option>
                    <option value="8">8 Seans Paketi</option>
                    <option value="10">10 Seans Paketi</option>
                    <option value="12">12 Seans Paketi</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Paket Fiyatı (TL)</label>
                  <input
                    type="number"
                    value={packagePrice}
                    onChange={(e) => setPackagePrice(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-teal-600 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Anatomical Pain Assessment */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3">3. Ağrı Şiddeti & Anatomik Bölgeler</h3>
            
            <div className="mb-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">İlk Muayene Ağrı Skoru (VAS 1-10)</label>
                <span className="text-sm font-bold font-mono text-rose-600">{initialVAS} / 10 VAS</span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={initialVAS}
                onChange={(e) => setInitialVAS(Number(e.target.value))}
                className="w-full accent-rose-600 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                <span>1 (Hafif Sızı)</span>
                <span>5 (Orta Şiddet)</span>
                <span>10 (Kritik / Dayanılmaz)</span>
              </div>
            </div>

            <AnatomicalBodyMap
              selectedZones={selectedZones}
              onToggleZone={handleToggleZone}
              interactive={true}
              vasScore={initialVAS}
            />
          </div>

          {/* Medical Notes */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide mb-3">4. Anamnez & Notlar</h3>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Tıbbi Geçmiş & Şikayet Detayları</label>
                <textarea
                  rows={2}
                  value={medicalHistory}
                  onChange={(e) => setMedicalHistory(e.target.value)}
                  placeholder="Örn: 3 aydır devam eden bel ve sol bacak ağrısı, MR'da L4-L5 disk taşması tespit edilmiş."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-teal-600"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Fzt. Hamit Gümüş İlk Muayene Gözlemleri</label>
                <textarea
                  rows={2}
                  value={clinicalNotes}
                  onChange={(e) => setClinicalNotes(e.target.value)}
                  placeholder="Örn: Manuel lomber dekompresyon ve McKenzie protokolü planlandı."
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-teal-600"
                />
              </div>
            </div>
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-[#82A381] hover:bg-[#6D8E6C] rounded-lg transition-colors shadow-2xs"
            >
              Hastayı Kaydet & Dosya Oluştur
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

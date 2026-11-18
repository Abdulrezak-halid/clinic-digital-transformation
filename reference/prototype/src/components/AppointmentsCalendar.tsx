import React, { useState } from 'react';
import { Appointment, PatientCondition } from '../types/clinic';
import { CLINIC_INFO } from '../data/initialData';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Plus, 
  MessageSquare, 
  MapPin, 
  CheckCircle2, 
  User, 
  AlertCircle,
  XCircle,
  Building
} from 'lucide-react';

interface AppointmentsCalendarProps {
  appointments: Appointment[];
  onAddAppointment: (appointment: Omit<Appointment, 'id'>) => void;
  onUpdateStatus: (id: string, status: Appointment['status']) => void;
  onOpenWhatsAppForApt: (apt: Appointment) => void;
}

export const AppointmentsCalendar: React.FC<AppointmentsCalendarProps> = ({
  appointments,
  onAddAppointment,
  onUpdateStatus,
  onOpenWhatsAppForApt,
}) => {
  const [selectedDate, setSelectedDate] = useState('2026-11-02');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New appointment form state
  const [patientName, setPatientName] = useState('');
  const [patientPhone, setPatientPhone] = useState('');
  const [condition, setCondition] = useState<PatientCondition>('Bel Fıtığı (Lomber Disk)');
  const [date, setDate] = useState('2026-11-02');
  const [time, setTime] = useState('11:00');
  const [roomOrBed, setRoomOrBed] = useState<Appointment['roomOrBed']>('Sedye 1 (Manuel Terapi)');
  const [sessionNumber, setSessionNumber] = useState(1);
  const [totalSessions, setTotalSessions] = useState(10);
  const [note, setNote] = useState('');

  const filteredAppointments = appointments.filter(a => a.date === selectedDate);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddAppointment({
      patientId: `p-${Date.now()}`,
      patientName,
      patientPhone,
      condition,
      date,
      time,
      roomOrBed,
      sessionNumber: Number(sessionNumber),
      totalSessions: Number(totalSessions),
      status: 'confirmed',
      note,
    });
    setIsAddModalOpen(false);
    // Reset form
    setPatientName('');
    setPatientPhone('');
    setNote('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Klinik Randevu & Seans Takvimi</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Fzt. Hamit Gümüş Limonluk / Hantaş Prestij kliniği günlük seans akışı ve sedye doluluk oranları
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="text-xs font-semibold px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-800 shadow-2xs"
          />
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#82A381] hover:bg-[#6D8E6C] rounded-lg transition-colors shadow-2xs"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni Randevu Oluştur</span>
          </button>
        </div>
      </div>

      {/* Date Shortcuts Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {['2026-11-01', '2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06'].map((d) => {
          const isSelected = selectedDate === d;
          const dateObj = new Date(d);
          const dayName = dateObj.toLocaleDateString('tr-TR', { weekday: 'short' });
          const dayNum = dateObj.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
          const count = appointments.filter(a => a.date === d).length;

          return (
            <button
              key={d}
              onClick={() => setSelectedDate(d)}
              className={`px-3 py-2 rounded-lg border text-left transition-all shrink-0 ${
                isSelected 
                  ? 'bg-[#82A381] border-[#6D8E6C] text-white font-semibold shadow-2xs' 
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <div className="text-[11px] opacity-80">{dayName}</div>
              <div className="text-xs font-bold font-mono">{dayNum} ({count})</div>
            </button>
          );
        })}
      </div>

      {/* Appointments Grid */}
      <div className="space-y-3">
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-slate-200 p-12 text-center">
            <CalendarIcon className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <h3 className="text-sm font-semibold text-slate-700">Bu tarihe kayıtlı randevu bulunmuyor</h3>
            <p className="text-xs text-slate-400 mt-1">Hastaya yeni bir manuel terapi veya egzersiz seansı planlayabilirsiniz.</p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 px-3 py-1.5 text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-colors"
            >
              + Bu Güne Randevu Ekle
            </button>
          </div>
        ) : (
          filteredAppointments.map((apt) => {
            const isCompleted = apt.status === 'completed';
            const isInProgress = apt.status === 'in_progress';

            return (
              <div
                key={apt.id}
                className={`bg-white rounded-xl border p-4 transition-all shadow-2xs ${
                  isInProgress ? 'border-teal-500 ring-1 ring-teal-500/20 bg-teal-50/20' :
                  isCompleted ? 'border-slate-200 opacity-80 bg-slate-50/40' : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  
                  {/* Left: Time and Patient info */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-14 text-center shrink-0">
                      <span className="text-sm font-bold font-mono text-slate-900 block leading-tight">{apt.time}</span>
                      <span className="text-[10px] text-slate-400 font-mono">50 dk</span>
                    </div>

                    <div className="h-10 w-px bg-slate-200 hidden sm:block"></div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-900">{apt.patientName}</h4>
                        <span className="text-xs font-mono text-slate-500 font-medium">{apt.patientPhone}</span>
                        <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          Seans {apt.sessionNumber}/{apt.totalSessions}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                        <span className="text-slate-800 font-medium">{apt.condition}</span>
                        <span>·</span>
                        <span className="flex items-center gap-1 text-teal-800">
                          <Building className="w-3.5 h-3.5 text-teal-600" />
                          {apt.roomOrBed}
                        </span>
                        {apt.note && (
                          <>
                            <span>·</span>
                            <span className="italic text-slate-500">{apt.note}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right: Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {/* Status dropdown */}
                    <select
                      value={apt.status}
                      onChange={(e) => onUpdateStatus(apt.id, e.target.value as Appointment['status'])}
                      className={`text-xs font-semibold py-1.5 px-2.5 rounded-lg border transition-colors ${
                        apt.status === 'completed' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' :
                        apt.status === 'in_progress' ? 'bg-teal-50 text-teal-800 border-teal-400 font-bold' :
                        apt.status === 'no_show' ? 'bg-rose-50 text-rose-800 border-rose-300' :
                        'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      <option value="confirmed">Randevu Onaylı</option>
                      <option value="in_progress">Seans Başladı</option>
                      <option value="completed">Tamamlandı</option>
                      <option value="no_show">Gelmedi (No-Show)</option>
                      <option value="cancelled">İptal Edildi</option>
                    </select>

                    {/* WhatsApp Quick Reminder */}
                    <button
                      onClick={() => onOpenWhatsAppForApt(apt)}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors border border-slate-200"
                      title="WhatsApp Hatırlatması Gönder"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Appointment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">Yeni Randevu Oluştur</h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Hasta Adı Soyadı</label>
                <input
                  type="text"
                  required
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  placeholder="Örn: Mehmet Özçelik"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-teal-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Telefon</label>
                  <input
                    type="tel"
                    required
                    value={patientPhone}
                    onChange={(e) => setPatientPhone(e.target.value)}
                    placeholder="0532 000 00 00"
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-teal-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Tanı / Şikayet</label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as PatientCondition)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-teal-600"
                  >
                    <option value="Bel Fıtığı (Lomber Disk)">Bel Fıtığı</option>
                    <option value="Boyun Fıtığı (Servikal)">Boyun Fıtığı</option>
                    <option value="Diş Sıkma / Çene Terapisi (TMJ)">Diş Sıkma / Çene</option>
                    <option value="Donuk Omuz / Rotator Cuff">Donuk Omuz</option>
                    <option value="Diz Menisküs / Ön Çapraz Bağ">Diz Menisküs</option>
                    <option value="Skolyoz / Postür Bozukluğu">Skolyoz / Postür</option>
                  </select>
                </div>
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

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Oda / Tedavi Yeri</label>
                <select
                  value={roomOrBed}
                  onChange={(e) => setRoomOrBed(e.target.value as Appointment['roomOrBed'])}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-teal-600"
                >
                  <option value="Sedye 1 (Manuel Terapi)">Sedye 1 (Manuel Terapi)</option>
                  <option value="Sedye 2 (Omurga & Traksiyon)">Sedye 2 (Omurga & Traksiyon)</option>
                  <option value="Özel VIP Terapi Odası">Özel VIP Terapi Odası</option>
                  <option value="Egzersiz Alanı">Egzersiz Alanı</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Seans No</label>
                  <input
                    type="number"
                    min="1"
                    value={sessionNumber}
                    onChange={(e) => setSessionNumber(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-teal-600"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">Toplam Paket Seansı</label>
                  <input
                    type="number"
                    min="1"
                    value={totalSessions}
                    onChange={(e) => setTotalSessions(Number(e.target.value))}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-teal-600"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Özel Not</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Örn: Manuel dekompresyon ve kuru iğne"
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-200 focus:outline-teal-600"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-lg shadow-xs"
                >
                  Randevuyu Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

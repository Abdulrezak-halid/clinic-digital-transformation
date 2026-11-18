import React, { useState } from 'react';
import { Patient, SessionRecord, Appointment, FinancialTransaction } from './types/clinic';
import { 
  INITIAL_PATIENTS, 
  INITIAL_SESSIONS, 
  INITIAL_APPOINTMENTS, 
  INITIAL_TRANSACTIONS, 
  CLINIC_INFO 
} from './data/initialData';
import { Language } from './utils/translations';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { PatientsList } from './components/PatientsList';
import { PatientDetailModal } from './components/PatientDetailModal';
import { AppointmentsCalendar } from './components/AppointmentsCalendar';
import { FinancialTracker } from './components/FinancialTracker';
import { ProtocolsExercises } from './components/ProtocolsExercises';
import { SystemPitchModal } from './components/SystemPitchModal';
import { WhatsAppModal } from './components/WhatsAppModal';
import { NewPatientModal } from './components/NewPatientModal';
import { QuickSessionModal } from './components/QuickSessionModal';
import { ClinicAboutModal } from './components/ClinicAboutModal';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { MapPin, Phone, Instagram, Globe } from 'lucide-react';

export default function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'patients' | 'appointments' | 'finance' | 'protocols' | 'pitch'>('dashboard');
  const [currentLanguage, setCurrentLanguage] = useState<Language>('tr');

  // Application Data State
  const [patients, setPatients] = useState<Patient[]>(INITIAL_PATIENTS);
  const [sessions, setSessions] = useState<SessionRecord[]>(INITIAL_SESSIONS);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>(INITIAL_TRANSACTIONS);

  // Modals State
  const [isClinicAboutOpen, setIsClinicAboutOpen] = useState(false);
  const [selectedPatientForDetail, setSelectedPatientForDetail] = useState<Patient | null>(null);
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [isQuickSessionModalOpen, setIsQuickSessionModalOpen] = useState(false);
  const [whatsAppData, setWhatsAppModalData] = useState<{
    isOpen: boolean;
    patientName: string;
    patientPhone: string;
    condition: string;
    remainingSessions: number;
    sessionDate?: string;
    sessionTime?: string;
  }>({
    isOpen: false,
    patientName: '',
    patientPhone: '',
    condition: '',
    remainingSessions: 0,
  });

  // Handler: Add New Patient
  const handleAddPatient = (newPatientData: Omit<Patient, 'id' | 'fileNumber'>) => {
    const nextNumber = 80 + patients.length + 1;
    const newPatient: Patient = {
      ...newPatientData,
      id: `p-${Date.now()}`,
      fileNumber: `HG-2026-${nextNumber.toString().padStart(3, '0')}`,
    };

    setPatients([newPatient, ...patients]);

    // Automatically record income transaction if paid amount > 0
    if (newPatient.paidAmount > 0) {
      const newTxn: FinancialTransaction = {
        id: `txn-${Date.now()}`,
        date: newPatient.registrationDate,
        type: 'income',
        category: `Paket Satışı (${newPatient.packageTotalSessions} Seans)` as any,
        amount: newPatient.paidAmount,
        paymentMethod: 'Kredi Kartı',
        patientId: newPatient.id,
        patientName: newPatient.fullName,
        description: `${newPatient.packageTotalSessions} Seans ${newPatient.condition} Paketi Peşin Ödeme`,
        receiptNumber: `MAK-${Date.now().toString().slice(-4)}`,
      };
      setTransactions([newTxn, ...transactions]);
    }
  };

  // Handler: Add Session
  const handleAddSession = (newSessionData: Omit<SessionRecord, 'id'>) => {
    const newSession: SessionRecord = {
      ...newSessionData,
      id: `s-${Date.now()}`,
    };

    setSessions([newSession, ...sessions]);

    // Update the corresponding patient progress
    setPatients(prevPatients =>
      prevPatients.map(p => {
        if (p.id === newSession.patientId) {
          const updatedCompleted = p.packageCompletedSessions + 1;
          const isCompleted = updatedCompleted >= p.packageTotalSessions;
          return {
            ...p,
            packageCompletedSessions: updatedCompleted,
            currentVAS: newSession.vasScoreAfter,
            lastSessionDate: newSession.date,
            status: isCompleted ? 'completed' : 'active',
          };
        }
        return p;
      })
    );

    // If detail modal is open for this patient, update selectedPatientForDetail
    if (selectedPatientForDetail && selectedPatientForDetail.id === newSession.patientId) {
      setSelectedPatientForDetail(prev => {
        if (!prev) return null;
        const updatedCompleted = prev.packageCompletedSessions + 1;
        return {
          ...prev,
          packageCompletedSessions: updatedCompleted,
          currentVAS: newSession.vasScoreAfter,
          lastSessionDate: newSession.date,
          status: updatedCompleted >= prev.packageTotalSessions ? 'completed' : 'active',
        };
      });
    }
  };

  // Handler: Add Appointment
  const handleAddAppointment = (newAptData: Omit<Appointment, 'id'>) => {
    const newApt: Appointment = {
      ...newAptData,
      id: `apt-${Date.now()}`,
    };
    setAppointments([newApt, ...appointments]);
  };

  // Handler: Update Appointment Status
  const handleUpdateAppointmentStatus = (id: string, status: Appointment['status']) => {
    setAppointments(prev =>
      prev.map(apt => (apt.id === id ? { ...apt, status } : apt))
    );
  };

  // Handler: Add Financial Transaction
  const handleAddTransaction = (newTxnData: Omit<FinancialTransaction, 'id'>) => {
    const newTxn: FinancialTransaction = {
      ...newTxnData,
      id: `txn-${Date.now()}`,
    };
    setTransactions([newTxn, ...transactions]);
  };

  // Handler: Delete Financial Transaction
  const handleDeleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  // Handler: Open WhatsApp Modal
  const handleOpenWhatsApp = (patient: Patient) => {
    const remaining = patient.packageTotalSessions - patient.packageCompletedSessions;
    setWhatsAppModalData({
      isOpen: true,
      patientName: patient.fullName,
      patientPhone: patient.phone,
      condition: patient.condition,
      remainingSessions: remaining,
      sessionDate: 'Yarın',
      sessionTime: '15:00',
    });
  };

  // Handler: Open WhatsApp Modal from Appointment
  const handleOpenWhatsAppForApt = (apt: Appointment) => {
    setWhatsAppModalData({
      isOpen: true,
      patientName: apt.patientName,
      patientPhone: apt.patientPhone,
      condition: apt.condition,
      remainingSessions: apt.totalSessions - apt.sessionNumber,
      sessionDate: apt.date,
      sessionTime: apt.time,
    });
  };

  const isRTL = currentLanguage === 'ar';

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 flex flex-col ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        onOpenQuickSession={() => setIsQuickSessionModalOpen(true)}
        onOpenClinicAbout={() => setIsClinicAboutOpen(true)}
        currentLanguage={currentLanguage}
        onChangeLanguage={setCurrentLanguage}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'dashboard' && (
          <Dashboard
            patients={patients}
            sessions={sessions}
            appointments={appointments}
            transactions={transactions}
            onSelectPatient={setSelectedPatientForDetail}
            onOpenNewPatientModal={() => setIsNewPatientModalOpen(true)}
            onOpenQuickSession={() => setIsQuickSessionModalOpen(true)}
            onOpenWhatsApp={handleOpenWhatsApp}
            onOpenClinicAbout={() => setIsClinicAboutOpen(true)}
            onNavigateToTab={setCurrentTab}
            currentLanguage={currentLanguage}
          />
        )}

        {currentTab === 'patients' && (
          <PatientsList
            patients={patients}
            onSelectPatient={setSelectedPatientForDetail}
            onOpenNewPatientModal={() => setIsNewPatientModalOpen(true)}
            onOpenWhatsApp={handleOpenWhatsApp}
            currentLanguage={currentLanguage}
          />
        )}

        {currentTab === 'appointments' && (
          <AppointmentsCalendar
            appointments={appointments}
            onAddAppointment={handleAddAppointment}
            onUpdateStatus={handleUpdateAppointmentStatus}
            onOpenWhatsAppForApt={handleOpenWhatsAppForApt}
          />
        )}

        {currentTab === 'finance' && (
          <FinancialTracker
            transactions={transactions}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {currentTab === 'protocols' && (
          <ProtocolsExercises />
        )}

        {currentTab === 'pitch' && (
          <SystemPitchModal onSwitchToLiveDemo={() => setCurrentTab('dashboard')} />
        )}
      </main>

      {/* Quiet Clinic Footer adhering to anti-slop rules (no decorative fake tickers) */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900">{CLINIC_INFO.name}</span>
            <span>·</span>
            <span>{CLINIC_INFO.unitTitle}</span>
            <span>·</span>
            <span className="text-slate-400">Yenişehir / Mersin</span>
          </div>

          <div className="flex items-center gap-4 text-slate-600">
            <a 
              href={`https://instagram.com/fizyoterapisthamitgumus`}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-teal-700 transition-colors flex items-center gap-1"
            >
              <Instagram className="w-3.5 h-3.5" />
              <span>@fizyoterapisthamitgumus</span>
            </a>
            <span>·</span>
            <a 
              href="https://mersinfiziktedavi.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-teal-700 transition-colors flex items-center gap-1"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>mersinfiziktedavi.com</span>
            </a>
          </div>
        </div>
      </footer>

      {/* Patient Detail Modal (Full Clinical Record, Pain Map, Session Log & Printable Card) */}
      <PatientDetailModal
        patient={selectedPatientForDetail}
        sessions={sessions}
        onClose={() => setSelectedPatientForDetail(null)}
        onAddSession={handleAddSession}
        onOpenWhatsApp={handleOpenWhatsApp}
      />

      {/* New Patient Registration Modal */}
      <NewPatientModal
        isOpen={isNewPatientModalOpen}
        onClose={() => setIsNewPatientModalOpen(false)}
        onAddPatient={handleAddPatient}
      />

      {/* Quick Session Entry Modal */}
      <QuickSessionModal
        isOpen={isQuickSessionModalOpen}
        onClose={() => setIsQuickSessionModalOpen(false)}
        patients={patients}
        onSaveSession={handleAddSession}
      />

      {/* WhatsApp Message Generator Modal */}
      <WhatsAppModal
        isOpen={whatsAppData.isOpen}
        onClose={() => setWhatsAppModalData(prev => ({ ...prev, isOpen: false }))}
        patientName={whatsAppData.patientName}
        patientPhone={whatsAppData.patientPhone}
        condition={whatsAppData.condition}
        remainingSessions={whatsAppData.remainingSessions}
        sessionDate={whatsAppData.sessionDate}
        sessionTime={whatsAppData.sessionTime}
      />

      {/* Clinic Profile, Bio & Maps Modal */}
      <ClinicAboutModal
        isOpen={isClinicAboutOpen}
        onClose={() => setIsClinicAboutOpen(false)}
      />

      {/* Persistent Floating WhatsApp Quick Contact Button */}
      <FloatingWhatsApp />
    </div>
  );
}

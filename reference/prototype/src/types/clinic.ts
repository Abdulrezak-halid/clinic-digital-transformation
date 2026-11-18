/**
 * Types for Fizyoterapist Hamit Gümüş Clinic Management System
 */

export type PatientCondition = 
  | 'Bel Fıtığı (Lomber Disk)'
  | 'Boyun Fıtığı (Servikal)'
  | 'Diş Sıkma / Çene Terapisi (TMJ)'
  | 'Donuk Omuz / Rotator Cuff'
  | 'Diz Menisküs / Ön Çapraz Bağ'
  | 'Skolyoz / Postür Bozukluğu'
  | 'Tenisçi / Golfçü Dirseği'
  | 'Fibromiyalji / Kronik Ağrı';

export type BodyZone = 
  | 'head_jaw' 
  | 'cervical_neck' 
  | 'thoracic_back' 
  | 'lumbar_lower_back' 
  | 'left_shoulder' 
  | 'right_shoulder' 
  | 'left_elbow' 
  | 'right_elbow' 
  | 'left_wrist' 
  | 'right_wrist' 
  | 'pelvis_hip' 
  | 'left_knee' 
  | 'right_knee' 
  | 'left_ankle' 
  | 'right_ankle';

export type TherapyModality = 
  | 'Manuel Terapi'
  | 'Kuru İğneleme (Dry Needling)'
  | 'Klinik Masaj & Miyofasiyal Gevşetme'
  | 'Çene & Masseter İntraoral Terapi'
  | 'Omurga Dekompresyonu / Traksiyon'
  | 'Terapötik Egzersiz'
  | 'Elektroterapi (TENS / EMS)'
  | 'Kupa Terapisi / Hacamat'
  | 'Kinezyolojik Bantlama';

export interface Patient {
  id: string;
  fileNumber: string; // e.g., HG-2026-104
  fullName: string;
  phone: string;
  age: number;
  gender: 'Erkek' | 'Kadın';
  occupation: string;
  condition: PatientCondition;
  packageTotalSessions: number;
  packageCompletedSessions: number;
  packagePrice: number;
  paidAmount: number;
  status: 'active' | 'completed' | 'paused';
  initialVAS: number; // 1-10 pain score
  currentVAS: number;
  targetVAS: number;
  affectedBodyZones: BodyZone[];
  medicalHistory: string;
  clinicalNotes: string;
  registrationDate: string;
  lastSessionDate?: string;
  preferredLanguage?: 'tr' | 'ar' | 'en';
}

export interface SessionRecord {
  id: string;
  patientId: string;
  patientName: string;
  sessionNumber: number;
  date: string;
  time: string;
  therapist: string; // "Fzt. Hamit Gümüş"
  vasScoreBefore: number;
  vasScoreAfter: number;
  modalities: TherapyModality[];
  clinicalObservations: string;
  homeExercisesPrescribed: string;
  nextSessionDate: string;
  isPaid: boolean;
  paymentAmount?: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  condition: PatientCondition;
  date: string;
  time: string;
  roomOrBed: 'Sedye 1 (Manuel Terapi)' | 'Sedye 2 (Omurga & Traksiyon)' | 'Özel VIP Terapi Odası' | 'Egzersiz Alanı';
  sessionNumber: number;
  totalSessions: number;
  status: 'confirmed' | 'in_progress' | 'completed' | 'no_show' | 'cancelled';
  note?: string;
}

export interface FinancialTransaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: 
    | 'Seans Ücreti'
    | 'Paket Satışı (12 Seans)'
    | 'Paket Satışı (10 Seans)'
    | 'Paket Satışı (8 Seans)'
    | 'Paket Satışı (6 Seans)'
    | 'Değerlendirme & Konsültasyon'
    | 'Kira (Hantaş Prestij)'
    | 'Tıbbi Sarf Malzeme (Bant, İğne, Örtü)'
    | 'Elektrik, Su & Aidat'
    | 'Personel & Asistan'
    | 'Cihaz Bakım & Donanım'
    | 'Pazarlama & Sosyal Medya';
  amount: number;
  paymentMethod: 'Nakit' | 'Kredi Kartı' | 'Havale/EFT';
  patientId?: string;
  patientName?: string;
  description: string;
  receiptNumber: string;
}

export interface ClinicalProtocol {
  id: string;
  title: string;
  condition: PatientCondition;
  description: string;
  primaryTechniques: TherapyModality[];
  treatmentPhases: {
    phase: string;
    focus: string;
    durationWeeks: string;
    exercises: string[];
  }[];
  contraindications: string[];
}

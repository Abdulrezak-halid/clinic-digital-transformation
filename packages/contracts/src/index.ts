import { z } from 'zod';
export const roles = ['ADMIN', 'THERAPIST', 'RECEPTIONIST'] as const;
export type Role = (typeof roles)[number];
export const uuid = z.uuid();
export const phone = z
  .string()
  .trim()
  .transform((v) => {
    const n = v.replace(/[\s()+-]/g, '');
    return n.startsWith('0')
      ? '+90' + n.slice(1)
      : n.startsWith('90')
        ? '+' + n
        : n.startsWith('+')
          ? n
          : '+90' + n;
  })
  .pipe(z.string().regex(/^\+[1-9]\d{9,14}$/, 'Geçerli telefon girin.'));
export const patientInput = z
  .object({
    fullName: z.string().trim().min(2).max(100),
    phone,
    administrativeNote: z.string().trim().max(300).default(''),
  })
  .strict();
export const appointmentInput = z
  .object({
    patientId: uuid,
    staffId: uuid,
    resourceId: uuid,
    startsAt: z.iso.datetime({ offset: true }),
    endsAt: z.iso.datetime({ offset: true }),
  })
  .strict()
  .refine((v) => new Date(v.endsAt) > new Date(v.startsAt), {
    message: 'Bitiş başlangıçtan sonra olmalı.',
  });
export const packageInput = z
  .object({
    patientId: uuid,
    label: z.string().trim().min(1).max(80),
    total: z.number().int().min(1).max(200),
  })
  .strict();
export const completeInput = z.object({ packageId: uuid }).strict();
export const reasonInput = z
  .object({ reason: z.string().trim().min(5).max(300) })
  .strict();
export const loginInput = z
  .object({
    email: z.email().transform((v) => v.toLowerCase()),
    password: z.string().min(1).max(200),
  })
  .strict();
export const verifyInput = z
  .object({ code: z.string().regex(/^\d{6}$/) })
  .strict();
export const staffInput = z
  .object({
    name: z.string().trim().min(2).max(100),
    startMinute: z.number().int().min(0).max(1439),
    endMinute: z.number().int().min(1).max(1440),
    weekdays: z.array(z.number().int().min(1).max(7)).min(1),
  })
  .strict()
  .refine((v) => v.endMinute > v.startMinute, {
    message: 'Çalışma aralığı geçersiz.',
  });
export const resourceInput = z
  .object({ name: z.string().trim().min(2).max(80) })
  .strict();
export const absenceInput = z
  .object({
    startsAt: z.iso.datetime({ offset: true }),
    endsAt: z.iso.datetime({ offset: true }),
  })
  .strict()
  .refine((v) => new Date(v.endsAt) > new Date(v.startsAt), {
    message: 'İzin aralığı geçersiz.',
  });
export const userInput = z
  .object({
    email: z.email().transform((v) => v.toLowerCase()),
    name: z.string().trim().min(2).max(100),
    role: z.enum(roles),
    staffId: uuid.optional(),
  })
  .strict();
export type PatientInput = z.infer<typeof patientInput>;
export type AppointmentInput = z.infer<typeof appointmentInput>;
export type PackageInput = z.infer<typeof packageInput>;
export type Viewer = {
  id: string;
  name: string;
  role: Role;
  staffId: string | null;
  csrf: string;
};
export type Patient = {
  id: string;
  fileNumber: number;
  fullName: string;
  phone: string;
  administrativeNote: string;
  archivedAt: string | null;
};
export type Staff = {
  id: string;
  name: string;
  startMinute: number;
  endMinute: number;
  weekdays: number[];
};
export type Resource = { id: string; name: string };
export type Appointment = {
  id: string;
  patientId: string;
  staffId: string;
  resourceId: string;
  startsAt: string;
  endsAt: string;
  status: string;
  version: number;
  patient: Patient;
  staff: Staff;
  resource: Resource;
};
export type Package = {
  id: string;
  patientId: string;
  label: string;
  total: number;
  remaining: number;
};
export type Session = {
  id: string;
  appointmentId: string;
  patientId: string;
  packageId: string;
  completedAt: string;
  reversedAt: string | null;
  appointment: Appointment;
};

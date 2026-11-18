import {
  Module,
  Inject,
  Body,
  ConflictException,
  Controller,
  ForbiddenException,
  Get,
  Injectable,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Prisma, AppointmentStatus } from '@prisma/client';
import { z } from 'zod';
import * as argon2 from 'argon2';
import {
  absenceInput,
  appointmentInput,
  completeInput,
  packageInput,
  patientInput,
  reasonInput,
  resourceInput,
  staffInput,
  userInput,
  uuid,
  Viewer,
} from '@clinic/contracts';
import { AuthGuard, AuthModule } from './auth';
import { Db } from './db';
import { AppRequest } from './http';
import { digest, token, encrypt, decrypt } from './security';
type Tx = Prisma.TransactionClient;
const include = { patient: true, staff: true, resource: true };
const busy: AppointmentStatus[] = ['scheduled', 'in_progress', 'completed'];
export function assertRole(v: Viewer, allowed: string[]) {
  if (!allowed.includes(v.role))
    throw new ForbiddenException('Bu işlem için yetkiniz yok.');
}
export function localParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
    weekday: 'short',
  }).formatToParts(date);
  const get = (k: string) => parts.find((p) => p.type === k)?.value || '';
  return {
    day: get('year') + '-' + get('month') + '-' + get('day'),
    minute: Number(get('hour')) * 60 + Number(get('minute')),
    weekday:
      ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(
        get('weekday'),
      ) + 1,
  };
}
@Injectable()
export class ClinicService {
  constructor(@Inject(Db) readonly db: Db) {}
  async mutate(
    req: AppRequest,
    action: string,
    target: string,
    fn: (tx: Tx) => Promise<unknown>,
  ) {
    const v = req.viewer!;
    const inputKey = z
      .string()
      .min(16)
      .max(100)
      .parse(req.headers['idempotency-key']);
    const key = v.id + ':' + inputKey;
    const fingerprint = digest(
      JSON.stringify([req.method, req.path, req.body]),
    );
    return this.db.$transaction(
      async (tx) => {
        // Serialize small-clinic writes, including availability changes and package consumption.
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(141115)`;
        const prior = await tx.idempotency.findUnique({ where: { key } });
        if (prior) {
          if (prior.fingerprint !== fingerprint)
            throw new ConflictException(
              'İstek anahtarı başka işlemde kullanıldı.',
            );
          return JSON.parse(
            decrypt((prior.response as { sealed: string }).sealed),
          ) as unknown;
        }
        const result = JSON.parse(
          JSON.stringify(await fn(tx)),
        ) as Prisma.InputJsonValue;
        await tx.auditLog.create({
          data: {
            actorId: v.id,
            action,
            targetId: target,
            requestId: req.requestId,
          },
        });
        await tx.idempotency.create({
          data: {
            key,
            fingerprint,
            response: { sealed: encrypt(JSON.stringify(result)) },
          },
        });
        return result;
      },
      { timeout: 15000 },
    );
  }
  own(v: Viewer, staffId: string) {
    if (v.role === 'THERAPIST' && v.staffId !== staffId)
      throw new ForbiddenException(
        'Yalnız kendi takviminizde işlem yapabilirsiniz.',
      );
  }
  async available(
    tx: Tx,
    data: z.infer<typeof appointmentInput>,
    exclude?: string,
  ) {
    const startsAt = new Date(data.startsAt),
      endsAt = new Date(data.endsAt),
      a = localParts(startsAt),
      b = localParts(endsAt);
    const staff = await tx.staff.findUniqueOrThrow({
      where: { id: data.staffId },
    });
    const patient = await tx.patient.findUniqueOrThrow({
      where: { id: data.patientId },
    });
    if (patient.archivedAt)
      throw new ConflictException('Arşivlenmiş hastaya randevu verilemez.');
    if (
      a.day !== b.day ||
      !staff.weekdays.includes(a.weekday) ||
      a.minute < staff.startMinute ||
      b.minute > staff.endMinute ||
      endsAt <= startsAt
    )
      throw new ConflictException('Çalışma saatleri dışında.');
    const absence = await tx.absence.count({
      where: {
        staffId: data.staffId,
        startsAt: { lt: endsAt },
        endsAt: { gt: startsAt },
      },
    });
    const overlap = await tx.appointment.count({
      where: {
        id: exclude ? { not: exclude } : undefined,
        status: { in: busy },
        startsAt: { lt: endsAt },
        endsAt: { gt: startsAt },
        OR: [
          { staffId: data.staffId },
          { patientId: data.patientId },
          { resourceId: data.resourceId },
        ],
      },
    });
    if (absence || overlap)
      throw new ConflictException(
        'Personel, hasta veya oda/sedye müsait değil.',
      );
  }
}
@Controller()
@UseGuards(AuthGuard)
export class ClinicController {
  constructor(@Inject(ClinicService) private service: ClinicService) {}
  private get db() {
    return this.service.db;
  }
  @Get('patients') patients(
    @Query('q') q = '',
    @Query('archived') archived = 'false',
  ) {
    return this.db.patient.findMany({
      where: {
        archivedAt: archived === 'true' ? { not: null } : null,
        OR: [
          { fullName: { contains: q.slice(0, 100), mode: 'insensitive' } },
          { phone: { contains: q.slice(0, 100) } },
        ],
      },
      orderBy: { fileNumber: 'desc' },
      take: 200,
    });
  }
  @Post('patients') addPatient(@Body() body: unknown, @Req() r: AppRequest) {
    const v = patientInput.parse(body);
    return this.service.mutate(r, 'patient.create', 'new', async (tx) => {
      const duplicates = await tx.patient.count({
        where: {
          phone: v.phone,
          fullName: { equals: v.fullName, mode: 'insensitive' },
          archivedAt: null,
        },
      });
      if (duplicates)
        throw new ConflictException(
          'Aynı ad ve telefonla kayıt var. Mevcut kaydı kontrol edin.',
        );
      const samePhone = await tx.patient.count({
        where: { phone: v.phone, archivedAt: null },
      });
      const patient = await tx.patient.create({ data: v });
      return {
        ...patient,
        warning: samePhone
          ? 'Aynı telefon başka hastada da kullanılıyor.'
          : null,
      };
    });
  }
  @Patch('patients/:id') editPatient(
    @Param('id') id: string,
    @Body() body: unknown,
    @Req() r: AppRequest,
  ) {
    uuid.parse(id);
    assertRole(r.viewer!, ['ADMIN', 'RECEPTIONIST']);
    const v = patientInput.parse(body);
    return this.service.mutate(r, 'patient.update', id, (tx) =>
      tx.patient.update({ where: { id }, data: v }),
    );
  }
  @Post('patients/:id/archive') archive(
    @Param('id') id: string,
    @Req() r: AppRequest,
  ) {
    uuid.parse(id);
    assertRole(r.viewer!, ['ADMIN', 'RECEPTIONIST']);
    return this.service.mutate(r, 'patient.archive', id, async (tx) => {
      if (
        await tx.appointment.count({
          where: {
            patientId: id,
            status: { in: ['scheduled', 'in_progress'] },
          },
        })
      )
        throw new ConflictException('Önce aktif randevuları kapatın.');
      return tx.patient.update({
        where: { id },
        data: { archivedAt: new Date() },
      });
    });
  }
  @Get('staff') staff() {
    return this.db.staff.findMany({
      orderBy: { name: 'asc' },
      include: { absences: true },
    });
  }
  @Get('resources') resources() {
    return this.db.resource.findMany({ orderBy: { name: 'asc' } });
  }
  @Post('staff') addStaff(@Body() body: unknown, @Req() r: AppRequest) {
    assertRole(r.viewer!, ['ADMIN']);
    const v = staffInput.parse(body);
    return this.service.mutate(r, 'staff.create', 'new', (tx) =>
      tx.staff.create({ data: v }),
    );
  }
  @Patch('staff/:id') editStaff(
    @Param('id') id: string,
    @Body() body: unknown,
    @Req() r: AppRequest,
  ) {
    assertRole(r.viewer!, ['ADMIN']);
    uuid.parse(id);
    const v = staffInput.parse(body);
    return this.service.mutate(r, 'staff.update', id, async (tx) => {
      const appointments = await tx.appointment.findMany({
        where: { staffId: id, status: { in: ['scheduled', 'in_progress'] } },
      });
      for (const apt of appointments) {
        const a = localParts(apt.startsAt),
          b = localParts(apt.endsAt);
        if (
          !v.weekdays.includes(a.weekday) ||
          a.minute < v.startMinute ||
          b.minute > v.endMinute
        )
          throw new ConflictException(
            'Yeni saatler mevcut randevularla çakışıyor.',
          );
      }
      return tx.staff.update({ where: { id }, data: v });
    });
  }
  @Post('staff/:id/absences') absence(
    @Param('id') id: string,
    @Body() body: unknown,
    @Req() r: AppRequest,
  ) {
    assertRole(r.viewer!, ['ADMIN']);
    uuid.parse(id);
    const v = absenceInput.parse(body);
    return this.service.mutate(r, 'staff.absence', id, async (tx) => {
      const startsAt = new Date(v.startsAt),
        endsAt = new Date(v.endsAt);
      if (
        await tx.appointment.count({
          where: {
            staffId: id,
            status: { in: ['scheduled', 'in_progress'] },
            startsAt: { lt: endsAt },
            endsAt: { gt: startsAt },
          },
        })
      )
        throw new ConflictException('İzin aralığında aktif randevu var.');
      return tx.absence.create({ data: { staffId: id, startsAt, endsAt } });
    });
  }
  @Post('resources') addResource(@Body() body: unknown, @Req() r: AppRequest) {
    assertRole(r.viewer!, ['ADMIN']);
    const v = resourceInput.parse(body);
    return this.service.mutate(r, 'resource.create', 'new', (tx) =>
      tx.resource.create({ data: v }),
    );
  }
  @Get('appointments') appointments(
    @Query('from') from: string,
    @Query('to') to: string,
    @Req() r: AppRequest,
  ) {
    const range = z
      .object({
        from: z.iso.datetime({ offset: true }),
        to: z.iso.datetime({ offset: true }),
      })
      .refine(
        (v) =>
          new Date(v.to) > new Date(v.from) &&
          Number(new Date(v.to)) - Number(new Date(v.from)) <= 32 * 86400000,
        { message: 'En fazla 32 günlük aralık seçin.' },
      )
      .parse({ from, to });
    return this.db.appointment.findMany({
      where: {
        startsAt: { gte: new Date(range.from), lt: new Date(range.to) },
        staffId:
          r.viewer!.role === 'THERAPIST'
            ? r.viewer!.staffId || '00000000-0000-0000-0000-000000000000'
            : undefined,
      },
      include,
      orderBy: { startsAt: 'asc' },
    });
  }
  @Post('appointments') addAppointment(
    @Body() body: unknown,
    @Req() r: AppRequest,
  ) {
    const v = appointmentInput.parse(body);
    this.service.own(r.viewer!, v.staffId);
    return this.service.mutate(r, 'appointment.create', 'new', async (tx) => {
      await this.service.available(tx, v);
      return tx.appointment.create({
        data: {
          ...v,
          startsAt: new Date(v.startsAt),
          endsAt: new Date(v.endsAt),
        },
        include,
      });
    });
  }
  @Patch('appointments/:id') move(
    @Param('id') id: string,
    @Body() body: unknown,
    @Req() r: AppRequest,
  ) {
    uuid.parse(id);
    const schema = z
      .object({
        appointment: appointmentInput,
        version: z.number().int().min(0),
      })
      .strict();
    const v = schema.parse(body);
    return this.service.mutate(r, 'appointment.reschedule', id, async (tx) => {
      const a = await tx.appointment.findUniqueOrThrow({ where: { id } });
      this.service.own(r.viewer!, a.staffId);
      this.service.own(r.viewer!, v.appointment.staffId);
      if (
        a.version !== v.version ||
        a.status !== 'scheduled' ||
        a.patientId !== v.appointment.patientId
      )
        throw new ConflictException('Randevu değişti veya taşınamaz.');
      await this.service.available(tx, v.appointment, id);
      return tx.appointment.update({
        where: { id },
        data: {
          ...v.appointment,
          startsAt: new Date(v.appointment.startsAt),
          endsAt: new Date(v.appointment.endsAt),
          version: { increment: 1 },
        },
        include,
      });
    });
  }
  @Post('appointments/:id/status') status(
    @Param('id') id: string,
    @Body() body: unknown,
    @Req() r: AppRequest,
  ) {
    uuid.parse(id);
    const v = z
      .object({
        status: z.enum(['in_progress', 'cancelled', 'no_show']),
        version: z.number().int().min(0),
      })
      .strict()
      .parse(body);
    return this.service.mutate(r, 'appointment.' + v.status, id, async (tx) => {
      const a = await tx.appointment.findUniqueOrThrow({ where: { id } });
      this.service.own(r.viewer!, a.staffId);
      if (
        a.version !== v.version ||
        !['scheduled', 'in_progress'].includes(a.status) ||
        a.status === v.status
      )
        throw new ConflictException('Geçersiz durum geçişi.');
      if (v.status === 'in_progress')
        assertRole(r.viewer!, ['ADMIN', 'THERAPIST']);
      return tx.appointment.update({
        where: { id },
        data: { status: v.status, version: { increment: 1 } },
      });
    });
  }
  @Get('packages') async packages(@Query('patientId') patientId: string) {
    uuid.parse(patientId);
    const rows = await this.db.sessionPackage.findMany({
      where: { patientId },
      include: { ledger: true },
    });
    return rows.map(({ ledger, ...p }) => ({
      ...p,
      remaining: p.total + ledger.reduce((n, x) => n + x.delta, 0),
    }));
  }
  @Post('packages') addPackage(@Body() body: unknown, @Req() r: AppRequest) {
    assertRole(r.viewer!, ['ADMIN']);
    const v = packageInput.parse(body);
    return this.service.mutate(r, 'package.create', v.patientId, async (tx) => {
      const p = await tx.patient.findUniqueOrThrow({
        where: { id: v.patientId },
      });
      if (p.archivedAt) throw new ConflictException('Hasta arşivde.');
      return tx.sessionPackage.create({ data: v });
    });
  }
  @Get('sessions') sessions(
    @Query('patientId') patientId: string,
    @Req() r: AppRequest,
  ) {
    uuid.parse(patientId);
    return this.db.session.findMany({
      where: {
        patientId,
        appointment:
          r.viewer!.role === 'THERAPIST'
            ? {
                staffId:
                  r.viewer!.staffId || '00000000-0000-0000-0000-000000000000',
              }
            : undefined,
      },
      include: { appointment: { include } },
      orderBy: { completedAt: 'desc' },
    });
  }
  @Post('appointments/:id/complete') complete(
    @Param('id') id: string,
    @Body() body: unknown,
    @Req() r: AppRequest,
  ) {
    uuid.parse(id);
    assertRole(r.viewer!, ['ADMIN', 'THERAPIST']);
    const v = completeInput.parse(body);
    return this.service.mutate(r, 'session.complete', id, async (tx) => {
      const a = await tx.appointment.findUniqueOrThrow({ where: { id } });
      this.service.own(r.viewer!, a.staffId);
      if (!['scheduled', 'in_progress'].includes(a.status))
        throw new ConflictException('Bu randevu tamamlanamaz.');
      const pkg = await tx.sessionPackage.findUniqueOrThrow({
        where: { id: v.packageId },
        include: { ledger: true },
      });
      if (
        pkg.patientId !== a.patientId ||
        pkg.total + pkg.ledger.reduce((n, x) => n + x.delta, 0) <= 0
      )
        throw new ConflictException('Geçerli paket bakiyesi yok.');
      const s = await tx.session.create({
        data: {
          appointmentId: id,
          patientId: a.patientId,
          packageId: pkg.id,
          completedBy: r.viewer!.id,
        },
      });
      await tx.packageLedger.create({
        data: {
          packageId: pkg.id,
          sessionId: s.id,
          delta: -1,
          reason: 'Seans tamamlandı',
          actorId: r.viewer!.id,
        },
      });
      await tx.appointment.update({
        where: { id },
        data: { status: 'completed', version: { increment: 1 } },
      });
      return s;
    });
  }
  @Post('sessions/:id/reverse') reverse(
    @Param('id') id: string,
    @Body() body: unknown,
    @Req() r: AppRequest,
  ) {
    uuid.parse(id);
    assertRole(r.viewer!, ['ADMIN']);
    const v = reasonInput.parse(body);
    return this.service.mutate(r, 'session.reverse', id, async (tx) => {
      const s = await tx.session.findUniqueOrThrow({ where: { id } });
      if (s.reversedAt) throw new ConflictException('Seans zaten geri alındı.');
      await tx.packageLedger.create({
        data: {
          packageId: s.packageId,
          sessionId: id,
          delta: 1,
          reason: v.reason,
          actorId: r.viewer!.id,
        },
      });
      await tx.appointment.update({
        where: { id: s.appointmentId },
        data: { status: 'cancelled', version: { increment: 1 } },
      });
      return tx.session.update({
        where: { id },
        data: { reversedAt: new Date() },
      });
    });
  }
  @Get('users') users(@Req() r: AppRequest) {
    assertRole(r.viewer!, ['ADMIN']);
    return this.db.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        staffId: true,
      },
      orderBy: { name: 'asc' },
    });
  }
  @Post('users') async invite(@Body() body: unknown, @Req() r: AppRequest) {
    assertRole(r.viewer!, ['ADMIN']);
    const v = userInput.parse(body);
    if (v.role === 'THERAPIST' && !v.staffId)
      throw new ConflictException('Fizyoterapist için personel seçin.');
    const raw = token(),
      passwordHash = await argon2.hash(token());
    return this.service.mutate(r, 'user.invite', 'new', async (tx) => {
      const u = await tx.user.create({
        data: { ...v, passwordHash, active: false },
      });
      await tx.invite.create({
        data: {
          tokenHash: digest(raw),
          userId: u.id,
          expiresAt: new Date(Date.now() + 24 * 3600000),
        },
      });
      return { id: u.id, inviteToken: raw };
    });
  }
  @Post('users/:id/disable') disable(
    @Param('id') id: string,
    @Req() r: AppRequest,
  ) {
    assertRole(r.viewer!, ['ADMIN']);
    uuid.parse(id);
    if (id === r.viewer!.id)
      throw new ForbiddenException('Kendi hesabınızı kapatamazsınız.');
    return this.service.mutate(r, 'user.disable', id, async (tx) => {
      await tx.loginSession.deleteMany({ where: { userId: id } });
      await tx.invite.deleteMany({ where: { userId: id } });
      return tx.user.update({
        where: { id },
        data: { active: false },
        select: { id: true, active: true },
      });
    });
  }
  @Get('audit') audit(@Req() r: AppRequest) {
    assertRole(r.viewer!, ['ADMIN']);
    return this.db.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}

@Module({
  imports: [AuthModule],
  controllers: [ClinicController],
  providers: [ClinicService],
})
export class ClinicModule {}

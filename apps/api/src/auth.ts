import {
  Module,
  Inject,
  Body,
  CanActivate,
  Controller,
  ExecutionContext,
  ForbiddenException,
  Get,
  Injectable,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Response } from 'express';
import * as argon2 from 'argon2';
import * as OTPAuth from 'otpauth';
import { z } from 'zod';
import { loginInput, verifyInput } from '@clinic/contracts';
import { Db } from './db';
import { AppRequest } from './http';
import { decrypt, digest, encrypt, token, localReviewEmail } from './security';
const cookie = 'clinic_session';
export const totp = (secret: string) =>
  new OTPAuth.TOTP({
    issuer: 'Hamit Gümüş Klinik',
    label: 'Klinik',
    algorithm: 'SHA1',
    digits: 6,
    period: 30,
    secret: OTPAuth.Secret.fromBase32(secret),
  });
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(@Inject(Db) private db: Db) {}
  async canActivate(ctx: ExecutionContext) {
    const req = ctx.switchToHttp().getRequest<AppRequest>();
    const raw = req.cookies?.[cookie];
    if (typeof raw !== 'string')
      throw new UnauthorizedException('Oturum açın.');
    const s = await this.db.loginSession.findUnique({
      where: { id: digest(raw) },
      include: { user: true },
    });
    if (!s || !s.verified || s.expiresAt < new Date() || !s.user.active)
      throw new UnauthorizedException('Oturum süresi doldu.');
    if (
      !['GET', 'HEAD'].includes(req.method) &&
      req.headers['x-csrf-token'] !== s.csrf
    )
      throw new ForbiddenException('Güvenlik doğrulaması başarısız.');
    req.viewer = {
      id: s.user.id,
      name: s.user.name,
      role: s.user.role,
      staffId: s.user.staffId,
      csrf: s.csrf,
    };
    req.sessionId = s.id;
    if (req.method === 'GET' && !req.path.includes('/auth/'))
      await this.db.auditLog.create({
        data: {
          actorId: s.userId,
          action: 'access.read',
          targetId: req.path,
          requestId: req.requestId,
        },
      });
    return true;
  }
}
@Controller('auth')
export class AuthController {
  constructor(
    @Inject(Db) private db: Db,
    @Inject(AuthGuard) private guard: AuthGuard,
  ) {}
  @Post('login')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async login(
    @Body() body: unknown,
    @Req() req: AppRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const v = loginInput.parse(body),
      u = await this.db.user.findUnique({ where: { email: v.email } });
    const valid = u
      ? await argon2.verify(u.passwordHash, v.password)
      : await argon2.hash(v.password).then(() => false);
    if (!u || !u.active || !valid)
      throw new UnauthorizedException('E-posta veya parola hatalı.');
    if (localReviewEmail() === u.email) {
      const raw = token(),
        csrf = token();
      await this.db.loginSession.create({
        data: {
          id: digest(raw),
          userId: u.id,
          csrf,
          verified: true,
          expiresAt: new Date(Date.now() + 8 * 3600000),
        },
      });
      res.cookie(cookie, raw, {
        httpOnly: true,
        sameSite: 'strict',
        path: '/',
        maxAge: 8 * 3600000,
      });
      await this.db.auditLog.create({
        data: {
          actorId: u.id,
          action: 'auth.local_review_login',
          targetId: u.id,
          requestId: req.requestId,
        },
      });
      return { authenticated: true, csrf, secret: null, enrollmentUri: null };
    }
    const raw = token(),
      csrf = token(),
      secret = u.mfaSecret ? null : new OTPAuth.Secret({ size: 20 }).base32;
    await this.db.loginSession.create({
      data: {
        id: digest(raw),
        userId: u.id,
        csrf,
        enrollmentSecret: secret ? encrypt(secret) : null,
        expiresAt: new Date(Date.now() + 5 * 60000),
      },
    });
    res.cookie(cookie, raw, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 5 * 60000,
    });
    await this.db.auditLog.create({
      data: {
        actorId: u.id,
        action: 'auth.password_verified',
        targetId: u.id,
        requestId: req.requestId,
      },
    });
    return {
      csrf,
      enrollmentUri: secret ? totp(secret).toString() : null,
      secret,
    };
  }
  @Post('verify')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async verify(
    @Body() body: unknown,
    @Req() req: AppRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const v = verifyInput.parse(body),
      raw = req.cookies?.[cookie];
    if (typeof raw !== 'string') throw new UnauthorizedException();
    const id = digest(raw),
      s = await this.db.loginSession.findUnique({
        where: { id },
        include: { user: true },
      });
    if (
      !s ||
      s.verified ||
      s.expiresAt < new Date() ||
      !s.user.active ||
      req.headers['x-csrf-token'] !== s.csrf
    )
      throw new UnauthorizedException('Giriş adımını tekrarlayın.');
    const encrypted = s.user.mfaSecret || s.enrollmentSecret;
    if (!encrypted) throw new UnauthorizedException();
    const delta = totp(decrypt(encrypted)).validate({
      token: v.code,
      window: 1,
    });
    if (delta === null) throw new UnauthorizedException('Kod geçersiz.');
    const step = BigInt(Math.floor(Date.now() / 30000) + delta),
      newRaw = token(),
      newCsrf = token();
    await this.db.$transaction(async (tx) => {
      const updated = await tx.user.updateMany({
        where: {
          id: s.userId,
          active: true,
          OR: [{ lastTotpStep: null }, { lastTotpStep: { lt: step } }],
        },
        data: { mfaSecret: encrypted, lastTotpStep: step },
      });
      if (updated.count !== 1)
        throw new UnauthorizedException('Yeni bir kod bekleyin.');
      await tx.loginSession.delete({ where: { id } });
      await tx.loginSession.create({
        data: {
          id: digest(newRaw),
          userId: s.userId,
          csrf: newCsrf,
          verified: true,
          expiresAt: new Date(Date.now() + 8 * 3600000),
        },
      });
      await tx.auditLog.create({
        data: {
          actorId: s.userId,
          action: 'auth.login',
          targetId: s.userId,
          requestId: req.requestId,
        },
      });
    });
    res.cookie(cookie, newRaw, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 8 * 3600000,
    });
    return { ok: true };
  }
  @Get('session') async session(@Req() req: AppRequest) {
    await this.guard.canActivate({
      switchToHttp: () => ({ getRequest: () => req }),
    } as ExecutionContext);
    return req.viewer;
  }
  @Post('logout') async logout(
    @Req() req: AppRequest,
    @Res({ passthrough: true }) res: Response,
  ) {
    const raw = req.cookies?.[cookie];
    if (typeof raw === 'string') {
      const s = await this.db.loginSession.findUnique({
        where: { id: digest(raw) },
      });
      if (s && req.headers['x-csrf-token'] !== s.csrf)
        throw new ForbiddenException();
      await this.db.loginSession.deleteMany({ where: { id: digest(raw) } });
    }
    res.clearCookie(cookie, { path: '/' });
    return { ok: true };
  }
  @Post('accept-invite')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  async accept(@Body() body: unknown) {
    const v = z
      .object({
        token: z.string().length(64),
        password: z.string().min(14).max(200),
      })
      .strict()
      .parse(body);
    const hash = await argon2.hash(v.password);
    await this.db.$transaction(async (tx) => {
      const inv = await tx.invite.findUnique({
        where: { tokenHash: digest(v.token) },
      });
      if (!inv || inv.expiresAt < new Date())
        throw new UnauthorizedException('Davet geçersiz.');
      await tx.invite.delete({ where: { tokenHash: inv.tokenHash } });
      await tx.user.update({
        where: { id: inv.userId },
        data: { passwordHash: hash, active: true },
      });
      await tx.auditLog.create({
        data: {
          actorId: inv.userId,
          action: 'auth.invite_accepted',
          targetId: inv.userId,
          requestId: token(),
        },
      });
    });
    return { ok: true };
  }
}

@Module({
  controllers: [AuthController],
  providers: [AuthGuard],
  exports: [AuthGuard],
})
export class AuthModule {}

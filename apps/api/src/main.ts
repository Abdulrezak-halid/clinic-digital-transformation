import 'reflect-metadata';
import { config } from 'dotenv';
import { resolve } from 'node:path';
config({ path: resolve(__dirname, '../../../.env') });
import {
  Inject,
  Module,
  Controller,
  Get,
  ServiceUnavailableException,
} from '@nestjs/common';
import { NestFactory, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { randomUUID } from 'node:crypto';
import { Request, Response, NextFunction, json } from 'express';
import { Db, DatabaseModule } from './db';
import { AuthModule } from './auth';
import { ClinicModule } from './clinic';
import { ErrorFilter } from './http';
import { validateConfig } from './security';
@Controller('health')
class HealthController {
  constructor(@Inject(Db) private db: Db) {}
  @Get() async health() {
    try {
      await this.db.$queryRaw`SELECT 1`;
      return { ok: true };
    } catch {
      throw new ServiceUnavailableException();
    }
  }
}
@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    ClinicModule,
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 120 }]),
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
export async function createApp() {
  validateConfig();
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn'],
    bodyParser: false,
  });
  app.enableShutdownHooks();
  app.setGlobalPrefix('api/v1');
  app.use(helmet());
  app.use(json({ limit: '32kb' }));
  app.use(cookieParser());
  app.use(
    (
      req: Request & { requestId?: string },
      res: Response,
      next: NextFunction,
    ) => {
      req.requestId = randomUUID();
      res.setHeader('X-Request-Id', req.requestId);
      res.setHeader('Cache-Control', 'no-store');
      if (
        !['GET', 'HEAD', 'OPTIONS'].includes(req.method) &&
        req.headers.origin !== process.env.APP_ORIGIN
      ) {
        res.status(403).json({
          message: 'İstek kaynağı geçersiz.',
          requestId: req.requestId,
        });
        return;
      }
      next();
    },
  );
  app.useGlobalFilters(new ErrorFilter());
  return app;
}
if (require.main === module)
  void createApp().then((app) =>
    app.listen(
      Number(process.env.PORT || 3001),
      process.env.HOST || '127.0.0.1',
    ),
  );

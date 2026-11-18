import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { Viewer } from '@clinic/contracts';
export type AppRequest = Request & {
  viewer?: Viewer;
  requestId: string;
  sessionId?: string;
};
@Catch()
export class ErrorFilter implements ExceptionFilter {
  catch(e: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp(),
      res = ctx.getResponse<Response>(),
      req = ctx.getRequest<AppRequest>();
    let status = 500,
      message = 'İşlem tamamlanamadı.';
    if (e instanceof ZodError) {
      status = 422;
      message =
        'Alanları kontrol edin: ' + e.issues.map((x) => x.message).join(' ');
    } else if (e instanceof HttpException) {
      status = e.getStatus();
      message = e.message;
    } else if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      ['P2002', 'P2003', 'P2004', 'P2010', 'P2025', 'P2034'].includes(e.code)
    ) {
      status = 409;
      message =
        'Kayıt çakışıyor veya başka bir işlemle değişti. Yenileyip tekrar deneyin.';
    }
    // Never log request bodies, query strings, database messages or patient data.
    if (status === 500)
      console.error(
        JSON.stringify({
          level: 'error',
          requestId: req.requestId,
          type: e instanceof Error ? e.name : 'UnknownError',
        }),
      );
    res.status(status).json({ message, requestId: req.requestId });
  }
}

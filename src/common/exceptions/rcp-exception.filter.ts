import {
  ArgumentsHost,
  Catch,
  RpcExceptionFilter,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch()
export class AllRpcExceptionsFilter implements RpcExceptionFilter {
  private readonly logger = new Logger(AllRpcExceptionsFilter.name);

  catch(exception: any, host: ArgumentsHost): Observable<any> {
    const ctx = host.switchToRpc();
    const data = ctx.getData();

    this.logger.error({
      name: exception.name || exception.constructor?.name || 'Error',
      message: exception.message || 'Error inesperado',
      stack: exception.stack,
      data,
    });
    
    // Error controlado
    if (exception instanceof RpcException) {
      return throwError(() => exception);
    }

    const sanitizedMessage = this.sanitizeErrorMessage(exception.message || '');

    const errorResponse = {
      status: this.getStatusFromException(exception),
      message: sanitizedMessage,
      code: this.getErrorTypeFromException(exception),
    };

    return throwError(() => new RpcException(errorResponse));
  }

  //* limpia el mensaje de error eliminando información sensible
  private sanitizeErrorMessage(originalMessage: string): string {
    if (!originalMessage) return 'Ha ocurrido un error interno.';

    let cleanMessage = originalMessage.replace(/\n/g, ' ');

    cleanMessage = cleanMessage
      .replace(/[C-Z]:\\[\w\s\-\\\.]+/g, '')
      .replace(/\/[\w\s\-\/\.]+\.(ts|js|json|sql)/g, '')
      .replace(/at\s+[\w\s\-\/\\.]+:\d+:\d+/g, '')
      .replace(/in\s+[C-Z]:\\[\w\s\-\\\.]+/g, '')
      .replace(/in\s+\/[\w\s\-\/\.]+/g, '');

    cleanMessage = cleanMessage
      .replace(/→\s*\d+.*?(?=\w)/g, '')
      .replace(/\s+\d+\s+/g, ' ')
      .replace(/async\s+\w+.*?\{/g, '')
      .replace(/const\s+\w+\s*=.*?;/g, '')
      .replace(/data:\s*\[[\s\S]*?\]/g, 'data: [...]')
      .replace(/\{\s*name:\s*"[^"]*",[\s\S]*?\}/g, '{ datos }');

    cleanMessage = cleanMessage
      .replace(/[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}/gi, '[ID]')
      .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '[IP]')
      .replace(/https?:\/\/[\w\-\.]+/g, '[URL]');

    cleanMessage = cleanMessage
      .replace(/\s+/g, ' ')
      .trim();

    return cleanMessage;
  }

  //* determina el status HTTP basado en el tipo de excepción
  private getStatusFromException(exception: any): number {
    if (exception.name?.includes('PrismaClient')) {
      if (exception.code === 'P2025') return HttpStatus.NOT_FOUND;
      if (exception.code === 'P2002') return HttpStatus.CONFLICT;
      return HttpStatus.BAD_REQUEST;
    }

    if (exception.status) return exception.status;

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  //* determina el tipo de error basado en el nombre de la excepción
  private getErrorTypeFromException(exception: any): string {
    const name = exception.name || exception.constructor?.name || '';
    
    if (name.includes('Validation')) return 'VALIDATION_ERROR';
    if (name.includes('PrismaClient')) return 'DATABASE_ERROR';
    if (name.includes('Unauthorized')) return 'UNAUTHORIZED';
    if (name.includes('Forbidden')) return 'FORBIDDEN';
    
    return 'INTERNAL_ERROR';
  }
}
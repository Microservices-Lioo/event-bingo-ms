
import { Catch, RpcExceptionFilter, ArgumentsHost } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { RpcException } from '@nestjs/microservices';

@Catch(RpcException)
export class ExceptionFilter implements ExceptionFilter {

  catch(exception: RpcException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    const rcpError = exception.getError();

    if (
        typeof rcpError === 'object' &&
        'status' in rcpError &&
        'message' in rcpError
    ) {
        const status = isNaN(+rcpError.status) ? 400 : +rcpError.status;
        return response.status(status).json(rcpError);
    }

    response.status(400).json({
        status: 400,
        message: rcpError
    })
  }
}

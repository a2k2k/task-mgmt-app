import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_URI } from '@tma/shared/api-model';
import { Observable } from 'rxjs';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }
  override canActivate(
    context: ExecutionContext
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublicURI = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_URI, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublicURI) return true;

    return super.canActivate(context);
  }
}

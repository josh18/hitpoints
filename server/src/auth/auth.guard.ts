import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';

import { isAuthorized } from './isAuthorized';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
    ) { }

    canActivate(
        context: ExecutionContext,
    ): boolean {
        const isSignIn = this.reflector.get<boolean>('sign-in', context.getHandler());

        if (isSignIn) {
            return true;
        }

        const request = context.switchToHttp().getRequest<Request>();
        if (!isAuthorized(request)) {
            throw new UnauthorizedException();
        }

        return true;
    }
}

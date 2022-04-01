import { BadRequestException, Body, Controller, NotImplementedException, Post, Res, SetMetadata, UnauthorizedException, UseGuards } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import bcrypt from 'bcrypt';
import { Response } from 'express';

import { config } from '../config';

@Controller('api')
export class AuthController {
    @UseGuards(ThrottlerGuard)
    @SetMetadata('sign-in', true)
    @Post('sign-in')
    async signIn(
        @Res({ passthrough: true }) response: Response,
        @Body() body: { password: string },
    ): Promise<Record<string, never>> {
        const auth = config().auth;

        if (!body.password) {
            throw new BadRequestException('Password is required');
        }

        if (!auth) {
            throw new NotImplementedException('Auth not configured, to enable auth run `npm run set-auth`.');
        }

        const valid = await bcrypt.compare(body.password, auth.password);

        if (!valid) {
            throw new UnauthorizedException('Invalid password');
        }

        const expires = new Date();
        expires.setFullYear(expires.getFullYear() + 10);

        response.cookie('auth', auth.token, {
            sameSite: 'lax',
            httpOnly: true,
            secure: !config().isDevelopment,
            expires,
        });

        return {};
    }

    @Post('sign-out')
    signOut(
        @Res({ passthrough: true }) response: Response,
    ): void {
        response.clearCookie('auth');
    }
}

import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { ThrottlerModule } from '@nestjs/throttler';
import path from 'path';
import { fileURLToPath } from 'url';

import { AuthModule } from './auth/auth.module';
import { CoreModule } from './core/core.module';
import { RecipeModule } from './recipe/recipe.module';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

@Module({
    imports: [
        ThrottlerModule.forRoot({
            ttl: 60,
            limit: 5,
        }),
        CoreModule,
        RecipeModule,
        AuthModule,
        ServeStaticModule.forRoot({
            rootPath: path.join(__dirname, '../../client/dist'),
        }),
    ],
})
export class AppModule {}

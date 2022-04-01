import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { RecipeGateway } from './recipe.gateway';

@Module({
    imports: [HttpModule],
    providers: [RecipeGateway],
})
export class RecipeModule {}

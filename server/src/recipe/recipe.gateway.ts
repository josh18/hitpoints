import { HttpService } from '@nestjs/axios';
import { Logger } from '@nestjs/common';
import { MessageBody, SubscribeMessage, WebSocketGateway } from '@nestjs/websockets';
import { firstValueFrom, Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';

import {
    ImportRecipeRequest,
    ImportRecipeResponse,
    RecipeApi,
    RecipeImported,
} from '@hitpoints/shared';

import { EventHub } from '../core/eventHub';
import { ImageService } from '../core/image/image.service';
import { scrapeRecipe } from './scraper/scrapeRecipe';

interface Request<T> {
    requestId: number;
    data: T;
}

type Response<T> = {
    requestId: number;
    data: T;
} | {
    requestId: number;
    error: string;
};

type Async<T> = Promise<T> | Observable<T> | T;

type RecipeGatewayApi = {
    [Key in keyof RecipeApi]: (request: Request<RecipeApi[Key]['request']>) => Async<Response<RecipeApi[Key]['response']>>;
};

@WebSocketGateway()
export class RecipeGateway implements RecipeGatewayApi {
    private logger = new Logger(RecipeGateway.name);

    constructor(
        private image: ImageService,
        private http: HttpService,
        private eventHub: EventHub,
    ) { }

    @SubscribeMessage('importRecipe')
    importRecipe(@MessageBody() { data, requestId }: Request<ImportRecipeRequest>): Observable<Response<ImportRecipeResponse>> {
        return this.http.get(data.url).pipe(
            switchMap(async response => {
                const logger = new Logger('scrapeRecipe');
                const recipe = scrapeRecipe(response.data, (...args) => logger.warn(...args));

                let imageId;
                if (recipe.imageUrl) {
                    try {
                        const imageUrl = new URL(recipe.imageUrl, data.url);
                        const source = await firstValueFrom(this.http.get(imageUrl.toString(), { responseType: 'arraybuffer' }));
                        imageId = await this.image.create(Buffer.from(source.data, 'binary'));
                    } catch (error) {
                        logger.warn({
                            message: 'Could not import recipe image',
                            url: recipe.imageUrl,
                            error: (error as Error).message,
                        });
                    }
                }

                const entityId = uuid();
                const event: RecipeImported = {
                    type: 'RecipeImported',
                    id: uuid(),
                    entityId,
                    name: recipe.name,
                    ingredients: recipe.ingredients,
                    instructions: recipe.instructions,
                    cookTime: recipe.cookTime,
                    prepTime: recipe.prepTime,
                    tags: recipe.tags,
                    imageId,
                    source: data.url,
                    timestamp: new Date().toISOString(),
                };
                const failed = await this.eventHub.addEvents(entityId, [event]);

                if (failed[0]) {
                    return {
                        requestId,
                        error: failed[0].error,
                    };
                }

                return {
                    requestId,
                    data: {
                        id: entityId,
                        event,
                    },
                };
            }),
            catchError(error => {
                this.logger.error(error);

                return of({
                    requestId,
                    error: error.message,
                });
            }),
        );
    }
}

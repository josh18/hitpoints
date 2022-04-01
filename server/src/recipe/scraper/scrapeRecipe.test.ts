import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { v4 as uuidV4 } from 'uuid';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';

import { scrapeRecipe } from './scrapeRecipe';

const { v5: uuidV5 } = await vi.importActual('uuid');

vi.mock('uuid');

const http = new HttpService();

describe('scrapeRecipe', () => {
    const recipeUrls = [
        'https://ohmyveggies.com/veggie-packed-spanish-rice/',
        'https://sallysbakingaddiction.com/chocolate-chip-loaf-cake/',
        'https://whatsgabycooking.com/cauliflower-rice-kale-bowls-instant-pot-black-beans/',
        'https://www.101cookbooks.com/coleslaw-recipe/',
        'https://www.allrecipes.com/recipe/20513/classic-waffles/',
        'https://www.ambitiouskitchen.com/street-corn-pasta-salad-with-cilantro-pesto-goat-cheese/',
        'https://www.bbc.co.uk/food/recipes/sausage_and_gnocchi_bake_80924',
        'https://www.bbcgoodfood.com/recipes/doughnut-muffins',
        'https://www.jamieoliver.com/recipes/chicken-recipes/crispy-garlicky-chicken/',
    ];
    const recipeData: {
        [url: string]: any;
    } = {};

    beforeAll(async () => {
        await Promise.all(
            recipeUrls.map(async url => {
                const response = await firstValueFrom(http.get(url));
                recipeData[url] = response.data;
            }),
        );
    });

    beforeEach(() => {
        let uuidCount = 0;
        vi.mocked(uuidV4).mockImplementation(() => {
            uuidCount++;
            return uuidV5(uuidCount.toString(), 'abd49d59-bed7-4c44-9572-57bca8c954f1');
        });
    });

    recipeUrls.forEach(url => {
        test(url, () => {
            const logs: any[] = [];

            const data = recipeData[url];
            const recipe = scrapeRecipe(data, message => logs.push(message));

            expect(recipe).toMatchSnapshot();
            expect(logs).toEqual([]);
        });
    });
});

import { Document } from 'domhandler';
import { DomUtils, parseDocument } from 'htmlparser2';

import { RecipeIngredient, RecipeInstruction } from '@hitpoints/shared';

import { mapJSONLD, RecipeSchema } from './mapJsonLd';

export interface ImportedRecipe {
    name: string;
    ingredients: RecipeIngredient[];
    instructions: RecipeInstruction[];
    cookTime?: number;
    prepTime?: number;
    imageUrl?: string;
}

export type ScrapeRecipeLogger = (message: any) => void;

interface Thing {
    '@type': string;
}

type LinkedData = Thing[] | { '@graph': Thing[]; } | Thing;

export function scrapeRecipe(html: string, log: ScrapeRecipeLogger): ImportedRecipe {
    const document = parseDocument(html);

    const recipe = findJSONLD(document, log);

    if (recipe) {
        return recipe;
    }

    throw new Error('Could not find recipe data');
}

function findJSONLD(document: Document, log: ScrapeRecipeLogger): ImportedRecipe | undefined {
    // Find JSON-LD scripts
    const scripts = DomUtils.findAll(element => {
        if (element.type !== 'script') {
            return false;
        }

        return element.attribs.type === 'application/ld+json';
    }, document.children);

    // For every JS-LD script
    for (const script of scripts) {
        let data = JSON.parse(DomUtils.textContent(script)) as LinkedData;
        if ('@graph' in data) {
            data = data['@graph'];
        }

        // Try to find a recipe schema
        let recipeSchema: RecipeSchema | undefined;
        if (Array.isArray(data)) {
            recipeSchema = data.find(item => item['@type'] === 'Recipe') as RecipeSchema;
        } else if (data['@type'] === 'Recipe') {
            recipeSchema = data as RecipeSchema;
        }

        if (recipeSchema) {
            // And then map it
            return mapJSONLD(recipeSchema, log);
        }
    }
}

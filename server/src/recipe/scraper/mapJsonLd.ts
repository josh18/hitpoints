import he from 'he';
import { DomUtils, parseDocument } from 'htmlparser2';
import { v4 as uuid } from 'uuid';

import { RecipeIngredient, RecipeInstructionContent, stringToIngredient } from '@hitpoints/shared';

import { ImportedRecipe, ScrapeRecipeLogger } from './scrapeRecipe';

export interface RecipeSchema {
    name?: string;
    recipeIngredient?: string[];
    recipeInstructions?: string | Array<ListSchema | ListItemSchema | string>;
    prepTime?: string;
    cookTime?: string;
    image?: string | string[] | {
        url: string;
    };
}

interface ListSchema {
    name: string;
    itemListElement: Array<ListItemSchema | string>;
}

interface ListItemSchema {
    text: string;
}

export function mapJSONLD(recipeSchema: RecipeSchema, log: ScrapeRecipeLogger): ImportedRecipe {
    const ingredients: RecipeIngredient[] = (recipeSchema.recipeIngredient ?? []).map(ingredient => {
        ingredient = cleanString(ingredient);

        return {
            ...stringToIngredient(ingredient),
            id: uuid(),
            type: 'Ingredient',
        };
    });

    const instructions = getInstructions(recipeSchema, log)
        .map(({ text, ...options }) => {
            return [{
                text: cleanString(text),
                ...options,
            }];
        });

    return {
        name: recipeSchema.name ?? '',
        ingredients,
        instructions,
        cookTime: getMinutes(recipeSchema.cookTime),
        prepTime: getMinutes(recipeSchema.prepTime),
        imageUrl: getImageUrl(recipeSchema, log),
    };
}

function getInstructions({ recipeInstructions = [] }: RecipeSchema, log: ScrapeRecipeLogger): RecipeInstructionContent[] {
    if (typeof recipeInstructions === 'string') {
        const startingTag = recipeInstructions.trim().substring(0, 3) + '>'.toLowerCase();
        if (startingTag !== '<ol>' && startingTag !== '<ul>') {
            log({
                message: 'Could not map unknown instruction string',
                instructions: recipeInstructions,
            });

            return [];
        }

        const document = parseDocument(recipeInstructions);
        return DomUtils
            .findAll(element => element.tagName === 'li', document.children)
            .map(item => {
                const text = DomUtils.textContent(item);
                return { text };
            });
    }

    return recipeInstructions.reduce<RecipeInstructionContent[]>((instructions, instruction) => {
        if (typeof instruction === 'string') {
            instructions.push({ text: instruction });
        } else if ('text' in instruction) {
            instructions.push({ text: instruction.text });
        } else if ('itemListElement' in instruction) {
            instructions.push({
                text: instruction.name,
                bold: true,
            });

            instruction.itemListElement.forEach(item => {
                if (typeof item === 'string') {
                    instructions.push({ text: item });
                } else if ('text' in item) {
                    instructions.push({ text: item.text });
                } else {
                    log({
                        message: 'Could not map instruction list item',
                        instruction,
                        item,
                    });
                }
            });
        } else {
            log({
                message: 'Could not map instruction',
                instruction,
            });
        }

        return instructions;
    }, []);
}

function getMinutes(duration: string | undefined): number | undefined {
    if (!duration) {
        return;
    }

    const match = new RegExp(/(\d+)M/).exec(duration);

    if (match?.[1]) {
        return Number(match[1]);
    }
}

function getImageUrl({ image }: RecipeSchema, log: ScrapeRecipeLogger): string | undefined {
    if (!image) {
        return;
    }

    if (typeof image === 'string') {
        return image;
    }

    if (Array.isArray(image)) {
        return image[0];
    }

    if (image.url) {
        return image.url;
    }

    log({
        message: 'Could not map image url',
        image,
    });
}

function cleanString(value: string): string {
    // Naively remove html tags
    value = value.replace(/<\/?("[^"]*"|'[^']*'|[^>])*(>|$)/g, '');

    // Decode HTML character references
    value = he.decode(value);

    // Remove weird whitespace characters
    value = value.replace(/\s/g, ' ');

    value = value.trim();

    return value;
}

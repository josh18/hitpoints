import he from 'he';
import { DomUtils, parseDocument } from 'htmlparser2';
import { v4 as uuid } from 'uuid';

import { isInstructionAt, RecipeIngredient, RecipeInstruction, RecipeInstructionContent, RecipeTag, recipeTags, stringToIngredient } from '@hitpoints/shared';

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

    const instructionContent: RecipeInstructionContent[] = getInstructions(recipeSchema, log)
        .map(({ text, ...options }) => {
            return {
                text: cleanString(text),
                ...options,
            };
        });

    const instructions = linkIngredients(instructionContent, ingredients);

    return {
        name: recipeSchema.name ?? '',
        ingredients,
        instructions,
        cookTime: getMinutes(recipeSchema.cookTime),
        prepTime: getMinutes(recipeSchema.prepTime),
        imageUrl: getImageUrl(recipeSchema, log),
        tags: mapTags(recipeSchema.name ?? ''),
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

function linkIngredients(instructionContent: RecipeInstructionContent[], ingredients: RecipeIngredient[]): RecipeInstruction[] {
    // Clone so we can modify it
    ingredients = [...ingredients];

    return instructionContent.map(content => {
        // Starts as a single text object
        const initial = [content];

        const matchedIngredients = new Set<string>();

        const instruction = ingredients.reduce<RecipeInstruction>((instruction, ingredient) => {
            const name = ingredient.name;

            if (!name) {
                return instruction;
            }

            const next: RecipeInstruction = [];

            instruction.forEach(content => {
                // Skip at links that have already been inserted
                if (isInstructionAt(content)) {
                    next.push(content);
                    return;
                }

                let text = content.text;
                let index = text.toLowerCase().indexOf(name);
                while (index !== -1) {
                    const before = text.substring(0, index);

                    if (before.length) {
                        next.push({
                            ...content,
                            text: before,
                        });
                    }

                    matchedIngredients.add(name);
                    next.push({
                        at: ingredient.id,
                    });

                    text = text.substring(index + name.length);
                    index = text.toLowerCase().indexOf(name);
                }

                if (text.length) {
                    next.push({
                        ...content,
                        text,
                    });
                }
            });

            return next;
        }, initial);

        // Remove ingredients that were matched and are listed twice
        matchedIngredients.forEach(name => {
            const matching = ingredients.filter(ingredient => ingredient.name === name);

            if (matching.length > 1) {
                const index = ingredients.findIndex(ingredient => ingredient.name === name);
                ingredients.splice(index, 1);
            }
        });

        return instruction;
    });
}

function mapTags(name: string): RecipeTag[] | undefined {
    const map: {
        [key in RecipeTag]: string[];
    } = {
        Baking: [
            'biscuit',
            'brownie',
            'cake',
            'cookie',
            'muffin',
        ],
        Bread: [],
        Breakfast: [
            'pancake',
            'waffle',
        ],
        Main: [
            'beef',
            'burger',
            'chicken',
            'curry',
            'meat',
            'pizza',
            'steak',
        ],
        Pasta: [
            'fusilli',
            'lasagna',
            'lasagne',
            'macaroni',
            'penne',
            'ravioli',
            'spaghetti',
        ],
        Pudding: [
            'custard',
            'dessert',
            'tart',
        ],
        Salad: [],
        Side: [
            'relish',
            'salsa',
        ],
        Soup: [],
        Vegetarian: [],
    };

    name = name.toLowerCase();

    const tags: RecipeTag[] = [];

    Object.entries(map).forEach(([tag, values]) => {
        // 'Side' doesn't work very well e.g. Upside down cake
        if (tag !== 'Side') {
            values = [...values, tag.toLowerCase()];
        }

        if (values.some(value => name.includes(value))) {
            tags.push(tag as RecipeTag);
        }
    });

    return tags.length ? tags : undefined;
}

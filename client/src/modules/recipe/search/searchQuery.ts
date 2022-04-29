import { RecipeTag, recipeTags } from '@hitpoints/shared';

import { RecipeQuery } from './searchInterface';

interface TextQuery {
    type: 'text';
    value: string;
}

interface TagQuery {
    type: 'is';
    value: RecipeTag;
}

interface HasQuery {
    type: 'has';
    value: string;
}

interface NotQuery {
    type: 'not';
    value: string;
}

type InputQuery = Array<TextQuery | TagQuery | HasQuery | NotQuery>;

const queryRegex = /(\w+):"([^"]+)"|(\w+):'([^']+)'|(\w+):(\w+)/g;

function isRecipeTag(value: string) {
    return recipeTags.find(tag => tag.toLowerCase() === value.toLowerCase());
}

export class SeachQuery {
    private query: InputQuery = [];

    toString() {
        const quoteIfNeeded = (value: string) => {
            if (value.includes(' ')) {
                return `"${value}"`;
            }

            return value;
        };

        return this.query.map(({ type, value }) => {
            switch (type) {
                case 'text':
                    return value;
                case 'is':
                    return `is:${value.toLowerCase()}`;
                case 'has':
                    return `has:${quoteIfNeeded(value)}`;
                case 'not':
                    return `not:${quoteIfNeeded(value)}`;
            }
        }).join(' ');
    }

    toRecipeQuery() {
        const recipeQuery: RecipeQuery = {};

        this.query.forEach(({ type, value }) => {
            switch (type) {
                case 'text':
                    recipeQuery.text = recipeQuery.text ?? [];
                    recipeQuery.text.push(value);
                    break;
                case 'is':
                    recipeQuery.tags = recipeQuery.tags ?? [];
                    recipeQuery.tags.push(value);
                    break;
                case 'has':
                    recipeQuery.hasIngredients = recipeQuery.hasIngredients ?? [];
                    recipeQuery.hasIngredients.push(value);
                    break;
                case 'not':
                    recipeQuery.notIngredients = recipeQuery.notIngredients ?? [];
                    recipeQuery.notIngredients.push(value);
                    break;
            }
        });

        return recipeQuery;
    }

    setQuery(value: string) {
        const query: InputQuery = [];

        let adjustment = 0;
        for (const match of value.matchAll(queryRegex)) {
            const type = match[1] ?? match[3] ?? match[5];
            const filterValue = (match[2] ?? match[4] ?? match[6]).trim();

            const addTextValue = () => {
                const start = match.index! - adjustment;
                const end = start + match[0].length;

                const textValue = value.slice(0, start).trim();
                if (textValue.length) {
                    query.push({ type: 'text', value: textValue });
                }

                value = value.slice(end);
                adjustment += end;
            };

            if (type) {
                switch (type) {
                    case 'is': {
                        const tag = isRecipeTag(filterValue);
                        if (tag) {
                            addTextValue();
                            query.push({ type: 'is', value: tag });
                        }
                        break;
                    }
                    case 'has':
                    case 'not':
                        addTextValue();
                        query.push({ type, value: filterValue });
                        break;
                    default:
                        console.warn(`Filter type "${type}" is not supported`);
                }
            }
        }

        if (value.length) {
            query.push({ type: 'text', value: value.trim() });
        }

        this.query = query;
    }

    toggleTagFilter(tag: RecipeTag) {
        const hasTagFilter = this.query.some(({ type, value }) => type === 'is' && value === tag);

        if (hasTagFilter) {
            this.query = this.query.filter(({ type, value }) => type !== 'is' || value !== tag);
        } else {
            this.query.push({ type: 'is', value: tag });
        }
    }

    setIngredientFilter(filterType: 'has' | 'not', value: string) {
        value = value.trim();

        const filterIndex = this.query.findIndex(({ type }) => type === filterType);

        this.query = this.query.filter(({ type }) => type !== filterType);

        if (!value.length) {
            return;
        }

        if (filterIndex !== -1) {
            this.query.splice(filterIndex, 0, { type: filterType, value });
        } else {
            this.query.push({ type: filterType, value });
        }
    }
}

import { describe, expect, test } from 'vitest';

import { stringToIngredient } from './ingredientUtils.js';

describe('stringToIngredient', () => {
    test('1 teaspoon salt', () => {
        expect(stringToIngredient('1 teaspoon salt')).toEqual({
            amount: '1',
            measurement: 'Teaspoon',
            name: 'salt',
        });
    });

    test('2 tablespoons white sugar', () => {
        expect(stringToIngredient('2 tablespoons white sugar')).toEqual({
            amount: '2',
            measurement: 'Tablespoon',
            name: 'white sugar',
        });
    });

    test('2 eggs', () => {
        expect(stringToIngredient('2 eggs')).toEqual({
            amount: '2',
            name: 'eggs',
        });
    });

    test('1 1/2 Cups milk', () => {
        expect(stringToIngredient('1 1/2 cups milk')).toEqual({
            amount: '1 1/2',
            measurement: 'Cup',
            name: 'milk',
        });
    });

    test('2 3 / 4 Cup Water', () => {
        expect(stringToIngredient('2 3 / 4 Cup Water')).toEqual({
            amount: '2 3/4',
            measurement: 'Cup',
            name: 'water',
        });
    });

    test('1 and 1/2 cups super soup', () => {
        expect(stringToIngredient('1 and 1/2 cups super soup')).toEqual({
            amount: '1 1/2',
            measurement: 'Cup',
            name: 'super soup',
        });
    });

    test('1 tsp coffee', () => {
        expect(stringToIngredient('1 tsp coffee')).toEqual({
            amount: '1',
            measurement: 'Teaspoon',
            name: 'coffee',
        });
    });

    test('10.5 grams butter', () => {
        expect(stringToIngredient('10.5 grams butter')).toEqual({
            amount: '10.5',
            measurement: 'Gram',
            name: 'butter',
        });
    });

    test('¾ cup sugar', () => {
        expect(stringToIngredient('¾ cup sugar')).toEqual({
            amount: '3/4',
            measurement: 'Cup',
            name: 'sugar',
        });
    });

    test('1-2 giant apples', () => {
        expect(stringToIngredient('1-2 giant apples')).toEqual({
            amount: '1-2',
            name: 'giant apples',
        });
    });
});

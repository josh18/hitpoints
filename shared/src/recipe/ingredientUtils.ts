import { RecipeIngredient, RecipeMeasurement, recipeMeasurements } from './recipe.types.js';

const measurementAbbreviations: {
    [key in RecipeMeasurement]?: string;
} = {
    Millilitre: 'mL',
    Litre: 'L',
    Gram: 'g',
    Tablespoon: 'tbsp',
    Teaspoon: 'tsp',
    Pound: 'lb',
    Ounce: 'oz',
};

const measurementAlts: {
    [key: string]: RecipeMeasurement;
} = {
    tbs: 'Tablespoon',
};

Object.entries(measurementAbbreviations).forEach(([key, value]) => {
    measurementAlts[value] = key as RecipeMeasurement;
});

const fractionMap = {
    '¼': '1/4',
    '½': '1/2',
    '¾': '3/4',
    '⅐': '1/7',
    '⅑': '1/9',
    '⅒': '1/10',
    '⅓': '1/3',
    '⅔': '2/3',
    '⅕': '1/5',
    '⅖': '2/5',
    '⅗': '3/5',
    '⅘': '4/5',
    '⅙': '1/6',
    '⅚': '5/6',
    '⅛': '1/8',
    '⅜': '3/8',
    '⅝': '5/8',
    '⅞': '7/8',
};

function replaceFractionCharacters(value: string): string {
    return value.replace(new RegExp(`[${Object.keys(fractionMap).join('')}]`, 'g'), match => fractionMap[match as keyof typeof fractionMap]);
}

export function stringToIngredient(value: string): Omit<RecipeIngredient, 'id' | 'type'> {
    if (!value.length) {
        return {};
    }

    value = replaceFractionCharacters(value);

    let amount: string | undefined;
    let measurement: RecipeMeasurement | undefined;
    let name = value;

    // Matches fractions (1 1/2) or numbers (1.5)
    const amountMatcher = new RegExp(/(\d*\s*(?:and)?\s*\d+\s*\/\s*\d+|\d[\d.,-]*)/).source;

    // Matches measurements (Litre or L)
    const measurements = [
        ...recipeMeasurements,
        ...Object.keys(measurementAlts),
    ].join('|');
    const measurementMatcher = `(?:(${measurements})s?(?:\\s|$))?`;

    const match = new RegExp(`${amountMatcher}\\s*${measurementMatcher}`, 'i').exec(value);
    if (match) {
        name = value.substring(0, match.index) + value.substring(match.index + match[0].length);

        const amountMatch = match[1];
        const measurementMatch = match[2]?.toLowerCase();

        if (amountMatch) {
            amount = amountMatch;

            // 1 and 1/2 -> 1 1/2
            amount = amount.replace(/and\s*/, '');
            // 1 1 / 2 -> 1 1/2
            amount = amount.replace(/\s*\/\s*/, '/');
        }

        if (measurementMatch) {
            const altMatch = Object.entries(measurementAlts)
                .find(([alt]) => measurementMatch === alt?.toLowerCase());

            if (altMatch) {
                measurement = altMatch[1];
            } else {
                measurement = measurementMatch.charAt(0).toUpperCase() + measurementMatch.slice(1) as RecipeMeasurement;
            }
        }
    }

    name = name.toLowerCase().trim();
    if (name.startsWith('of ')) {
        name = name.substring(3);
    }

    return {
        amount: amount ?? '1',
        measurement,
        name,
    };
}

export function measurementToString(measurement: RecipeMeasurement, amount = '1'): string {
    const abbreviation = measurementAbbreviations[measurement];
    if (abbreviation) {
        return abbreviation;
    }

    let isPlural = false;
    if (amount.includes('/')) {
        const split = amount.split(' ');
        if (split.length > 1) {
            // 2 1/2
            isPlural = true;
        } else {
            const [top, bottom] = amount.split('/');
            isPlural = Number(top) / Number(bottom) > 1;
        }
    } else {
        isPlural = Number(amount.replace(',', '')) > 1;
    }

    let measurementString = measurement.toLowerCase();

    if (isPlural) {
        measurementString += 's';
    }

    return measurementString;
}

export function ingredientToString({ amount, measurement, name }: Omit<RecipeIngredient, 'id' | 'type'>): string {
    if (!amount && !measurement && !name) {
        return '';
    }

    amount = amount ?? '1';

    let result = amount;

    if (measurement) {
        if (result.length) {
            result += ' ';
        }
        result += measurementToString(measurement, amount);
    }

    if (name) {
        if (result.length) {
            result += ' ';
        }
        result += name;
    }

    return result;
}

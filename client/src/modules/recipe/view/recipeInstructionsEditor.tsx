import { useEffect, useState } from 'react';
import { Element } from 'slate';

import { isInstructionContent, Recipe, RecipeInstruction } from '@hitpoints/shared';

import { AtItems } from '../../../components/textEditor/atPlugin';
import { ParagraphElement, TextEditor } from '../../../components/textEditor/textEditor';
import { useUpdateRecipe } from '../hooks/useUpdateRecipe';

function instructionsToValue(instructions: RecipeInstruction[] = []): Element[] {
    if (!instructions.length) {
        // Add at least one paragraph
        instructions = [[]];
    }

    return instructions.map(instruction => {
        let children: ParagraphElement['children'] = instruction.map(content => {
            if (isInstructionContent(content)) {
                return content;
            }

            return {
                type: '@',
                at: content.at,
                children: [{ text: '' }],
            };
        });

        if (!children.length) {
            children = [{
                text: '',
            }];
        }

        return {
            type: 'paragraph',
            children,
        };
    });
}

function valueToInstructions(elements: Element[]): RecipeInstruction[] {
    return elements
        .filter(Element.isElement)
        .map(node => {
            const children = node.children as ParagraphElement['children'];

            return children.map(child => {
                if (Element.isElement(child)) {
                    if (child.type === '@') {
                        return {
                            at: child.at,
                        };
                    }
                }

                return child;
            });
        });
}

interface RecipeInstructionsEditorProps {
    ingredients: Recipe['ingredients'];
    instructions: Recipe['instructions'];
}

export function RecipeInstructionsEditor({ ingredients, instructions }: RecipeInstructionsEditorProps) {
    const [value, setValue] = useState<Element[]>(instructionsToValue(instructions));
    const updateRecipe = useUpdateRecipe();

    useEffect(() => {
        setValue(instructionsToValue(instructions));
    }, [instructions]);

    const atItems: AtItems = {};
    ingredients.forEach(ingredient => {
        if (ingredient.type === 'Ingredient' && ingredient.name) {
            atItems[ingredient.id] = ingredient.name;
        }
    });

    const onCommit = (next: Element[]) => {
        updateRecipe({
            type: 'RecipeInstructionsSet',
            instructions: valueToInstructions(next),
        });
    };

    return (
        <TextEditor
            atItems={atItems}
            value={value}
            setValue={setValue}
            onCommit={onCommit}
            placeholder="Recipe instructions..."
        />
    );
}

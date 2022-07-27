import styled from '@emotion/styled';
import { rgba } from 'polished';

import { isInstructionContent, Recipe } from '@hitpoints/shared';

import { InstructionText } from './instructionText';

const List = styled.ol`
    max-width: 800px;
    align-self: center;
    list-style: none;
    margin: 0;
    padding: 0;
    counter-reset: instructions;
`;

const Item = styled.li`
    display: flex;
    counter-increment: instructions;

    & + & {
        margin-top: 1.5em;
    }

    &::before {
        content: counter(instructions);
        flex: 0 0 auto;
        align-self: start;
        display: block;
        min-width: 24px;
        padding-left: 6px;
        padding-right: 6px;
        margin-right: 24px;
        color: ${rgba('#000', 0.3)};
        text-align: center;
        border-bottom: 2px solid ${rgba('#000', 0.2)};
    }

    @media (max-width: 550px) {
        flex-direction: column;

        &::before {
            margin-right: 0;
            margin-bottom: 12px;
            min-width: 48px;
        }
    }
`;

interface RecipeInstructionsProps {
    ingredients: Recipe['ingredients'];
    instructions: Recipe['instructions'];
}

export function RecipeInstructions({ ingredients, instructions = [] }: RecipeInstructionsProps) {
    return (
        <List>
            {instructions
                .filter(instruction => instruction.length && (!isInstructionContent(instruction[0]) || instruction[0].text))
                .map((instruction, i) => {
                    return (
                        <Item key={i}>
                            {instruction.map((content, j) => {
                                if (isInstructionContent(content)) {
                                    return <InstructionText key={j} content={content} />;
                                }

                                return ingredients.find(({ id }) => id === content.at)?.name ?? 'removed';
                            })}
                        </Item>
                    );
                })
            }
        </List>
    );
}

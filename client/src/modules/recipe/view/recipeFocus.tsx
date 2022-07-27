import { css, Theme } from '@emotion/react';
import styled from '@emotion/styled';
import { rgba } from 'polished';
import { useEffect, useRef, useState } from 'react';

import { isInstructionAt, isInstructionContent, measurementToString, Recipe, RecipeIngredient, RecipeInstruction } from '@hitpoints/shared';

import { TextButton } from '../../../components/button';
import { Checkbox } from '../../../components/checkbox';
import { Portal } from '../../../components/portal';
import { TransitionIn } from '../../../components/transitionIn';
import { RemoveIcon } from '../../../icons/removeIcon';
import { useOnEscape } from '../../../util/useOnEscape';
import { useUpdateRecipe } from '../hooks/useUpdateRecipe';
import { InstructionText } from './instructionText';
import { RecipeIngredients } from './recipeIngredients';

// 1 minute
const setCompletedDelay = 60_000;

const Container = styled.div`
    display: flex;
    justify-content: center;
    position: fixed;
    z-index: 10000;
    inset: 0;
    overflow: auto;
    background-color: ${props => props.theme.whiteBackground};
`;

const CloseButton = styled(TextButton)`
    position: absolute;
    top: 32px;
    right: 32px;

    @media (max-width: 800px) {
        top: 16px;
        right: 16px;
    }
`;

const Content = styled.div`
    display: grid;
    grid-template-columns: 1fr 2fr;
    padding: 96px 32px 32px;

    @media (max-width: 800px) {
        padding: 68px 16px 16px;
    }

    @media (max-width: 600px) {
        display: flex;
        flex-direction: column;
        padding: 64px 0 0;
    }
`;

const Instructions = styled.div`
    max-width: 600px;
`;

const Instruction = styled.div<{ active: boolean }>`
    position: relative;
    padding: 32px;

    ${props => props.active && css`
        background-color: ${rgba('#000', 0.08)};
    `}

    & + & {
        margin-top: 1px;

        &::before {
            content: '';
            display: block;
            position: absolute;
            top: -1px;
            height: 1px;
            left: 0;
            right: 0;
            background-color: ${rgba('#000', 0.08)};
        }
    }

    @media (max-width: 800px) {
        padding: 16px;
    }
`;

const Ingredients = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px 16px;
    border-right: 1px solid ${rgba('#000', 0.08)};

    @media (max-width: 800px) {
        padding: 16px;
    }

    @media (max-width: 600px) {
        border: 0;
        order: 2;
    }
`;

const InlineAmount = styled(Checkbox)`
    margin-top: 32px;

    @media (max-width: 800px) {
        margin-top: 16px;
    }
`;

const highlightStyle = (props: { highlight: boolean, theme: Theme }) => css`
    ${props.highlight && css`
        color: ${props.theme.primaryText};
    `}
`;

const Name = styled.span<{ highlight: boolean; }>`
    ${highlightStyle}
`;

const Amount = styled.span<{ highlight: boolean; }>`
    text-align: right;

    ${highlightStyle}
`;


interface InstructionContentProps {
    content: RecipeInstruction[number];
    ingredients: Recipe['ingredients'];
    focused?: string[];
    inlineAmount: boolean;
}

function InstructionContent({ content, ingredients, focused, inlineAmount }: InstructionContentProps) {
    if (isInstructionContent(content)) {
        return <InstructionText content={content} />;
    }

    const ingredient = ingredients.find((ingredient): ingredient is RecipeIngredient => ingredient.type === 'Ingredient' && ingredient.id === content.at);

    if (!ingredient) {
        return <>removed</>;
    }

    const highlight = !!focused && focused.includes(ingredient.id);

    if (!inlineAmount) {
        return <Name highlight={highlight}>{ingredient.name}</Name>;
    }

    const measurement = ingredient.measurement && measurementToString(ingredient.measurement, ingredient.amount);

    return (
        <>
            <Amount highlight={highlight}>{ingredient.amount} {measurement}</Amount>
            <> </>
            <Name highlight={highlight}>{ingredient.name}</Name>
        </>
    );
}

interface ActiveInstruction {
    index: number;
    ingredients: string[];
}

export interface RecipeFocusProps {
    active: boolean;
    recipe: Recipe;
    onClose(): void;
}

export function RecipeFocus({ active, recipe, onClose }: RecipeFocusProps) {
    const [activeInstruction, setActiveInstruction] = useState<undefined | ActiveInstruction>();
    const [inlineAmount, setInlineAmount] = useState(true);
    const instructionsRef = useRef<HTMLDivElement>(null);
    const updateRecipe = useUpdateRecipe();
    useOnEscape(onClose);

    useEffect(() => {
        if (!active) {
            return;
        }

        const twelveHours = 1000 * 60 * 60 * 12;
        const completedOn = !!recipe.completedOn && new Date(recipe.completedOn).getTime();

        if (!completedOn || Date.now() - completedOn > twelveHours) {
            const timeout = setTimeout(() => {
                updateRecipe({
                    type: 'RecipeCompleted',
                    recipeId: recipe.id,
                });
            }, setCompletedDelay);

            return () => clearTimeout(timeout);
        }
    }, [active, recipe.id, recipe.completedOn, updateRecipe]);

    useEffect(() => {
        const listener = (event: MouseEvent) => {
            if (!instructionsRef.current) {
                return;
            }

            const target = event.target as HTMLElement;

            if (!instructionsRef.current.contains(target) && !target.closest('label')) {
                setActiveInstruction(undefined);
            }
        };

        window.addEventListener('click', listener);

        return () => window.removeEventListener('click', listener);
    }, []);

    const instructions = recipe.instructions.filter(instruction => instruction.length && (!isInstructionContent(instruction[0]) || instruction[0].text))
            .map((instruction, i) => {
                const onClick = () => {
                    setActiveInstruction({
                        index: i,
                        ingredients: instruction.filter(isInstructionAt).map(content => content.at),
                    });
                };

                return (
                    <Instruction key={i} active={i === activeInstruction?.index} onClick={onClick}>
                        {instruction.map((content, j) => (
                            <InstructionContent
                                key={j}
                                content={content}
                                ingredients={recipe.ingredients}
                                focused={activeInstruction?.ingredients}
                                inlineAmount={inlineAmount}
                            />
                        ))}
                    </Instruction>
                );
            });

    return (
        <Portal>
            <TransitionIn visible={active}>
                <Container>
                    <CloseButton onClick={onClose}>
                        <RemoveIcon />Close
                    </CloseButton>

                    <Content>
                        <Ingredients>
                            <RecipeIngredients ingredients={recipe.ingredients} focused={activeInstruction?.ingredients} />

                            <InlineAmount name="Inline amounts" value={inlineAmount} commit={setInlineAmount} />
                        </Ingredients>
                        <Instructions ref={instructionsRef}>
                            {instructions}
                        </Instructions>
                    </Content>
                </Container>
            </TransitionIn>
        </Portal>
    );
}

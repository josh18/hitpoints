import { useRef, useState } from 'react';
import styled, { css } from 'styled-components';

import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { Dialog } from '../../../components/dialog';
import { Error404 } from '../../../components/error404';
import { ImageUpload } from '../../../components/imageUpload';
import { TitleDivider } from '../../../components/titleDivider';
import { TransitionHeight } from '../../../components/transitionHeight';
import { DoneIcon } from '../../../icons/doneIcon';
import { EditIcon } from '../../../icons/editIcon';
import { FocusIcon } from '../../../icons/focusIcon';
import { useMaxWidth } from '../../../util/useMaxWidth';
import { useTitle } from '../../../util/useTitle';
import { useTransitionResize } from '../../../util/useTransitionResize';
import { useActiveRecipe } from '../hooks/useActiveRecipe';
import { useUpdateRecipe } from '../hooks/useUpdateRecipe';
import { RecipeImage } from '../recipeImage';
import { RecipeDeletedWarning } from './recipeDeletedWarning';
import { RecipeEditorPanel } from './recipeEditorPanel';
import { RecipeFocus } from './recipeFocus';
import { RecipeIngredients } from './recipeIngredients';
import { RecipeInstructions } from './recipeInstructions';
import { RecipeMenu } from './recipeMenu';
import { RecipeName } from './recipeName';
import { RecipeTags } from './recipeTags';
import { RecipeTime } from './recipeTime';

const Container = styled.div`
    max-width: 1200px;
    margin: auto;
`;

const Top = styled.div`
    display: grid;
    grid-template-columns: auto 1fr auto;
    column-gap: 24px;
    row-gap: 24px;
    align-items: center;

    @media (max-width: 850px) {
        grid-template-columns: auto;
    }
`;

const Middle = styled.div`
    display: flex;
    align-items: flex-end;
    margin-top: 32px;
    column-gap: 8px;
`;

const RecipeImageCard = styled(Card)`
    width: 300px;

    @media (max-width: 850px) {
        justify-self: center;
    }
`;

const Actions = styled.div`
    display: flex;
    column-gap: 8px;
    margin-left: auto;

    @media print {
        display: none;
    }
`;

const EditButton = styled(Button)`
    transition: ${props => props.theme.transition('width')};
`;

const EditIconStyled = styled(EditIcon)<{ editing: boolean }>`
    transition: ${props => props.theme.transition('opacity', 'transform')};
    transition-delay: 250ms;

    ${({ editing }) => editing && css`
        transform: rotate(90deg);
        opacity: 0;
        transition-delay: 0ms;
    `}
`;

const DoneIconStyled = styled(DoneIcon)<{ editing: boolean }>`
    position: absolute;
    left: 12px;
    transition: ${props => props.theme.transition('opacity', 'transform')};
    transition-delay: 250ms;

    ${({ editing }) => !editing && css`
        transform: rotate(-90deg);
        opacity: 0;
        transition-delay: 0ms;
    `}
`;

const DetailsContainer = styled.div`
    position: relative;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: minmax(0px, 1fr);
    margin-top: 16px;
    transition: ${props => props.theme.transition('height')};

    @media (max-width: 850px) {
        display: block;
    }

    @media print {
        display: block;
    }
`;

const DetailsCard = styled(Card)<{ editing?: boolean }>`
    display: flex;
    flex-direction: column;
    position: relative;
    z-index: 10;
    grid-column-end: span 2;
    grid-row-start: 1;
    grid-column-start: 1;
    padding: 48px 32px;
    transition: ${props => props.theme.transition('margin-right')};

    @media (min-width: 851px) {
        ${({ editing }) => editing && css`
            margin-right: 50%;
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
        `}
    }

    @media (max-width: 850px) {
        padding: 32px 24px;
    }
`;

const EditorContainer = styled.div<{ editing: boolean }>`
    display: flex;
    grid-row-start: 1;
    grid-column-end: span 1;
    grid-column-start: 2;
    overflow: hidden;
    background-color: #dce1e4;
    border-top-right-radius: 2px;
    border-bottom-right-radius: 2px;
    box-shadow: inset 2px 0px 4px rgb(0 0 0 / 5%);

    /* @media (max-width: 850px) {
        height: 0;
        transition: ${props => props.theme.transition('height')};

        ${({ editing }) => editing && css`
            height: auto;
        `}
    } */

    @media print {
        display: none;
    }
`;

export function Recipe() {
    const updateRecipe = useUpdateRecipe();
    const { recipe, recipeNotFound } = useActiveRecipe();
    const [editing, setEditing] = useState(false);
    const [focusActive, setFocusActive] = useState(false);
    const detailsContainerRef = useRef<HTMLDivElement>(null);
    const detailsCardRef = useRef<HTMLDivElement>(null);
    const editorContainerRef = useRef<HTMLDivElement>(null);
    const editButtonRef = useRef<HTMLButtonElement>(null);

    const resizeContainer = useTransitionResize(detailsContainerRef, [[detailsCardRef, ['margin-right']]]);
    // const resizeContainer = useTransitionResize(detailsContainerRef, [[editorContainerRef, ['height']]]);
    const resizeEditButton = useTransitionResize(editButtonRef);
    const smallEditor = useMaxWidth(850);

    useTitle(recipe?.name);

    if (!recipe) {
        if (recipeNotFound) {
            return <Error404 />;
        }

        return null;
    }

    const toggleEditing = () => {
        if (!smallEditor) {
            resizeContainer();
        }

        resizeEditButton();

        setEditing(!editing);
    };

    const onUpload = (imageId: string) => {
        updateRecipe({
            type: 'RecipeImageSet',
            imageId,
        });
    };

    let recipeActions;
    if (recipe.deleted) {
        recipeActions = <RecipeDeletedWarning />;
    } else {
        recipeActions = (
            <>
                <Button onClick={() => setFocusActive(true)}>
                    <FocusIcon /> Focus
                </Button>
                <EditButton ref={editButtonRef} onClick={toggleEditing}>
                    <EditIconStyled editing={editing} />
                    <DoneIconStyled editing={editing} />
                    {editing ? 'Finish' : 'Edit'}
                </EditButton>
                <RecipeMenu recipe={recipe} />
            </>
        );
    }

    let image = <RecipeImage imageId={recipe.imageId} />;
    if (editing) {
        image = <ImageUpload onUpload={onUpload}>{image}</ImageUpload>;
    }

    let editor = (
        <EditorContainer ref={editorContainerRef} editing={editing}>
            <RecipeEditorPanel recipe={recipe} />
        </EditorContainer>
    );

    if (smallEditor) {
        editor = (
            <TransitionHeight visible={editing}>
                {editor}
            </TransitionHeight>
        );
    }

    return (
        <Container>
            <Top>
                <RecipeImageCard>
                    {image}
                </RecipeImageCard>

                <RecipeName name={recipe.name} editing={editing} />

                {/* <RecipeTime cookTime={recipe.cookTime} prepTime={recipe.prepTime} editing={editing}></RecipeTime> */}
            </Top>

            <Middle>
                <div>
                    <RecipeTags tags={recipe.tags} />
                </div>

                <Actions>{recipeActions}</Actions>
            </Middle>

            <DetailsContainer ref={detailsContainerRef}>
                {editor}

                <DetailsCard ref={detailsCardRef} editing={editing}>
                    <TitleDivider title="Ingredients" first />

                    <RecipeIngredients ingredients={recipe.ingredients} />

                    <TitleDivider title="Instructions" />

                    <RecipeInstructions ingredients={recipe.ingredients} instructions={recipe.instructions} />
                </DetailsCard>
            </DetailsContainer>

            <RecipeFocus active={focusActive} recipe={recipe} onClose={() => setFocusActive(false)} />
        </Container>
    );
}

import { useRef, useState } from 'react';
import styled, { css } from 'styled-components';

import { Button } from '../../../components/button';
import { Card } from '../../../components/card';
import { Error404 } from '../../../components/error404';
import { ImageUpload } from '../../../components/imageUpload';
import { TitleDivider } from '../../../components/titleDivider';
import { DoneIcon } from '../../../icons/doneIcon';
import { EditIcon } from '../../../icons/editIcon';
import { useTitle } from '../../../util/useTitle';
import { useTransitionResize } from '../../../util/useTransitionResize';
import { useActiveRecipe } from '../hooks/use-active-recipe';
import { useUpdateRecipe } from '../hooks/use-update-recipe';
import { RecipeImage } from '../recipeImage';
import { RecipeDeletedWarning } from './recipeDeletedWarning';
import { RecipeEditorPanel } from './recipeEditorPanel';
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
`;

const RecipeImageCard = styled(Card)`
    width: 300px;

    @media (max-width: 850px) {
        justify-self: center;
    }
`;

const Actions = styled.div`
    display: flex;
    margin-left: auto;

    @media print {
        display: none;
    }
`;

const EditButton = styled(Button)`
    transition: ${props => props.theme.transition('width')};
    margin-left: 8px;
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

const DetailsContainer = styled.div<{ isPlaceholder?: boolean }>`
    position: relative;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: minmax(0px, 1fr);
    margin-top: 16px;
    transition: ${props => props.theme.transition('height')};

    ${({ isPlaceholder }) => isPlaceholder && css`
        margin-top: 80px;
    `}

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

    ${({ editing }) => editing && css`
        margin-right: 50%;
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
    `}

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

    ${({ editing }) => !editing && css`
        position: absolute;
        right: 0;
        left: 0;
        bottom: 0;
        top: 0;
    `}

    @media print {
        display: none;
    }
`;

export function Recipe() {
    const updateRecipe = useUpdateRecipe();
    const { recipe, recipeNotFound } = useActiveRecipe();
    const [editing, setEditing] = useState(false);
    const detailsContainerRef = useRef<HTMLDivElement>(null);
    const detailsCardRef = useRef<HTMLDivElement>(null);
    const editButtonRef = useRef<HTMLButtonElement>(null);

    const resizeContainer = useTransitionResize(detailsContainerRef, [[detailsCardRef, ['margin-right']]]);
    const resizeEditButton = useTransitionResize(editButtonRef);

    useTitle(recipe?.name);

    if (!recipe) {
        if (recipeNotFound) {
            return <Error404 />;
        }

        return null;
    }

    const toggleEditing = () => {
        resizeContainer();
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
                <EditButton ref={editButtonRef} onClick={toggleEditing}>
                    <EditIconStyled editing={editing} />
                    <DoneIconStyled editing={editing} />
                    {editing ? 'Finish' : 'Edit'}
                </EditButton>
                <RecipeMenu />
            </>
        );
    }

    let image = <RecipeImage imageId={recipe.imageId} />;
    if (editing) {
        image = <ImageUpload onUpload={onUpload}>{image}</ImageUpload>;
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
                <DetailsCard ref={detailsCardRef} editing={editing}>
                    <TitleDivider title="Ingredients" first />

                    <RecipeIngredients ingredients={recipe.ingredients} />

                    <TitleDivider title="Instructions" />

                    <RecipeInstructions ingredients={recipe.ingredients} instructions={recipe.instructions} />
                </DetailsCard>

                <EditorContainer editing={editing}>
                    <RecipeEditorPanel recipe={recipe} />
                </EditorContainer>
            </DetailsContainer>
        </Container>
    );
}

import styled, { css } from 'styled-components';

import { imageUrl } from '../../api/imageUrl';
import { ImagePlaceholder } from '../../components/imagePlaceholder';

const width = 480;
const height = 360;

const Image = styled.img<{ small?: boolean }>`
    ${props => props.small && css`
        width: 48px;
        height: 48px;
        border-radius: 50%;
        object-fit: cover;
    `}
`;

const Placeholder = styled(ImagePlaceholder)<{ small?: boolean }>`
    ${props => props.small && css`
        width: 48px;
        height: 48px;
        border-radius: 50%;
    `}
`;

export interface RecipeImageProps {
    imageId?: string;
    editing?: boolean;
    className?: string;
    small?: boolean;
}

export function RecipeImage({ imageId, className, small }: RecipeImageProps) {
    if (imageId) {
        return <Image className={className} src={recipeImageUrl(imageId)} small={small} />;
    }

    return <Placeholder className={className} width={width} height={height} iconSize={small ? 24 : undefined} small={small} />;
}

export function recipeImageUrl(imageId: string) {
    return imageUrl(imageId, 480, 360);
}

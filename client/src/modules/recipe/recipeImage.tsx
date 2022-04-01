import { imageUrl } from '../../api/imageUrl';
import { ImagePlaceholder } from '../../components/imagePlaceholder';

const width = 480;
const height = 360;

export interface RecipeImageProps {
    imageId?: string;
    editing?: boolean;
    className?: string;
}

export function RecipeImage({ imageId, className }: RecipeImageProps) {
    if (imageId) {
        return <img className={className} src={recipeImageUrl(imageId)} />;
    }

    return <ImagePlaceholder className={className} width={width} height={height} />;
}

export function recipeImageUrl(imageId: string) {
    return imageUrl(imageId, 480, 360);
}

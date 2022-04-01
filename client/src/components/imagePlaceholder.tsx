import { rgba } from 'polished';
import styled from 'styled-components';

import { ImageIcon } from '../icons/imageIcon';

const Container = styled.div<{ $width?: number; $height?: number; }>`
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: 100%;
    aspect-ratio: ${props => props.$width} / ${props => props.$height};
    background-color: ${rgba('#000', 0.12)};
`;

const ImageIconStyled = styled(ImageIcon)`
    position: absolute;
    fill: ${rgba('#000', 0.3)};
    width: 50px;
    height: 50px;
`;

interface ImagePlaceholderProps {
    width?: number;
    height?: number;
    className?: string;
}

export function ImagePlaceholder({ className, width, height }: ImagePlaceholderProps) {
    return (
        <Container className={className} $width={width} $height={height}>
            <ImageIconStyled size={48} />
        </Container>
    );
}

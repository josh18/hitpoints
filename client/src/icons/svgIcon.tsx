import { ReactNode, SVGAttributes } from 'react';
import styled from 'styled-components';

export const Svg = styled.svg`
    display: inline-block;
    flex-shrink: 0;
`;

export interface SvgIconProps extends SVGAttributes<SVGSVGElement> {
    size?: number;
}

export function createIcon(displayName: string, path: ReactNode) {
    const Icon = ({ size = 24, ...props }: SvgIconProps) => {
        const style = {
            width: size,
            height: size,
        };

        return <Svg viewBox="0 0 24 24" style={style}  {...props}>{path}</Svg>;
    };

    Icon.displayName = displayName;

    return Icon;
}

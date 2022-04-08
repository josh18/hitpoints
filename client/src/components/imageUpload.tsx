import { rgba } from 'polished';
import { DragEvent, ReactNode, useState } from 'react';
import styled, { css } from 'styled-components';

import { uploadImage } from '../api/uploadImage';
import { demoMode } from '../config';
import { UploadIcon } from '../icons/uploadIcon';
import { WarningIcon } from '../icons/warningIcon';
import { useSelector } from '../util/useSelector';

const Container = styled.div`
    position: relative;
`;

const Overlay = styled.div<{ active?: boolean }>`
    position: absolute;
    inset: 0;
    padding: 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    text-align: center;
    color: ${props => props.theme.white};
    background-image: radial-gradient(${rgba('#000', 0.8)}, ${rgba('#000', 0.6)});
    opacity: 0;
    transition: ${props => props.theme.transition('opacity')};
    z-index: 10;
    cursor: pointer;

    &:hover {
        opacity: 1;
    }

    ${props => props.active && css`
        opacity: 1;
    `}
`;

const UploadIconStyled = styled(UploadIcon)`
    margin-bottom: 8px;
`;

const WarningIconStyled = styled(WarningIcon)`
    margin-bottom: 8px;
`;

export interface ImgUploadProps {
    children?: ReactNode;
    onUpload: (id: string) => void;
}

export function ImageUpload({ children, onUpload }: ImgUploadProps) {
    const connected = useSelector(state => state.connected);
    const [active, setActive] = useState(false);

    const onDragOver = (event: DragEvent<HTMLDivElement>) => {
        if (event.dataTransfer.types.includes('Files')) {
            event.preventDefault();
            setActive(true);
        }
    };

    const onDrop = (event: DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setActive(false);

        const file = event.dataTransfer.files[0];

        if (file) {
            upload(file);
        }
    };

    const onClick = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.click();

        input.addEventListener('change', () => {
            const file = input.files && input.files[0];

            if (file) {
                upload(file);
            }
        }, { once: true });
    };

    const upload = async (file: File) => {
        if (!file.type.startsWith('image')) {
            console.error('Must select an image!');
            return;
        }

        const id = await uploadImage(file);
        onUpload(id);
    };

    if (!connected) {
        let message = `Can't upload images unless you are connected to the server`;
        if (demoMode) {
            message = `Can't upload images in demo mode`;
        }

        return (
            <Container>
                <Overlay>
                    <WarningIconStyled size={48} />
                    {message}
                </Overlay>
                {children}
            </Container>
        );
    }

    return (
        <Container
            onClick={onClick}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onDragLeave={() => setActive(false)}
        >
            <Overlay active={active}>
                <UploadIconStyled size={48} />
                Upload image
            </Overlay>
            {children}
        </Container>
    );
}

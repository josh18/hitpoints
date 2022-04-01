import { ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface PortalOptions {
    children: ReactNode;
}

export function Portal({ children }: PortalOptions) {
    return createPortal(children, document.getElementById('portal')!);
}

export interface AnchorPosition {
    top: number;
    right: number;
    bottom: number;
    left: number;
}

export function positionInViewport(
    element: HTMLElement,
    anchor: AnchorPosition,
    prefer: 'left' | 'right' = 'right',
    padding = 24,
): void {
    const width = element.offsetWidth;
    const height = element.offsetHeight;

    const viewWidth = window.innerWidth;
    const viewHeight = window.innerHeight;

    const fitsLeft = anchor.right - width >= padding;
    const fitsRight = anchor.left + width <= viewWidth - padding;
    const fitsTop = anchor.top - height >= padding;
    const fitsBottom = anchor.bottom + height <= viewHeight - padding;

    if (fitsRight && (prefer === 'right' || !fitsLeft)) {
        element.style.left = px(anchor.left + window.scrollX);
    } else if (fitsLeft) {
        element.style.left = px(anchor.right - width + window.scrollX);
    } else {
        element.style.left = px(padding + window.scrollX);
    }

    if (fitsBottom) {
        element.style.top = px(anchor.bottom + window.scrollY);
    } else if (fitsTop) {
        element.style.top = px(anchor.top - height + window.scrollY);
    } else {
        element.style.top = px(padding + window.scrollY);
    }
}

function px(value: number) {
    return value + 'px';
}

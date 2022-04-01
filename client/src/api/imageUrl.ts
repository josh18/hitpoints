export function imageUrl(imageId: string, width: number, height: number) {
    return `/api/images/${imageId}?width=${width}&height=${height}`;
}

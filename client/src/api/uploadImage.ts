export async function uploadImage(file: File): Promise<string> {
    const data = new FormData();
    data.append('image', file);

    const response = await fetch('/api/images', {
        method: 'POST',
        body: data,
    });

    const { id } = await response.json() as { id: string };

    return id;
}

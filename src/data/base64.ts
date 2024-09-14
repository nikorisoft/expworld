export function toBase64(buf: Uint8Array): string {
    let binary = "";

    for (let i = 0; i < buf.byteLength; i++) {
        binary += String.fromCharCode(buf[i]);
    }

    return btoa(binary);
}

export function fromBase64(base64: string): Uint8Array {
    const binary = atob(base64);

    const buf = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        buf[i] = binary.charCodeAt(i);
    }

    return buf;
}

function writeString(str: string, buffer: Buffer): void {
	let offset = 0;
	for (let i = 0, sl = str.length; i < sl; i++) {
		const c = str.charCodeAt(i);
		if (c < 128) {
			buffer[offset++] = c;
		} else if (c > 127 && c < 2048) {
			buffer[offset++] = (c >> 6) | 192;
			buffer[offset++] = ((c & 63) | 128);
		} else {
			buffer[offset++] = (c >> 12) | 224;
			buffer[offset++] = ((c >> 6) & 63) | 128;
			buffer[offset++] = (c & 63) | 128;
		}
	}
}

function stringByteLength(str: string): number {
	if (!str) return 0;
	let size = 0;
	for (let i = 0, sl = str.length; i < sl; i++) {
		const c = str.charCodeAt(i);
		if (c < 128) size += 1;
		else if (c > 127 && c < 2048) size += 2;
		else size += 3;
	}
	return size;
}

export function toBuffer(str: string): Buffer {
	const buffer = Buffer.alloc(stringByteLength(str));
	writeString(str, buffer);
	return buffer;
}

const escapeCharacters: { [key: string]: string } = {};

escapeCharacters[String.fromCharCode(8)] = "\\b";
escapeCharacters[String.fromCharCode(9)] = "\\t";
escapeCharacters[String.fromCharCode(10)] = "\\n";
escapeCharacters[String.fromCharCode(12)] = "\\f";
escapeCharacters[String.fromCharCode(13)] = "\\r";
escapeCharacters[String.fromCharCode(34)] = "\\\"";
escapeCharacters[String.fromCharCode(92)] = "\\\\";

const nullBuffer = Buffer.from("null");
const trueBuffer = Buffer.from("true");
const falseBuffer = Buffer.from("false");
const commaBuffer = Buffer.from(",");
const colonBuffer = Buffer.from(":");
const doubleQuoteBuffer = Buffer.from("\"");
const emptyArrayBuffer = Buffer.from("[]");
const openArrayBuffer = Buffer.from("[");
const closeArrayBuffer = Buffer.from("]");
const emptyObjectBuffer = Buffer.from("{}");
const openObjectBuffer = Buffer.from("{");
const closedObjectBuffer = Buffer.from("}");

// eslint-disable-next-line no-control-regex
const escapable = /[\\"\x00-\x1F]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g;

function quote(value: string): Buffer {

	// If the string contains no control characters, no quote characters, no
	// backslash characters, and no lone surrogates, then we can safely
	// slap some quotes around it. Otherwise we must also replace the
	// offending characters with safe escape sequences.

	escapable.lastIndex = 0;
	const result = escapable.test(value) ?
		'"' + value.replace(escapable, function (a) {
			const c = escapeCharacters[a];
			return typeof c === 'string' ? c :
				'\\u' + a.charCodeAt(0).toString(16).padStart(4, '0');
		}) + '"' :
		'"' + value + '"';

	return Buffer.from(result);
}

function serializeArray(data: unknown[]): Buffer {
	if (data.length === 0) {
		return emptyArrayBuffer;
	}

	const dl = data.length;
	const result: Buffer[] = [];
	result.push(openArrayBuffer)

	for (let d = 0; d < dl; d++) {

		result.push(
			serialize(data[d]),
		);

		if (d < dl - 1) {
			result.push(commaBuffer);
		}
	}

	result.push(closeArrayBuffer);
	return Buffer.concat(result);
}

function serializeObject(data: { [key: string]: unknown }): Buffer {

	if (typeof data.toJSON === "function") {
		return data.toJSON();
	}

	const keys = Object.keys(data);
	if (keys.length === 0) {

		return emptyObjectBuffer;

	}

	const kl = keys.length;
	const result: Buffer[] = [];
	result.push(openObjectBuffer)

	for (let k = 0; k < kl; k++) {

		const key = keys[k];

		if (data[key]) {
			result.push(
				doubleQuoteBuffer,
				Buffer.from(key),
				doubleQuoteBuffer,
				colonBuffer,
				serialize(data[key]),
			);

			if (k < kl - 1) {
				result.push(commaBuffer);
			}
		}
	}

	result.push(closedObjectBuffer);
	return Buffer.concat(result);
}

export const serialize = function (data: unknown): Buffer {

	if (data === undefined) {
		return undefined;
	}

	if (data === null) {
		return nullBuffer;
	}

	if (
		typeof data === 'boolean' ||
		data instanceof Boolean
	) {
		return data ? trueBuffer : falseBuffer;
	}

	if (
		typeof data === 'number' ||
		data instanceof Number
	) {
		if (
			data === Infinity ||
			data === -Infinity ||
			(isNaN(data as number) === true)) {
			return nullBuffer;
		}

		return data.valueOf ? Buffer.from(data.valueOf().toString()) : Buffer.from(data.toString());
	}

	if (
		typeof data === 'string' ||
		data instanceof String
	) {
		return quote(data.toString());
	}

	if (data instanceof Function) {
		return undefined;
	}

	if (data instanceof Array) {
		return serializeArray(data);
	}

	if (data instanceof Date) {
		return quote(data.toISOString());
	}

	return serializeObject(data as { [key: string]: unknown });
};

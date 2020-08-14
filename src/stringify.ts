const escapeCharacters: { [key: string]: string } = {};

escapeCharacters[String.fromCharCode(8)] = "\\b";
escapeCharacters[String.fromCharCode(9)] = "\\t";
escapeCharacters[String.fromCharCode(10)] = "\\n";
escapeCharacters[String.fromCharCode(12)] = "\\f";
escapeCharacters[String.fromCharCode(13)] = "\\r";
escapeCharacters[String.fromCharCode(34)] = "\\\"";
escapeCharacters[String.fromCharCode(92)] = "\\\\";

// eslint-disable-next-line no-control-regex
const escapable = /[\\"\x00-\x1F]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/g;

function quote(value: string): string {

	// If the string contains no control characters, no quote characters, no
	// backslash characters, and no lone surrogates, then we can safely
	// slap some quotes around it. Otherwise we must also replace the
	// offending characters with safe escape sequences.

	escapable.lastIndex = 0;
	return escapable.test(value) ?
		'"' + value.replace(escapable, function (a) {
			const c = escapeCharacters[a];
			return typeof c === 'string' ? c :
				'\\u' + a.charCodeAt(0).toString(16).padStart(4, '0');
		}) + '"' :
		'"' + value + '"';
}

function stringifyArray(data: unknown[]): string {
	if (data.length === 0) {
		return '[]';
	}

	let str = '[';

	const dl = data.length;

	for (let d = 0; d < dl; d++) {

		str += stringify(data[d]);

		if (d < dl - 1) {
			str += ',';
		}
	}

	str += ']';

	return str;
}

function stringifyObject(data: { [key: string]: unknown }): string {

	if (typeof data.toJSON === "function") {
		return data.toJSON();
	}

	const keys = Object.keys(data);
	if (keys.length === 0) {

		return '{}';

	}

	let str = '{';

	const kl = keys.length;

	for (let k = 0; k < kl; k++) {

		const key = keys[k];

		if (data[key]) {
			str += '"' + key + '":' + stringify(data[key]);

			if (k < kl - 1) {
				str += ',';
			}
		}
	}

	str += '}';
	return str;
}

export const stringify = function (data: unknown): string {

	if (data === undefined) {
		return undefined;
	}

	if (data === null) {
		return 'null';
	}

	if (
		typeof data === 'boolean' ||
		data instanceof Boolean
	) {
		return `${data}`;
	}

	if (
		typeof data === 'number' ||
		data instanceof Number
	) {
		if (
			data === Infinity ||
			data === -Infinity ||
			(isNaN(data as number) === true)) {
			return 'null';
		}

		return data.valueOf ? data.valueOf().toString() : `${data}`;
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
		return stringifyArray(data);
	}

	if (data instanceof Date) {
		return quote(data.toISOString());
	}

	return stringifyObject(data as { [key: string]: unknown });
};

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

function cyclicCheck(cyclicMap: WeakSet<Record<string, unknown>>, data: unknown): void {

	if (cyclicMap.has(data as Record<string, unknown>)) {
		throw TypeError("cyclic object value");
	}
	cyclicMap.add(data as Record<string, unknown>);
}

function stringifyArray(data: unknown[], cyclicMap: WeakSet<Record<string, unknown>>): string {
	if (data.length === 0) {
		return '[]';
	}

	cyclicCheck(cyclicMap, data);

	let str = '[';

	for (let d = 0, dl = data.length; d < dl; d++) {

		str += stringifyInternal(data[d], cyclicMap, true);

		if (d < dl - 1) {
			str += ',';
		}
	}

	str += ']';

	return str;
}

function stringifyObject(data: { [key: string]: unknown }, cyclicMap: WeakSet<Record<string, unknown>>): string {

	cyclicCheck(cyclicMap, data);

	if (
		typeof data.toISOString === "function"
	) {
		return stringifyInternal(data.toISOString(), cyclicMap, false);
	}

	if (
		typeof data.toJSON === "function"
	) {
		return stringifyInternal(data.toJSON(), cyclicMap, false);
	}

	const keys = Object.keys(data);
	if (keys.length === 0) {

		return '{}';

	}

	let str = '{';

	for (let k = 0, kl = keys.length; k < kl; k++) {

		const key = keys[k];

		if (data[key]) {
			const value = stringifyInternal(data[key], cyclicMap, false);
			if (value === undefined) {
				continue;
			}
			str += '"' + key + '":' + value;

			if (k < kl - 1) {
				str += ',';
			}
		}
	}

	str += '}';
	return str;
}

const stringifyDate = function (data: Date): string {
	return data.toISOString ? quote(data.toISOString()) :
		data.getUTCFullYear() +
		'-' + String(data.getUTCMonth() + 1).padStart(2, "0") +
		'-' + String(data.getUTCDate()).padStart(2, "0") +
		'T' + String(data.getUTCHours()).padStart(2, "0") +
		':' + String(data.getUTCMinutes()).padStart(2, "0") +
		':' + String(data.getUTCSeconds()).padStart(2, "0") +
		'.' + (data.getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5) +
		'Z';
}

export const stringify = function (data: unknown): string {
	return stringifyInternal(data, new WeakSet(), false);
};

export const stringifyInternal = function (data: unknown, cyclicMap: WeakSet<Record<string, unknown>>, inArray: boolean): string {

	if (
		data === undefined &&
		inArray === false
	) {
		return undefined;
	}

	if (
		data === null ||
		data === undefined
	) {
		return 'null';
	}

	if (data instanceof Function) {
		return undefined;
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

	cyclicMap = cyclicMap || new WeakSet();

	if (
		typeof data === 'string' ||
		data instanceof String
	) {
		return quote(data.toString());
	}

	if (data instanceof Date) {
		return stringifyDate(data);
	}

	if (
		(Array.isArray(data) || data instanceof Array) &&
		Object.keys(data).findIndex(value => /\D+/.test(value)) === -1
	) {
		return stringifyArray(data, cyclicMap);
	}

	return stringifyObject(data as { [key: string]: unknown }, cyclicMap);
};
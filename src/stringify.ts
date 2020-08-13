const escapeCharacters = {
	92: "\\\\",
	34: '\\"',
	8: "\\b",
	12: "\\f",
	10: "\\n",
	13: "\\r",
	9: "\\t"
};

// eslint-disable-next-line no-control-regex
const reEscape = /[\x00-\x1f\x22\x5c]/g;

function escapeChar(character: string): string {
	return escapeCharacters[character.charCodeAt(0)] ||
		"\\u00" + character.charCodeAt(0).toString(16).padStart(2, "0");
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

function stringifyObject(data: unknown): string {
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

	if (typeof data === 'boolean') {
		return `${data}`;
	}

	if (typeof data === 'number') {
		if (
			data === Infinity ||
			data === -Infinity ||
			(isNaN(data) === true)) {
			return 'null';
		}

		return `${data}`;
	}

	if (typeof data === 'string') {

		return reEscape.test(data)
			? `"${data.replace(reEscape, escapeChar)}"`
			: `"${data}"`;
	}

	if (data instanceof Function) {
		return undefined;
	}

	if (data instanceof Array) {
		return stringifyArray(data);
	}

	if (data instanceof Date) {
		return `"${data.toISOString()}"`;
	}

	return stringifyObject(data);
};

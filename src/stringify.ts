const escapeCharacters = {
	92: "\\\\",
	34: '\\"',
	8: "\\b",
	12: "\\f",
	10: "\\n",
	13: "\\r",
	9: "\\t"
};

const unicodePrefix = "\\u00";

// eslint-disable-next-line no-control-regex
const reEscape = /[\x00-\x1f\x22\x5c]/g;

function escapeChar(character: string) {
	return escapeCharacters[character.charCodeAt(0)] ||
		unicodePrefix + character.charCodeAt(0).toString(16).padStart(2, "0");
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

	if (typeof data === 'function') {
		return undefined;
	}

	if (data instanceof Array) {

		if (data.length === 0) {
			return '[]';
		}

		let str = '[';

		for (let d = 0, dl = data.length; d < dl; d++) {

			str += stringify(data[d]);

			if (d < dl - 1) {
				str += ',';
			}
		}

		str += ']';

		return str;

	}

	if (data instanceof Date) {
		return `"${data.toISOString()}"`;
	}

	const keys = Object.keys(data);
	if (keys.length === 0) {

		return '{}';

	}

	let str = '{';

	for (let k = 0, kl = keys.length; k < kl; k++) {

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
};


export function addBase64(validateJS) {

	validateJS.validators.base64 = function (value, options, key, attributes) {
		if (/[^A-Z0-9+\/=]/i.test(value)) {
			return 'invalid';
		}

		return null;
	};
	validateJS.validators.base64.transform = function (value, options) {
		if ((value === null) || (value === undefined) || (value === '')) {
			return null;
		}

		return Buffer.from(value, 'base64');
	};

}

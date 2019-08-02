
export function addDataURL(validateJS) {

	validateJS.validators.dataURL = function (value, options, key, attributes) {
		if (!value) {
			return null;
		}

		if (/[^A-Z0-9+\/=]/i.test(value.split(',')[1])) {
			return 'invalid';
		}

		return null;
	};
	validateJS.validators.dataURL.transform = function (value, options) {
		if ((value === null) || (value === undefined) || (value === '')) {
			return null;
		}

		return Buffer.from(value.split(',')[1], 'base64');
	};

}

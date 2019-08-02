
export function addJSON(validateJS) {

	validateJS.validators.JSON = function (value, options, key, attributes) {
		if ((value === null) || (value === undefined) || (value === '')) {
			return null;
		}

		if (typeof value == 'object') {
			return null;
		}

		if (!String(value).trim().match(/^{[\s\S]+}$/)) {
			return 'invalid: Object expected';
		}

		try {
			JSON.parse(value.trim());
		} catch (e) {
			return 'invalid: '+e.message;
		}

		return null;
	};
	validateJS.validators.JSON.transform = function (value, options) {
		if ((value === null) || (value === undefined) || (value === '')) {
			return null;
		}

		if (typeof value == 'object') {
			return value;
		}

		return JSON.parse(value.trim());
	};

}

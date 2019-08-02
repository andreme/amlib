
export function addString(validateJS) {

	validateJS.validators.String = function (value, options, key, attributes) {
		return null; // always valid
	};
	validateJS.validators.String.transform = function (value, options) {
		if ((value === null) || (value === undefined) || (value === '')) {
			return null;
		}

		return String(value).trim();
	};

}

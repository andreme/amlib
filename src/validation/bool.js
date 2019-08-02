export function addBool(validateJS) {
	const booleanValues = [true, false, 1, 0, null, '1', '0', 'On', 'Off', 'true', 'false', '', undefined];
	validateJS.validators.Bool = function (value, options, key, attributes) {
		return validateJS.validators.inclusion(value, booleanValues);
	};
	validateJS.validators.Bool.transform = function (value, options) {

		if (options.noDefault && (value === null)) {
			return null;
		}

		if ((value === false)
			|| (value === null)
			|| (value === 0)
			|| (value === '0')
			|| (value === 'Off')
			|| (value === 'false')
			|| (value === '')
			|| (value === undefined) ) {
			return false;
		}

		return true;
	};
}


export function addUUID(validateJS) {

	validateJS.validators.UUID = function (value, options, key, attributes) {
		if (!validateJS.isDefined(value)) {
			return null;
		}

		if (!String(value || '').match(/^[0-9a-f]{8}-?[0-9a-f]{4}-?[1-5][0-9a-f]{3}-?[89ab][0-9a-f]{3}-?[0-9a-f]{12}$/i)) {
			return 'is not a valid UUID';
		}

		return null;
	};

}

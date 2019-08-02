
export function addRemovers(validateJS) {

	validateJS.validators.toNull = function (value, options, key, attributes) {
	};
	validateJS.validators.toNull.transform = function (value, options) {
		return null;
	};

	validateJS.validators.toUndefined = function (value, options, key, attributes) {
	};
	validateJS.validators.toUndefined.transform = function (value, options) {
		return undefined;
	};

}

import {toInt} from '../utils';

export function addInt(validateJS) {

	validateJS.validators.Int = function (value, options, key, attributes) {
		if (value === '') {
			value = null;
		}

		return validateJS.validators.numericality(value, {onlyInteger: true, greaterThanOrEqualTo: 0, ...options});
	};
	validateJS.validators.Int.transform = function (value, options) {
		return toInt(value);
	};

}

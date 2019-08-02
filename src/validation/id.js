import {toInt} from '../utils';

export function addID(validateJS) {
	validateJS.validators.ID = function (value, options, key, attributes) {
		if (value === '') {
			value = null;
		}

		const numOptions = {
			onlyInteger: true,
			greaterThan: options.allowNegative ? undefined : 0,
			...options,
		};

		return validateJS.validators.numericality(value, numOptions);
	};
	validateJS.validators.ID.transform = function (value, options) {
		return toInt(value);
	};
}

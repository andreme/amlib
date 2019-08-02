import {createSubmissionError} from './errors';
import _ from 'lodash';

let validateJS;

export function setValidateJS(_validateJS) {
	validateJS = _validateJS;
}

let submissionErrorLogger = null;

export function setSubmissionErrorLogger(func) {
	submissionErrorLogger = func;
}

function checkValues(validator) {
	return (values, options) => {
		let errors = validator(values, options);
		if (Object.keys(errors).length) {
			const error = createSubmissionError(errors);
			if (submissionErrorLogger) {
				submissionErrorLogger(errors);
			}
			error.message = error.message+': '+JSON.stringify(errors);
			throw error;
		}

		return values;
	};
}

export function createValidator(constraints) {
	const validator = function (values, options) {
		return validate(values, constraints, options);
	};

	validator.constraints = constraints;
	validator.transform = (values, options) => {
		return transform(values, constraints, options);
	};

	validator.checkTransform = function (options, values) {
		return validateCheckTransform(validator, options)(values);
	};

	return validator;
}

function trimStrings(values) {
	return _.cloneDeepWith(values, value => {
		if (typeof value === 'string') {
			value = value.trim();

			return value === '' ? null : value;
		}

		return undefined;
	});
}

export function validate(values, constraints, options = {}) {
	values = trimStrings(values);

	let errors = (validateJS(values, constraints, {fullMessages: false, ...options}) || {});

	const result = {};
	for (let f of Object.keys(errors)) {
		errors[f] = errors[f][0];
		_.set(result, f, errors[f][0].toUpperCase()+errors[f].substr(1));
	}

	return result;
}

export function transform(values, constraints, options) {
	if (constraints === undefined) {
		throw new Error('Constraints not defined');
	}

	const v = trimStrings(values);

	const results = validateJS.runValidations(v, constraints, options || {}).map(r => _.pick(r, ['attribute', 'validator', 'options']));

	for (let r of results) {
		let trans = validateJS.validators[r.validator].transform;
		if (trans) {
			v[r.attribute] = trans(v[r.attribute], r.options, r.attribute, values);
			if (v[r.attribute] === undefined) {
				delete v[r.attribute];
			}
		}
	}

	return _.pick(v, _.keys(constraints));
}

export function validateCheckTransform(validator, options) {
	return (values) => {
		values = _.cloneDeepWith(_.pickBy(values, v => v !== ''), value => value === '' ? null : value);

		checkValues(validator)(values, options);

		return transform(values, validator.constraints, options);
	};
}

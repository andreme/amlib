
export function addArray(validateJS, transform, name = 'array') {

	function isElementEmpty(el, options) {
		return (options.isElementEmpty || validateJS.isEmpty)(el);
	}

	validateJS.validators[name] = function (value, options, key, attributes, globalOptions) {

		if (validateJS.isEmpty(value)) {
			value = [];
		}

		if (!validateJS.isArray(value)) {
			return {_error: 'is not an array'};
		}

		if (!validateJS.isHash(options.plain) && !validateJS.isHash(options.object)) {
			throw new Error('Plain or Object option is missing');
		}

		if (options.plain && options.object) {
			throw new Error('Plain and Object can\'t both be specified');
		}

		const preserveEmptyElements = !!options.preserveEmptyElements;

		let error = [];

		for (const option of Object.keys(options)) {
			switch (option) {
				case 'plain':
					value.forEach((el, index) => {
						if (!preserveEmptyElements && isElementEmpty(el, options)) {
							return;
						}

						const elementErrors = (validateJS.single(el, options.plain, globalOptions) || []);

						elementErrors.forEach(err => {
							error.push({
								expand: (base, errorObj) => {
									return validateJS.extend({}, base, {
										attribute: base.attribute + '[' + index + ']',
										error: '^' + err,
									});
								},
							});
						});
					});
					break;
				case 'object':
					value.forEach((el, index) => {
						if (!preserveEmptyElements && isElementEmpty(el, options)) {
							return;
						}

						const allElementErrors = (validateJS(el, options.object, {fullMessages: false, ...globalOptions}) || {});

						for (let prop of Object.keys(allElementErrors)) {
							const elementErrors = allElementErrors[prop];
							elementErrors.forEach(err => {
								error.push({
									expand: (base, errorObj) => {
										return validateJS.extend({}, base, {
											attribute: base.attribute + '[' + index + '].' + prop,
											error: '^' + err,
										});
									},
								});
							});
						}
					});
					break;
			}
		}

		if (options.length && !error.length) {
			const arrayLength = preserveEmptyElements ? value.length : value.filter(el => !isElementEmpty(el, options)).length;

			const elementName = (options.elementName || 'element');

			if (options.length.is) {

				if (arrayLength != options.length.is) {
					return {_error: 'does not have ' + options.length.is + ' ' + elementName + (options.length.is != 1 ? 's' : '')};
				}
			}

			if (options.length.min) {
				if (arrayLength < options.length.min) {
					return {_error: 'does not have at least ' + options.length.min + ' ' + elementName + (options.length.min != 1 ? 's' : '')};
				}
			}

			if (options.length.max) {
				if (arrayLength > options.length.max) {
					error = {_error: 'has more than ' + options.length.max + ' ' + elementName + (options.length.max != 1 ? 's' : '')};
				}
			}
		}


		return error;
	};

	validateJS.validators[name].transform = function (value, options) {
		if (validateJS.isEmpty(value) && !Array.isArray(value)) {
			return (options && options.returnArrayForEmpty) ? [] : null;
		}

		if (options && options.object) {
			value = value
				.map(el => isElementEmpty(el, options) ? null : transform(el, options.object));
		}

		if (options && options.plain) {
			value = value.map(el => {
				return transform({val: el}, {val: options.plain}).val;
			});
		}

		if (!options || !options.preserveEmptyElements) {
			value = value.filter(el => !isElementEmpty(el, options));
		}

		return value;
	};

	validateJS.expandMultipleErrors = function (errors) {
		const ret = [];
		errors.forEach(function (error) {
			if (validateJS.isArray(error.error)) {
				error.error.forEach((msg) => {
					if (msg.expand) {
						ret.push(msg.expand(error, msg));
					} else {
						ret.push(validateJS.extend({}, error, {error: msg}));
					}
				});
			} else {
				ret.push(error);
			}
		});
		return ret;
	};

}

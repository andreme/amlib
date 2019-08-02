
export function addArray(validateJS, transform, name = 'array') {

	validateJS.validators[name] = function (value, options, key, attributes, globalOptions) {

		if (validateJS.isEmpty(value)) {
			value = [];
		}

		if (!validateJS.isArray(value)) {
			return '^is not an array';
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
						if (!preserveEmptyElements && validateJS.isEmpty(el)) {
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
						if (!preserveEmptyElements && validateJS.isEmpty(el)) {
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
				case 'length':
					const arrayLength = preserveEmptyElements ? value.length : value.filter(el => !validateJS.isEmpty(el)).length;

					const elementName = (options.elementName || 'element');

					if (options.length.is) {

						if (arrayLength != options.length.is) {
							error.push('^does not have ' + options.length.is + ' ' + elementName + (options.length.is != 1 ? 's' : ''));
						}
					}

					if (options.length.min) {
						if (arrayLength < options.length.min) {
							error.push('^does not have at least ' + options.length.min + ' ' + elementName + (options.length.min != 1 ? 's' : ''));
						}
					}

					if (options.length.max) {
						if (arrayLength > options.length.max) {
							error.push('^has more than ' + options.length.max + ' ' + elementName + (options.length.max != 1 ? 's' : ''));
						}
					}
					break;
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
				.map(el => validateJS.isEmpty(el) ? null : transform(el, options.object));
		}

		if (options && options.plain) {
			value = value.map(el => {
				return transform({val: el}, {val: options.plain}).val;
			});
		}

		if (!options || !options.preserveEmptyElements) {
			value = value.filter(el => !validateJS.isEmpty(el));
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

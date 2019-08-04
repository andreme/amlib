
export function addDataURL(validateJS) {

	validateJS.validators.dataURL = function (value, options, key, attributes) {
		if (!value) {
			return null;
		}

		// TODO check for ^data: ?

		if (/[^A-Z0-9+\/=]/i.test(value.split(',')[1])) {
			return 'invalid';
		}

		return null;
	};
	validateJS.validators.dataURL.transform = function (value, options) {
		if ((value === null) || (value === undefined) || (value === '')) {
			return null;
		}

		const split = value.split(',');

		if (options.extended) {
			return {
				mime: split[0].replace(/^data:/, '').replace(/;base64$/, ''),
				data: Buffer.from(split[1], 'base64')
			};
		}

		return Buffer.from(split[1], 'base64');
	};

}

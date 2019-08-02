import addressparser from 'addressparser';

export function fixEmail(validateJS) {

	const origEmailValidator = validateJS.validators.email;


	validateJS.validators.email = function (value, options, key, attributes) {
		if (!value) {
			return origEmailValidator.call(origEmailValidator, value, options, key, attributes);
		}

		const addresses = addressparser(String(value));

		return addresses.reduce((result, {address}) => {
			if (result) {
				return result;
			}

			result = origEmailValidator.call(origEmailValidator, address, options, key, attributes);
			if (result) {
				return '^'+address+' '+result;
			}

			return null;
		}, null);
	};
	validateJS.validators.email.transform = function (value, options) {
		if ((value === null) || (value === undefined) || (value === '')) {
			return null;
		}

		return addressparser(String(value)).map(({address}) => address).join(';');
	};

}

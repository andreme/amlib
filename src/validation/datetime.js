export function fixDateTime(validateJS) {

	validateJS.extend(validateJS.validators.datetime, {
		// The value is guaranteed not to be null or undefined but otherwise it
		// could be anything.
		parse: function(value, options) {
			return new Date(value);
		},
		// Input is a unix timestamp
		format: function(value, options) {
			return (new Date(value)).toISOString().substring(0, 10);
		}
	});

}

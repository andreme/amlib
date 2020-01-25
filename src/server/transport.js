import {isSubmissionError, isUserError} from '../errors';

export function getExtraUserInfo(error) {
	return error.extraUserInfo ? `\n\n${error.extraUserInfo}` : '';
}

export function errorHandlerMiddleware(handleErrorStart, handleError, isDevelopment) {

	return async (ctx, next) => {

		function prepareError(error) {
			let result;

			if (handleErrorStart) {
				result = handleErrorStart(error, ctx);
				if (result) {
					return result;
				}
			}

			if (isSubmissionError(error)) {
				return {
					ErrorType: 'SubmissionError',
					Errors: error.errors,
				};
			}

			if (isUserError(error)) {
				return {
					ErrorType: 'UserError',
					Error: error.message+getExtraUserInfo(error),
					Code: error.code,
				};
			}

			result = handleError(error, ctx);
			if (result) {
				return result;
			}

			return {
				ErrorType: 'Error',
				Error: (isDevelopment ? error.message : `Internal Server Error.`),
			};
		}

		try {
			await next();
		} catch (e) {
			const errorResult = prepareError(e, ctx);

			if (ctx.accepts(['json', 'html']) === 'json') {
				ctx.body = errorResult;
			} else {
				ctx.body = 'Error: '+errorResult.Error;
				ctx.status = isUserError(e) ? 200 : 500;
			}
		}
	};
}

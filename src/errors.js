
export class UserError extends Error {

	constructor(message, fileName, lineNumber) {
		super(message, fileName, lineNumber);
		if (!this.message) {
			this.message = message; // fixes missing message in Edge
		}
		this._isUserError = true; // x instanceof UserError does not work due to babel transforms
	}

	static fromError(e) {
		return new UserError(e.message);
	}
}

export class NotImplementedError extends UserError {

	constructor(message, fileName, lineNumber) {
		super('Feature is not yet implemented: '+message, fileName, lineNumber);
	}

}

export class ReportTooBigError extends UserError {

	constructor(message, fileName, lineNumber) {
		super('Report too big. Please use the filters to reduce the size.', fileName, lineNumber);
	}

}

export class ConnectionError extends Error {

	constructor(message) {
		super(message);
		this.name = 'ConnectionError';
		this.message = message;
	}

}

export class SubmissionError extends Error {

	constructor(errors) {
		super('Submit Validation Failed');
		this.errors = errors;
	}

}

let submissionErrorClass = SubmissionError;
export function setSubmissionErrorClass(cls) {
	submissionErrorClass = cls;
}

export function createSubmissionError(errors) {
	return new submissionErrorClass(errors);
}

export function isSubmissionError(error) {
	return (error && (
		(error.name == submissionErrorClass.name)
		|| (error.name == 'SubmissionError')
		|| (error.name == SubmissionError.name)
		|| (error instanceof SubmissionError)
	));
}

export function isUserError(error) {
	return (error && (
		error._isUserError
		|| (error instanceof UserError)
		|| (error.name == 'UserError')
	));
}

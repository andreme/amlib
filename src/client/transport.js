import {ConnectionError, createSubmissionError, isSubmissionError, isUserError, UserError} from '../errors';

let errorLogger = console.log;

let sendCredentials = false;

export function setErrorLogger(func) {
	errorLogger = func;
}

export function setSendCredentials(value) {
	sendCredentials = !!value;
}

export async function checkURLExists(URL) {
	const axios = require('axios');

	try {
		await axios({
			method: 'HEAD',
			url: URL,
		});

		return true;
	} catch (e) {
		return false;
	}
}


async function doFetch(input, init) {
	// if (true) {
	const axios = require('axios');

	const response = await axios({
		method: init.method,
		url: input,
		data: init.body,
		headers: init.headers,
		withCredentials: sendCredentials,
	});

	if (typeof response.data !== 'object') {
		const e = new Error('Expected JSON, but received '+typeof response.data);
		e.extraInfo = {
			responseHead: String(response.data).substr(0, 200),
		};

		throw e;
	}

	return response.data;
	// } else {
	// 	const response = fetch(input, init);
	//
	// 	if ((response.status != 200) && (response.status != 304)) {
	// 		throw new Error(response.status+' - '+response.statusText);
	// 	}
	//
	// 	const responseForError = response.clone();
	// 	try {
	// 		return await response.json();
	// 	} catch (e) {
	// 		e.extraInfo = {
	// 			responseHead: String(await responseForError.text()).substr(0, 200),
	// 		};
	//
	// 		throw e;
	// 	}
	// }
}

export async function fetchJSON(input, init = {}) {
	const _init = {
		...init,
		headers: {
			...init.headers,
			Accept: 'application/json',
		},
		method: init.method || 'GET',
	};

	let retryCounter = (((_init.method == 'GET') || _init.canRetry) ? 3 : 0);
	let retryDelay = 0;

	const retryFetch = async () => {
		try {
			const response = await doFetch(input, _init);
			checkResponseForError(response);

			return response;
		} catch (error) {
			if ((error.message == 'Failed to fetch')
				|| String(error.message).match(/NetworkError when attempting to fetch resource/)
				|| String(error.message).match(/Network request failed/)
				|| String(error.message).match(/Network Error/)
				|| ((error.response || {}).status == 502)
				|| ((error.response || {}).status == 504)
			) {
				if (retryCounter > 0) {
					retryCounter--;
					retryDelay += 500;

					return new Promise((resolve) => {
						setTimeout(() => resolve(retryFetch()), retryDelay);
					});
				}

				const logErr = new ConnectionError('Failed to fetch');
				logErr.extraInfo = {
					URL: input,
					OriginalError: error.message,
				};
				errorLogger(logErr);

				throw error;
			}

			if (!isUserError(error) && !isSubmissionError(error)) {
				error.extraInfo = {
					...(error.extraInfo || {}),
					URL: input
				};
				errorLogger(error);
			}

			throw error;
		}
	};

	return retryFetch();
}

export function postJSON(URL, values) {
	const { canRetry, ...bodyValues } = (values || {});
	return fetchJSON(URL, {
		method: 'POST',
		body: JSON.stringify(bodyValues),
		headers: {
			'Content-Type': 'application/json',
		},
		canRetry,
	});
}

function checkResponseForError(res) {
	switch (res.ErrorType) {
		case 'SubmissionError':
			throw createSubmissionError(res.Errors);
		case 'UserError':
			throw new UserError(res.Error);
		case 'Error':
			const error = new Error(res.Error);
			error.version = res.Version;
			throw error;
		default:
			if (res.ErrorType) {
				throw new Error('Unknown error: '+res.ErrorType);
			}
	}
}

function encodeQueryData(obj, keyPrefix) {
	switch (typeof(obj)) {
		case "object":
			let segs = [];
			let thisKey;
			for (const key in obj) {

				if (!obj.hasOwnProperty(key)) continue;
				let val = obj[key];

				if (typeof(key) === "undefined" || key.length === 0 || typeof(val) === "undefined" || (val !== null && val !== '' && val.length === 0)) continue;

				thisKey = keyPrefix ? keyPrefix+"["+key+']' : key;

				if (typeof obj.length !== "undefined") {
					thisKey = keyPrefix ? keyPrefix+"["+key+"]" : key;
				}

				if (val === null) {
					segs.push(encodeURIComponent(thisKey)+"=");
				} else if (typeof val === "object") {
					segs.push(encodeQueryData(val, thisKey));
				} else {
					segs.push(encodeURIComponent(thisKey)+"="+encodeURIComponent(val));
				}
			}
			return segs.join("&");
	}

	return encodeURIComponent(obj);
}

export function getQueryString(data) {
	const qs = encodeQueryData(data);
	return qs ? '?'+qs : '';
}

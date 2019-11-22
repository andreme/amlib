
export async function mapAsync(arr, cb) {
	if (!Array.isArray(arr)) {
		return arr;
	}

	const result = new Array(arr.length);

	for (let i = 0; i < result.length; i++) {
		result[i] = await cb(arr[i], i);
	}

	return result;
}

export async function filterAsync(arr, cb) {
	if (!Array.isArray(arr)) {
		return arr;
	}

	const result = [];

	for (let i = 0; i < arr.length; i++) {
		if (await cb(arr[i], i)) {
			result.push(arr[i]);
		}
	}

	return result;
}

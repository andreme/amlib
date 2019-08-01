export function toInt(value) {
	if (value === null || value === undefined || value === "") {
		return null;
	}

	return parseInt(value, 10);
}

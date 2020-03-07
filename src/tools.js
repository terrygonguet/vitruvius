/**
 * Returns an iterator going from `from` to `to` or over the length
 * of the array if it is the only parameter
 * @param {number|any[]} from start of the range or an array
 * @param {number=} to end of the range (inclusive, optional)
 * @param {number=} step defaults to 1
 */
export function* range(from, to, step = 1) {
	let isarray = Array.isArray(from),
		f = isarray ? 0 : from,
		t = isarray ? from.length - 1 : to
	for (let i = f; i <= t; i += step) yield isarray ? [from[i], i] : i
}

/**
 * Returns an accessor
 * @param {string} propName
 */
export function _(propName) {
	return function(obj) {
		return obj[propName]
	}
}

/**
 * Returns the optimal board dimensions for the current screen
 */
export function getBoardDimensions() {
	let width = innerHeight / 2.3,
		height = 2 * width,
		cell = width / 10
	return { width, height, cell }
}

/**
 * Clamps the first value between the given values
 * @param {number} val
 * @param {number} min
 * @param {number} max
 */
export function clamp(val, min, max) {
	if (val < min) return min
	else if (val > max) return max
	else return val
}

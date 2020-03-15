class Data extends Map {
	static isComponent = true

	reset() {
		this.clear()
	}

	/**
	 * @param {Map|any[][]|Object} other
	 */
	copy(other) {
		this.reset()
		if (Array.isArray(other)) for (const [k, v] of other) this.set(k, v)
		else if (other instanceof Map)
			for (const [k, v] of other.entries()) this.set(k, v)
		else for (const [k, v] of Object.entries(other)) this.set(k, v)
	}
}

export default Data

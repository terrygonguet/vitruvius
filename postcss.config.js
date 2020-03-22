const cssnano = require("cssnano")({
	preset: "default",
})
const dev = process.env.NODE_ENV != "production"

module.exports = {
	plugins: [
		require("tailwindcss"),
		require("autoprefixer"),
		!dev && cssnano,
	].filter(Boolean),
}

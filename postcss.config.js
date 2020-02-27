const purgecss = require("@fullhuman/postcss-purgecss")({
	content: ["dist/**/*.html"],
	defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
})
const cssnano = require("cssnano")({
	preset: "default",
})

module.exports = {
	plugins: [
		require("tailwindcss"),
		require("autoprefixer"),
		...(process.env.NODE_ENV === "production" ? [purgecss, cssnano] : []),
	],
}

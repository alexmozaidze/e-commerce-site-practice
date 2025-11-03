import { I18nPlugin } from "@11ty/eleventy";
import * as sass from "sass";
import path from "path";
import iso639 from "iso-639-1";

export default async function(eleventyConfig) {
	eleventyConfig.setOutputDirectory("public");
	eleventyConfig.setInputDirectory("src");
	eleventyConfig.addPlugin(I18nPlugin, { defaultLanguage: "en" });
	eleventyConfig.addTemplateFormats("scss");
	eleventyConfig.addExtension("scss", {
		outputFileExtension: "css",
		permalink: "raw",

		// opt-out of Eleventy Layouts
		useLayouts: false,

		compile: async function(inputContent, inputPath) {
			let parsed = path.parse(inputPath);
			// Don’t compile file names that start with an underscore
			if (parsed.name.startsWith("_")) {
				return;
			}

			let result = sass.compileString(inputContent, {
				style: "compressed",
				loadPaths: [parsed.dir || ".", this.config.dir.includes],
			});

			// Map dependencies for incremental builds
			this.addDependencies(inputPath, result.loadedUrls);

			return async (_) => result.css;
		},
	});
	eleventyConfig.addFilter("langToLabel", async lang => iso639.getNativeName(lang));

	["src/scripts", "src/static"].forEach((path) =>
		eleventyConfig.addPassthroughCopy(path),
	);

	["src/scripts/**"].forEach((glob) => eleventyConfig.addWatchTarget(glob));
}

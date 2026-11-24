import { t as __exportAll } from "./rolldown-runtime_D8jQpDG7.mjs";
import { C as renderComponent, k as renderTemplate } from "./sequence_CO-k8VTm.mjs";
import { t as createAstro } from "./compiler_CYpVFMWX.mjs";
import { f as createComponent } from "./Layout_jVtE8bOu.mjs";
import { t as $$Article } from "./Article_TwhG060b.mjs";
import { s as onePerSlug, t as resolveLocalizedPost } from "./localizedPost_B9cWeozL.mjs";
import { b as listAllPosts } from "./cache_aVoJa3Tr.mjs";
// src/pages/en/[slug].astro
var _slug__exports = /* @__PURE__ */ __exportAll({
	default: () => $$Slug,
	file: () => $$file,
	url: () => $$url
});
createAstro("https://blog.tracht-digital.de");
var $$Slug = createComponent(async ($$result, $$props, $$slots) => {
	const Astro = $$result.createAstro($$props, $$slots);
	Astro.self = $$Slug;
	const { slug } = Astro.params;
	const localized = await resolveLocalizedPost(slug, "en");
	if (!localized) return new Response(null, { status: 404 });
	const posts = onePerSlug(await listAllPosts(), "en");
	return renderTemplate`${renderComponent($$result, "Article", $$Article, {
		"localized": localized,
		"lang": "en",
		"posts": posts
	})}`;
}, "/home/runner/work/tds-blog-frontend/tds-blog-frontend/src/pages/en/[slug].astro", void 0);
var $$file = "/home/runner/work/tds-blog-frontend/tds-blog-frontend/src/pages/en/[slug].astro";
var $$url = "/en/[slug]";
// \0virtual:astro:page:src/pages/en/[slug]@_@astro
var page = () => _slug__exports;
export { page };

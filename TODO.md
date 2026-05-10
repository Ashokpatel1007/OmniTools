# OmniTools Fix Plan

## Completed
- [ ] Audit dynamic route params usage in `src/app`.

## Next
- [ ] Update `src/app/[category]/[tool]/page.tsx`:
  - [ ] Fix `generateMetadata` to treat `params` as `Promise` and `await` it.
  - [ ] Ensure the page component awaits `params` before accessing `category`/`tool`.
- [ ] Update `src/app/[category]/page.tsx`:
  - [ ] Fix `generateMetadata` to treat `params` as `Promise` and `await` it.
  - [ ] Fix the page component to treat `params` as `Promise` and `await` it.
- [ ] Re-run TypeScript typecheck.
- [ ] Re-run Next dev/build to confirm no `params is a Promise` runtime errors.
- [ ] Inspect for hydration mismatch sources (Date.now/Math.random/localStorage/etc.) and stabilize any server-render output.


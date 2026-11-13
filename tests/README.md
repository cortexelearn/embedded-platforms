Place this directory's contents in `<repo>/tests/`. Every script resolves the course root relative to itself, so either working directory works:

```sh
node tests/run-node.mjs
cd tests
node run-node.mjs
```

The Node suite runs extraction, quiz/exam bounds (1,000 seeds per pool), deterministic equivalence, raw markers, worker isolation, progress, and Safari checks. It uses built-ins; optional esbuild enables actual renderInline evaluation and a Safari 15 transform. esbuild and puppeteer-core resolve locally, or from the node_modules directory explicitly supplied by `COURSE_TEST_NODE_MODULES`. No packages or browsers are downloaded. Failures exit nonzero; optional checks print SKIP. The runner continues after failures. No results or app changes are written.

`extract.mjs` exports readHTML, script, extract, hash, functions (a seeded attempt builder), and safeFunction. Arrays are evaluated in isolated VM contexts without running the app. SHA256 hashes use JSON serialization of each extracted array, without normalization; compare the 14 named hashes across repositories to establish identity. The self-check emits all hashes. This template has no parent course files, so the Node suite is intended to run after placement in a course repo.

`exam.seeded-equivalence.mjs` records repo, HEAD commit, array hash, seed, and attempt hash for all seven pools. HEAD determinism is mandatory. The optional baseline is `git show calloutfix-revA:index.html`, or `COMPARE_REPO=/absolute/sibling/repo`. Matching uses question text first, then source position for wording changes. Reordering options and changing correct indices is allowed when the keyed answer string remains identical. If the old keyed string is still among the options but a different option becomes keyed, the test fails. Changed/dropped answer text that cannot be resolved by identity is emitted as structured `judgmentRequired` data, not a semantic-equivalence claim or an automatic failure: intentional later wording edits require review. Review these records before accepting an F-22 equivalence result. Missing baselines skip only that comparison.

Browser tests require `/usr/bin/google-chrome`, puppeteer-core, and local pinned React/Babel fixtures. Set `COURSE_TEST_FIXTURES=/absolute/fixtures` (default `<repo>/tests/fixtures`) containing `react.js`, `react-dom.js`, `babel.js`, and `versions.json` with top-level `react`, `react-dom`, and `@babel/standalone` keys containing exact `major.minor.patch` versions (React 18 and Babel 7); React and ReactDOM versions must match. Additional provenance fields are allowed. Use compatible React 18 UMD and Babel 7 standalone files. Obtain fixtures separately; tests never fetch them. Browser host resolution blocks external network access, including worker requests. Every non-local page request is aborted except the three unpkg script paths, fulfilled from these files. The native Babel smoke serves unmodified HTML. Other tests instrument only served copies to expose exam attempts or inject a real null.content render crash. None change disk content.

```sh
node tests/render.raw-and-quiz.mjs
node tests/exam.pass-path.mjs
node tests/progress.load-matrix.mjs
node tests/runtime.babel-smoke.mjs
node tests/crash-reset.mjs
node tests/sw.shared-origin-e2e.mjs
```

All browser files skip successfully if dependencies or fixtures are absent. The raw scan runs at 1280 and 390, reveals all three lesson quizzes and submits an exam. Literal code blocks are excluded from prose marker scanning. Static paths identify array/item/field and an approximate source line (first exact occurrence). RenderInline checks run only with esbuild; plain fields always run. AI/MBA implicit correct=0 and string P1–P4 phases are recognized as legacy schema, but the requested 40% key-balance guard still applies and currently fails those pools.

The progress matrix deliberately asserts P3 corruption retention and P4 no transient empty save, so current behavior may fail; it does not implement a product fix. P10 is explicitly skipped in the matrix; crash-reset separately injects a real lesson render failure, captures the reload, and checks the actual removeItem calls and preserved sibling/preferences keys. Browser runtime behavior has not been verified without the pinned fixtures.

For real shared-origin worker testing, set `COURSE_SW_REPOS` to a JSON object with exactly seven URL mount names mapped to absolute existing repo directories. It visits all seven under one loopback origin, leaves service workers enabled, serves one version bump from memory, checks sibling caches, and makes the local server refuse requests before reloading offline with each track's own title and mounted app. Only local files are read. This test can expose missing offline CDN support; request-intercepted fixtures do not guarantee worker runtime caching. Normal single-track browser tests block worker registration for isolation.

No scheduled live checks are implemented; network checks are off. Safari scanning rejects lookbehind, named groups and the v flag, with an additional optional esbuild safari15 transform. Its small literal lexer skips strings/comments and is conservative around JSX and template expressions; the transform supplements it but does not prove every runtime API is supported by Safari 15.

// This file's actual code does not run (Turbopack dev appears to require a
// file to exist at this path for middleware to be wired up at all when a
// `src/app` directory is present, independent of which middleware.ts's
// logic actually executes — confirmed empirically: root middleware.ts's
// locale rewrite only takes effect when this file also exists, with or
// without a cleared .next cache, regardless of this file's own content).
// The real implementation lives in the project root ../middleware.ts —
// re-exported here so there's only one copy of the logic to maintain.
export { default, config } from "../middleware"

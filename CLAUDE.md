## QA guidelines

Run these commands before committing the code, and any time you want to check that your changes are correct: `bun run check` and `bun run test`.

Strictly follow the linter, formatter and type checker, ensuring there are 0 issues.

To auto-fix linting and formatting issues, run `bun run fix`

There are also end-to-end tests, run them with `bun run test:e2e`

## Package management

Do not install or change dependencies by modifying the package.json directly. Instead, do it by running CLI commands.

Prefer explicit dependency versions instead of "*" versions.

<!-- effect-solutions:start -->
## Effect Best Practices

**IMPORTANT:** Always consult effect-solutions before writing Effect code.

1. Run `effect-solutions list` to see available guides
2. Run `effect-solutions show <topic>...` for relevant patterns (supports multiple topics)
3. Search `~/.local/share/effect-solutions/effect` for real implementations

Topics: quick-start, project-setup, tsconfig, basics, services-and-layers, data-modeling, error-handling, config, testing, cli.

Never guess at Effect patterns - check the guide first.
<!-- effect-solutions:end -->


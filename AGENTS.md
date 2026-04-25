## QA guidelines

Run these commands before committing the code, and any time you want to check that your changes are correct: `bun run check` and `bun run test`.

Strictly follow the linter, formatter and type checker, ensuring there are 0 issues.

To auto-fix linting and formatting issues, run `bun run fix`

There are also end-to-end tests, run them with `bun run test:e2e`

### Creating tests

Unit tests should live in a file with the naming convention `<file-name>.spec.ts`, located in the same directory as the original file, next to it.

Unit tests with Vitest.

## Package management

Do not install or change dependencies by modifying the package.json directly. Instead, do it by running CLI commands.

Prefer explicit dependency versions instead of "\*" versions.

## Best practices

Add TSDoc to the code exhaustively. The TSDoc should explain the purpose of each part of the code. Add TSDoc to classes, functions, variables and properties. Do not include the types of the arguments and return types in the TSDoc of functions, this is not necessary because we use TypeScript. Use these TSDoc annotations: @param and @returns
In functions with more than 1 argument, prefer named arguments to positional arguments. For named arguments, create an interface whose name ends with “Options”, that contains the arguments.
TypeScript best practices:

- avoid using `any`,
- avoid using `as` operator,
- avoid `!` operator.
  Effect best practices:
- In general, avoid the methods that end with “Sync”, because they don’t return an effect. Instead, if a method has ends with “Sync” and another that does not end wit “Sync”, prefer the one that does not end with “Sync”. In general, if a method has an effectual version and a non-effectful version, always choose the effectful version.

## Effect best practices

- Use Effect’s types, utilities and built-ins throughout the application. Use it in the client and on the server.
- Use Effect for dependency injection.
- Use Effect for error type safety.
- Use Effect Schema for defining data types.
- Use Effect Schema for JSON encoding and decoding.

### Error management with Effect

Functions should return an Effect.

Any function or method that you write, consider what errors the code can throw. The type of the Effect should reflect these errors.

This means that, if the function interfaces with a certain library or API, and the library and API can throw an error, then the Effect code should capture this error so it gets reflected in the Effect's type. This is especially true when interacting with external APIs and databases.

If you capture an error from an external API, do not declare it as unknown or as a generic error. Create a specific error for that type of external API. Use `Schema.TaggedErrorClass` or `Schema.TaggedError` for defining new types of errors. The defined error should include any relevant properties, and an instance of the original error thrown by the external API (when applicable).

<!-- effect-solutions:start -->

## Effect Best Practices

**IMPORTANT:** Always consult effect-solutions before writing Effect code.

1. Run `effect-solutions list` to see available guides
2. Run `effect-solutions show <topic>...` for relevant patterns (supports multiple topics)
3. Search `~/.local/share/effect-solutions/effect` for real implementations

Topics: quick-start, project-setup, tsconfig, basics, services-and-layers, data-modeling, error-handling, config, testing, cli.

Never guess at Effect patterns - check the guide first.

<!-- effect-solutions:end -->

# @konitif/widgets

Widget definitions and explicit implementation bindings, independent of any
application, UI framework or hosting environment.

## What it provides

- An instance-scoped catalog of immutable widget definitions.
- Explicit bindings from a registered definition to an implementation loader.
- Lazy loading: declaring or binding a widget does not load or mount it.
- Rejection of duplicate identifiers, unknown references and invalid loaders.

The package does not render widgets, manage their instances or own application
state. Your application chooses how to load, mount, persist and dispose them.
There are no runtime dependencies or DOM requirements.

## Usage

```ts
import { WidgetDefinitionCatalog, bindWidgetImplementation } from '@konitif/widgets';

const catalog = new WidgetDefinitionCatalog();
catalog.register({
  id: 'example.counter',
  title: 'Counter',
  description: 'A counter contribution'
});

const binding = bindWidgetImplementation(
  catalog,
  'example.counter',
  async () => ({ initialValue: 0 })
);

// The loader runs only when explicitly called.
const implementation = await binding.load();
```

The binding retains the catalog's definition. Loading does not imply mounting,
caching or lifecycle management; those choices belong to the caller.

## Entry points

`@konitif/widgets` and `@konitif/widgets/definition` expose the same contract.
Both provide JavaScript ESM and TypeScript declarations. CommonJS is not supported.

## Development

With the locked TypeScript 5.9.3 compiler already installed:

```sh
npm run build
npm test
npm run verify:package
```

Verification builds a fresh archive and checks standalone ESM and TypeScript
consumers. It does not install tools or publish the package. Distributed files
are explicitly selected; tests, build tooling and host adapters are not included.

## License

Source-available under PolyForm Noncommercial 1.0.0; not OSI open source.

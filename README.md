# @konitif/widgets

Host-independent widget definitions and explicit implementation bindings.

## Installation

```sh
npm install @konitif/widgets
```

## What it provides

- An instance-scoped catalog of immutable widget definitions.
- Explicit bindings from definitions to implementation loaders.
- Lazy loading without implicit mount or registration effects.
- Validation for duplicate identifiers, unknown references and invalid loaders.

## Authority boundary

This package owns widget definitions and their explicit implementation
references. It does not render widgets, manage instances, persist placements or
own application state. Hosts decide when and where an admitted implementation
is loaded, mounted and disposed.

## Quick start

```ts
import { WidgetDefinitionCatalog, bindWidgetImplementation } from '@konitif/widgets';

const catalog = new WidgetDefinitionCatalog();
catalog.register({
  id: 'example.counter',
  title: 'Counter',
  description: 'A counter contribution',
});

const binding = bindWidgetImplementation(
  catalog,
  'example.counter',
  async () => ({ initialValue: 0 }),
);
const implementation = await binding.load();
```

Loading an implementation does not imply mounting, caching or lifecycle
ownership.

## Public entry points

| Entry | Purpose |
| --- | --- |
| `@konitif/widgets` | Widget definitions, catalog and bindings. |
| `@konitif/widgets/definition` | Definition-focused compatibility entry. |

Both entries provide ESM JavaScript and TypeScript declarations. CommonJS is
not supported.

## Reference

See [`reference/`](reference/) for the machine-readable capability catalog and
authority diagrams.

## License

Source-available under [PolyForm Noncommercial 1.0.0](LICENSE.md), not OSI open
source. Commercial use requires separate written authorization.

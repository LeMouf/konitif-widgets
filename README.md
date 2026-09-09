# @konitif/widgets

Product-neutral widget definitions and explicit implementation bindings, independent of Workbench.

This package does not own product widgets or application state. Products provide widget definitions and components through these generic ports.

## Entry points

- `@konitif/widgets` and `@konitif/widgets/definition`: the same host-independent definitions, immutable definition catalog and explicit lazy implementation bindings. Neither entry requires Workbench or DOM imports.

### Migrating the former facade

The root no longer reexports Workbench hosting contracts. Import those same
symbols (registries, zones, placements, runtime context and docking helpers)
from `@konitif/workbench` instead. Their implementation and persisted data
formats are unchanged. `createWorkbenchWidgetAdapter` is owned and exported
by Workbench, which depends on Widgets, never the reverse.

Version 0.285.0 is the candidate for this source-level breaking change for
users of the old facade. Preparing this candidate does not publish it.

```ts
import { WidgetDefinitionCatalog, bindWidgetImplementation } from '@konitif/widgets/definition';

const catalog = new WidgetDefinitionCatalog();
catalog.register({ id: 'personal.viewer', title: 'Viewer', description: '' });
const binding = bindWidgetImplementation(catalog, 'personal.viewer', async () => ({ render() {} }));
// Binding does not load or mount the implementation.
const implementation = await binding.load();
```

The catalog owns the admitted definition. An implementation binding references that
definition; placement state, persistence and component lifecycle remain host responsibilities.

## Distribution boundary

The manifest selects source and compiled files explicitly. The Workbench adapter lives in
Workbench and is not included in Widgets. Adding a source
file does not select it for publication. These changes do not constitute a release
or approval to publish. Entrypoints expose JavaScript ESM and TypeScript
declarations; source files are included for inspection, not used as runtime entries.
CommonJS is not an advertised entry point.

From the development workspace, `npm run build:widgets` builds local outputs
using the already installed compiler. `npm run verify:widgets:package` builds
a fresh temporary candidate and tests its actual archive with standalone ESM
and TypeScript NodeNext consumers. It installs nothing and publishes nothing.

In a standalone checkout, the equivalent commands are `npm run build` and
`npm run verify:package`, with TypeScript 5.9.3 already installed. The npm
lockfile pins that compiler; neither script installs or upgrades tools.
Verification builds from source in a fresh directory, not from an old `dist`.

Source-available under PolyForm Noncommercial 1.0.0; not OSI open source.

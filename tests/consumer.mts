// Typecheck against an extracted archive without DOM or workspace aliases.
import { WidgetDefinitionCatalog, bindWidgetImplementation, type WidgetDefinition } from '@konitif/widgets';
import type { WidgetImplementationBinding } from '@konitif/widgets/definition';
const catalog = new WidgetDefinitionCatalog();
const definition: WidgetDefinition = catalog.register({ id: 'consumer.viewer', title: 'Viewer', description: '' });
const binding: WidgetImplementationBinding<number> = bindWidgetImplementation(catalog, definition.id, async () => 42);
const value: Promise<number> = binding.load();
// @ts-expect-error The canonical description is immutable.
definition.title = 'Changed';
// @ts-expect-error The binding retains its implementation type.
const invalid: Promise<string> = binding.load();
void value;
void invalid;

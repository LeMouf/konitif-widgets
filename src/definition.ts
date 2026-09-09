/** Candidate descriptive contract; placement and implementation are separate. */
export interface WidgetDefinition {
  readonly id: string;
  readonly title: string;
  readonly description: string;
}

/** An explicit catalog instance owns admission; there is no global registry. */
export class WidgetDefinitionCatalog {
  private readonly definitions = new Map<string, WidgetDefinition>();

  register(input: WidgetDefinition): WidgetDefinition {
    if (!input || typeof input.id !== 'string' || !input.id.trim() || input.id !== input.id.trim()) {
      throw new Error('Invalid widget identity');
    }
    if (typeof input.title !== 'string' || !input.title.trim() || typeof input.description !== 'string') {
      throw new Error('Invalid widget description');
    }
    if (this.definitions.has(input.id)) throw new Error(`Duplicate widget identity: ${input.id}`);
    const definition = Object.freeze({ id: input.id, title: input.title, description: input.description });
    this.definitions.set(definition.id, definition);
    return definition;
  }

  getDefinition(id: string): WidgetDefinition | undefined {
    return this.definitions.get(id);
  }

  list(): WidgetDefinition[] {
    return [...this.definitions.values()];
  }
}

export interface WidgetImplementationBinding<TImplementation> {
  readonly definition: WidgetDefinition;
  readonly load: () => Promise<TImplementation>;
}

/** Binding is not loading, mounting, resource ownership or execution admission. */
export function bindWidgetImplementation<TImplementation>(
  catalog: WidgetDefinitionCatalog,
  widgetId: string,
  load: () => Promise<TImplementation>
): WidgetImplementationBinding<TImplementation> {
  const definition = catalog.getDefinition(widgetId);
  if (!definition) throw new Error(`Unknown widget identity: ${widgetId}`);
  if (typeof load !== 'function') throw new Error('Widget implementation loader required');
  return Object.freeze({ definition, load });
}

type AnyStyles = Record<string, any>;

type RegistryEntry<T extends AnyStyles> = {
  factory: () => T;
  current: T;
};

const registry = new Set<RegistryEntry<AnyStyles>>();

/**
 * Creates a theme-refreshable styles object while keeping the familiar
 * module-scope pattern.
 *
 * Example:
 * const styles = createThemedStyleSheet(() => StyleSheet.create({
 *   container: { backgroundColor: COLORS.BACKGROUND }
 * }));
 */
export const createThemedStyleSheet = <T extends AnyStyles>(factory: () => T): T => {
  const entry: RegistryEntry<T> = {
    factory,
    current: factory(),
  };

  registry.add(entry as RegistryEntry<AnyStyles>);

  // Proxy keeps `styles.foo` stable while we swap `entry.current`.
  return new Proxy({} as T, {
    get: (_target, prop: PropertyKey) => (entry.current as any)[prop],
    ownKeys: () => Reflect.ownKeys(entry.current),
    getOwnPropertyDescriptor: (_target, prop: PropertyKey) => {
      const desc = Object.getOwnPropertyDescriptor(entry.current, prop);
      if (desc) return desc;
      return {
        configurable: true,
        enumerable: true,
        value: (entry.current as any)[prop],
        writable: false,
      };
    },
  });
};

export const refreshThemedStyleSheets = () => {
  // Only refresh if styles have been registered (components mounted).
  // Early theme changes before screens mount will have empty registry.
  if (registry.size === 0) return;

  registry.forEach(entry => {
    entry.current = entry.factory();
  });
};

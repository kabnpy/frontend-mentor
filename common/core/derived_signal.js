import { createSignal } from './signal';

/**
 * Creates a derived signal based on other signals.
 * @param {Function} computeFn - The function to compute the derived value.
 * @param {Array} dependencies - The signals this derived signal depends on.
 * @returns {Function} - Returns a function to read the derived value.
 */
export function createDerivedSignal(computeFn, dependencies) {
  const [derived, setDerived] = createSignal(computeFn());

  dependencies.forEach(dep => dep.subscribe(() => setDerived(computeFn())));

  return derived;
}
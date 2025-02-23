// signals.js

let currentEffect = null;

/**
 * @template T
 * @typedef {Object} Signal
 * @property {() => T} getValue - Get the current value of the signal
 * @property {(newValue: T) => void} setValue - Set a new value for the signal
 * @property {Set<() => void>} subscribers - Set of effect callbacks
 */

/**
 * Creates a new signal with the given initial value.
 * @template T
 * @param {T} initialValue - The initial value of the signal.
 * @returns {[() => T, (newValue: T) => void]} A tuple containing the read and write functions of the signal.
 */
export function createSignal(initialValue) {
  let value = initialValue;
  const subscribers = new Set();

  function read() {
    if (currentEffect) {
      subscribers.add(currentEffect);
    }
    return value;
  }

  function write(newValue) {
    if (value !== newValue) {
      value = newValue;
      subscribers.forEach(subscriber => subscriber());
    }
  }

  return [read, write];
}

/**
 * Creates an effect that runs when its dependencies change.
 * @param {() => void} effectFn - Function to run when dependencies change.
 */
export function createEffect(effectFn) {
  const effect = () => {
    currentEffect = effect;
    try {
      effectFn();
    } finally {
      currentEffect = null;
    }
  };
  effect();
}

/**
 * Creates a derived signal that computes its value based on other signals.
 * @template T
 * @param {() => T} computeFn - Function that computes the derived value.
 * @returns {() => T} A function that returns the current value of the derived signal.
 */
export function createDerivedSignal(computeFn) {
  const [value, setValue] = createSignal(computeFn());
  createEffect(() => setValue(computeFn()));
  return value;
}
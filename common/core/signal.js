/**
 * Creates a signal with an initial value.
 * @param {any} initialValue - The initial value of the signal.
 * @returns {Array} - Returns a tuple with the current value and a setter function.
 */
export function createSignal(initialValue) {
  let value = initialValue;
  let subscribers = new Set();

  function read() {
    return value;
  }

  function write(newValue) {
    if (value === newValue) {
      return;
    }

    value = newValue;
    subscribers.forEach((subscriber) => subscriber(value));
  }

  function subscribe(subscriber) {
    subscribers.add(subscriber);

    return () => {
      subscribers.delete(subscriber);
    };
  }

  return [read, write, subscribe];
}
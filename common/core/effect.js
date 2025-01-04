/**
 * Creates an effect that runs whenever its dependencies change.
 * @param {Function} effectFn - The effect function to run.
 * @param {Array} dependencies - The signals this effect depends on.
 */
function createEffect(effectFn, dependencies) {
  function runEffect() {
    effectFn();
  }

  dependencies.forEach(dep => dep.subscribe(runEffect));
  runEffect();
}
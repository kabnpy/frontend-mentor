/**
 * A tagged template literal for declarative UI definition.
 * @param {Array} strings - The template strings.
 * @param {Array} values - The dynamic values.
 * @returns {HTMLElement} - The resulting DOM element.
 */
function html(strings, ...values) {
  const template = document.createElement('template');
  template.innerHTML = strings.reduce((result, string, i) => {
    return result + string + (values[i] !== undefined ? values[i] : '');
  }, '');
  return template.content.cloneNode(true);
}
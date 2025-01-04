// templating.js

/**
 * Creates an HTML template using tagged template literals.
 * This function processes the tagged template literals and interpolates the values,
 * returning a DocumentFragment that can be inserted into the DOM.
 * @param {TemplateStringsArray} strings - Template string array.
 * @param {...any} values - Values to interpolate.
 * @returns {DocumentFragment} Rendered DOM element.
 */
export function html(strings, ...values) {
  const template = document.createElement('template');
  template.innerHTML = strings.reduce((result, string, i) => {
    const value = values[i];
    return result + string + (value !== undefined ? value : '');
  }, '');
  return template.content.cloneNode(true);
}
export function createAndAddElement(
  tag,
  parent,
  content = "",
  attributes = {},
  beforeElement = null
) {
  if (!(parent instanceof HTMLElement)) {
    console.error("Le parent fourni n'est pas un élément HTML valide.");
    return null;
  }

  const newElement = document.createElement(tag);

  if (content !== null && content !== undefined) {
    newElement.textContent = String(content);
  }

  for (const key in attributes) {
    if (Object.prototype.hasOwnProperty.call(attributes, key)) {
      newElement.setAttribute(key, attributes[key]);
    }
  }

  if (beforeElement && parent.contains(beforeElement)) {
    parent.insertBefore(newElement, beforeElement);
  } else {
    parent.appendChild(newElement);
  }

  return newElement;
}

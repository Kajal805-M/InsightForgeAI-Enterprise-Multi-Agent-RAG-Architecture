export function Spinner(className = 'h-4 w-4'): HTMLElement {
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('class', `animate-spin ${className}`);
  svg.setAttribute('xmlns', svgNS);
  svg.setAttribute('fill', 'none');
  svg.setAttribute('viewBox', '0 0 24 24');

  const circle = document.createElementNS(svgNS, 'circle');
  circle.setAttribute('class', 'opacity-25');
  circle.setAttribute('cx', '12');
  circle.setAttribute('cy', '12');
  circle.setAttribute('r', '10');
  circle.setAttribute('stroke', 'currentColor');
  circle.setAttribute('stroke-width', '4');

  const path = document.createElementNS(svgNS, 'path');
  path.setAttribute('class', 'opacity-75');
  path.setAttribute('fill', 'currentColor');
  path.setAttribute('d', 'M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z');

  svg.appendChild(circle);
  svg.appendChild(path);

  return svg as unknown as HTMLElement;
}

/**
 * Reusable Skeleton loader for the UI
 */
export function Skeleton(className: string = ''): string {
  // Uses Tailwind's animate-pulse to create a loading skeleton effect
  return `<div class="animate-pulse bg-[hsl(var(--muted))] rounded-md ${className}"></div>`;
}

export function SkeletonCard(): string {
  return `
    <div class="rounded-xl border bg-[hsl(var(--card))] p-6 shadow-sm flex flex-col justify-center">
      ${Skeleton('h-4 w-1/3 mb-4')}
      ${Skeleton('h-10 w-1/2 mb-2')}
      ${Skeleton('h-3 w-1/4')}
    </div>
  `;
}

export function SkeletonList(count: number = 5): string {
  let items = '';
  for(let i=0; i<count; i++) {
    items += `
      <div class="flex items-center justify-between py-3 border-b border-[hsl(var(--border))] last:border-0">
        <div class="flex items-center gap-3 w-full">
          ${Skeleton('h-8 w-8 rounded-full shrink-0')}
          <div class="flex flex-col gap-2 w-full">
            ${Skeleton('h-4 w-3/4')}
            ${Skeleton('h-3 w-1/2')}
          </div>
        </div>
      </div>
    `;
  }
  return items;
}

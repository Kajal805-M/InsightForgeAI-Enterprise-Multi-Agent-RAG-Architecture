import { DashboardLayout } from '../layouts/DashboardLayout';

export function NotFound(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'flex flex-col items-center justify-center h-[60vh] text-center';
  
  container.innerHTML = `
    <h1 class="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">404</h1>
    <p class="text-xl text-[hsl(var(--muted-foreground))] mb-8">Page not found.</p>
    <a href="/" data-link class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90 h-10 px-4 py-2">
      Return Home
    </a>
  `;

  return DashboardLayout(container);
}

export function Sidebar(): HTMLElement {
  const aside = document.createElement('aside');
  aside.className = 'w-64 border-r bg-[hsl(var(--background))] flex-shrink-0 flex flex-col hidden md:flex min-h-[calc(100vh-64px)]';
  
  aside.innerHTML = `
    <div class="p-4 py-6">
      <h2 class="text-lg font-semibold tracking-tight px-4 mb-2">Menu</h2>
      <nav class="flex flex-col gap-1">
        <a href="/" data-link class="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))] bg-[hsl(var(--muted))]">
          <i data-lucide="layout-dashboard" class="mr-2 h-4 w-4"></i>
          Dashboard
        </a>
        <a href="/documents" data-link class="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]">
          <i data-lucide="file-text" class="mr-2 h-4 w-4"></i>
          Documents
        </a>
        <a href="/chat" data-link class="inline-flex items-center rounded-md px-4 py-2 text-sm font-medium text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]">
          <i data-lucide="message-square" class="mr-2 h-4 w-4"></i>
          AI Chat
        </a>
      </nav>
    </div>
  `;
  
  return aside;
}

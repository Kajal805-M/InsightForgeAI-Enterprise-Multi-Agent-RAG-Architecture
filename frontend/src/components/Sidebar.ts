export function Sidebar(): HTMLElement {
  const aside = document.createElement('aside');
  // Changed from a solid fixed width sidebar to a floating pill navigation on the left
  aside.className = 'w-24 flex-shrink-0 hidden md:flex flex-col items-center py-8 fade-in-slide';
  
  // Floating pill container for the menu
  const menuPill = document.createElement('div');
  menuPill.className = 'glass-panel rounded-full py-6 px-3 flex flex-col gap-4 shadow-xl border border-[hsl(var(--border))]/50 items-center';

  const linkStyle = "relative flex items-center justify-center h-12 w-12 rounded-full text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-all duration-300 hover:bg-[hsl(var(--muted))]/50 group";
  const activeLinkStyle = "relative flex items-center justify-center h-12 w-12 rounded-full text-white bg-[hsl(var(--primary))] shadow-[0_0_15px_rgba(var(--primary),0.5)] group";

  menuPill.innerHTML = `
    <a href="/" data-link class="${activeLinkStyle}">
      <i data-lucide="layout-dashboard" class="h-5 w-5"></i>
      <span class="absolute left-16 bg-[hsl(var(--foreground))] text-[hsl(var(--background))] text-xs font-bold px-2 py-1 rounded opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap">Dashboard</span>
    </a>
    
    <div class="w-8 h-px bg-[hsl(var(--border))]/50 my-1"></div>

    <a href="/documents" data-link class="${linkStyle}">
      <i data-lucide="file-text" class="h-5 w-5"></i>
      <span class="absolute left-16 bg-[hsl(var(--foreground))] text-[hsl(var(--background))] text-xs font-bold px-2 py-1 rounded opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap">Documents</span>
    </a>
    
    <a href="/chat" data-link class="${linkStyle}">
      <i data-lucide="message-square" class="h-5 w-5"></i>
      <span class="absolute left-16 bg-[hsl(var(--foreground))] text-[hsl(var(--background))] text-xs font-bold px-2 py-1 rounded opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all pointer-events-none whitespace-nowrap">AI Chat</span>
    </a>
  `;
  
  aside.appendChild(menuPill);
  return aside;
}

import { toggleTheme } from '../theme';
import { Button } from './Button';

export function Navbar(): HTMLElement {
  const header = document.createElement('header');
  // Removed borders and solid background for a clean, floating mesh look
  header.className = 'sticky top-0 z-50 w-full flex items-center h-20 px-6 md:px-10 bg-transparent';

  const title = document.createElement('a');
  title.href = '/';
  title.setAttribute('data-link', 'true');
  title.className = 'font-bold text-xl flex items-center gap-3 fade-in';
  title.innerHTML = `
    <div class="p-2 rounded-xl bg-gradient-to-tr from-[hsl(var(--primary))] to-purple-400 text-white shadow-lg shadow-[hsl(var(--primary))]/20">
      <i data-lucide="sparkles" class="h-5 w-5"></i>
    </div>
    <span class="tracking-tight text-[hsl(var(--foreground))]">InsightForge<span class="text-[hsl(var(--muted-foreground))] font-medium">AI</span></span>
  `;

  const spacer = document.createElement('div');
  spacer.className = 'flex-1';

  const themeToggle = Button({
    text: `<i data-lucide="moon" class="h-5 w-5 dark:hidden"></i><i data-lucide="sun" class="h-5 w-5 hidden dark:block text-yellow-300"></i>`,
    variant: 'ghost',
    onClick: toggleTheme,
    className: 'w-10 h-10 px-0 rounded-full hover:bg-[hsl(var(--muted))]/50 fade-in'
  });

  header.appendChild(title);
  header.appendChild(spacer);
  header.appendChild(themeToggle);

  return header;
}

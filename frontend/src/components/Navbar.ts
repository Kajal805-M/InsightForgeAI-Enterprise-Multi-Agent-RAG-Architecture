import { toggleTheme } from '../theme';
import { Button } from './Button';

export function Navbar(): HTMLElement {
  const header = document.createElement('header');
  header.className = 'sticky top-0 z-50 w-full border-b bg-[hsl(var(--background))] flex items-center h-16 px-4 md:px-6';

  const title = document.createElement('a');
  title.href = '/';
  title.setAttribute('data-link', 'true');
  title.className = 'font-bold text-lg mr-6 flex items-center gap-2';
  title.innerHTML = `<i data-lucide="brain-circuit" class="h-6 w-6"></i> Enterprise RAG`;

  const spacer = document.createElement('div');
  spacer.className = 'flex-1';

  const themeToggle = Button({
    text: `<i data-lucide="moon" class="h-5 w-5 dark:hidden"></i><i data-lucide="sun" class="h-5 w-5 hidden dark:block"></i>`,
    variant: 'ghost',
    onClick: toggleTheme,
    className: 'w-10 px-0'
  });

  header.appendChild(title);
  header.appendChild(spacer);
  header.appendChild(themeToggle);

  return header;
}

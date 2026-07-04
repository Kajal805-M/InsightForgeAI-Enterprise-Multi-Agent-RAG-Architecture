import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { createIcons } from 'lucide';
import * as icons from 'lucide';

export function DashboardLayout(content: HTMLElement): HTMLElement {
  const container = document.createElement('div');
  container.className = 'relative flex min-h-screen flex-col';

  container.appendChild(Navbar());

  const mainWrapper = document.createElement('div');
  mainWrapper.className = 'flex flex-1 items-start';

  mainWrapper.appendChild(Sidebar());

  const mainContent = document.createElement('main');
  mainContent.className = 'flex-1 p-6';
  mainContent.appendChild(content);

  mainWrapper.appendChild(mainContent);
  container.appendChild(mainWrapper);

  // Initialize Lucide icons after rendering
  requestAnimationFrame(() => {
    createIcons({ icons });
  });

  return container;
}

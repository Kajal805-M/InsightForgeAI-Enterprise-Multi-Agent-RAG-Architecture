import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { createIcons } from 'lucide';
import * as icons from 'lucide';

export function DashboardLayout(content: HTMLElement): HTMLElement {
  const container = document.createElement('div');
  container.className = 'relative flex min-h-screen flex-col';

  // Add the animated mesh background div here if it wasn't added to body
  const mesh = document.createElement('div');
  mesh.className = 'mesh-bg';
  container.appendChild(mesh);

  container.appendChild(Navbar());

  const mainWrapper = document.createElement('div');
  mainWrapper.className = 'flex flex-1 max-w-[1600px] w-full mx-auto'; // Center the whole layout on large screens

  mainWrapper.appendChild(Sidebar());

  const mainContent = document.createElement('main');
  mainContent.className = 'flex-1 p-4 md:p-8 overflow-x-hidden';
  mainContent.appendChild(content);

  mainWrapper.appendChild(mainContent);
  container.appendChild(mainWrapper);

  // Initialize Lucide icons after rendering
  requestAnimationFrame(() => {
    createIcons({ icons });
  });

  return container;
}

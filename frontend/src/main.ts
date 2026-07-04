import './style.css';
import { initTheme } from './theme';
import { Router } from './router';
import { Dashboard } from './pages/Dashboard';
import { NotFound } from './pages/NotFound';
import { Documents } from './pages/Documents';
import { Chat } from './pages/Chat';
import { Analytics } from './pages/Analytics';
import { Reports } from './pages/Reports';

const appRoot = document.querySelector<HTMLDivElement>('#app')!;
appRoot.innerHTML = ''; // Clear default vite content

// Initialize dark/light mode based on user preference
initTheme();

// Initialize custom SPA router
const router = new Router(appRoot, NotFound);

// Register application routes
router.addRoute('/', Dashboard);
router.addRoute('/documents', Documents);
router.addRoute('/chat', Chat);
router.addRoute('/analytics', Analytics);
router.addRoute('/reports', Reports);

// Trigger initial render based on current URL
router.navigate(window.location.pathname);

import { DashboardLayout } from '../layouts/DashboardLayout';
import { api } from '../services/apiClient';
import { SkeletonCard, SkeletonList } from '../components/Skeleton';

export function Dashboard(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'w-full max-w-7xl mx-auto space-y-8';
  
  // Header
  const header = document.createElement('div');
  header.className = 'flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[hsl(var(--border))] pb-6';
  header.innerHTML = `
    <div>
      <h1 class="text-3xl font-bold tracking-tight text-[hsl(var(--foreground))]">Enterprise Intelligence</h1>
      <p class="text-[hsl(var(--muted-foreground))] mt-1">Real-time overview of your Multi-Agent RAG Platform.</p>
    </div>
    <div class="flex items-center gap-3 bg-[hsl(var(--muted))]/30 px-4 py-2 rounded-full border">
      <span class="relative flex h-3 w-3">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
      </span>
      <span class="text-sm font-medium text-green-600 dark:text-green-400" id="system-status-text">Connecting...</span>
    </div>
  `;
  container.appendChild(header);

  // KPI Grid
  const gridContainer = document.createElement('div');
  gridContainer.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6';
  gridContainer.innerHTML = `
    ${SkeletonCard()}
    ${SkeletonCard()}
    ${SkeletonCard()}
    ${SkeletonCard()}
  `;
  container.appendChild(gridContainer);

  // Split Layout for Feeds
  const feedsContainer = document.createElement('div');
  feedsContainer.className = 'grid grid-cols-1 lg:grid-cols-2 gap-8';
  
  const docsFeed = document.createElement('div');
  docsFeed.className = 'glass-panel rounded-xl shadow-sm overflow-hidden flex flex-col hover-glow fade-in';
  docsFeed.style.animationDelay = '0.2s';
  docsFeed.innerHTML = `
    <div class="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 p-5 flex justify-between items-center">
      <h3 class="font-bold flex items-center gap-2"><i data-lucide="database" class="h-5 w-5 text-[hsl(var(--primary))]"></i> Recent Documents</h3>
      <button class="text-xs font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors" onclick="window.history.pushState({}, '', '/documents'); window.dispatchEvent(new Event('popstate'));">View All</button>
    </div>
    <div class="p-5 flex-1" id="recent-docs-list">
      ${SkeletonList(4)}
    </div>
  `;
  
  const chatsFeed = document.createElement('div');
  chatsFeed.className = 'glass-panel rounded-xl shadow-sm overflow-hidden flex flex-col hover-glow fade-in';
  chatsFeed.style.animationDelay = '0.3s';
  chatsFeed.innerHTML = `
    <div class="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 p-5 flex justify-between items-center">
      <h3 class="font-bold flex items-center gap-2"><i data-lucide="message-square" class="h-5 w-5 text-[hsl(var(--primary))]"></i> Recent Conversations</h3>
      <button class="text-xs font-medium text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--primary))] transition-colors" onclick="window.history.pushState({}, '', '/chat'); window.dispatchEvent(new Event('popstate'));">View All</button>
    </div>
    <div class="p-5 flex-1" id="recent-chats-list">
      ${SkeletonList(4)}
    </div>
  `;

  feedsContainer.appendChild(docsFeed);
  feedsContainer.appendChild(chatsFeed);
  container.appendChild(feedsContainer);

  // Fetch Data and Render
  const loadDashboard = async () => {
    try {
      const data = await api.getSystemStatus();
      
      const statusText = container.querySelector('#system-status-text');
      if (statusText) statusText.textContent = `API Latency: ${data.latency_ms}ms`;

      // Render Grid
      gridContainer.innerHTML = `
        <div class="glass-panel rounded-xl p-6 hover-glow fade-in relative overflow-hidden group">
          <div class="absolute -right-6 -top-6 text-[hsl(var(--primary))]/10 group-hover:text-[hsl(var(--primary))]/30 group-hover:scale-110 transition-all duration-500">
            <i data-lucide="file-text" class="w-32 h-32"></i>
          </div>
          <div class="relative z-10">
            <p class="text-xs font-bold text-[hsl(var(--primary))] uppercase tracking-widest mb-2">Ingested Documents</p>
            <h3 class="text-4xl font-extrabold text-[hsl(var(--foreground))] tracking-tighter">${data.total_documents.toLocaleString()}</h3>
          </div>
        </div>
        
        <div class="glass-panel rounded-xl p-6 hover-glow fade-in relative overflow-hidden group" style="animation-delay: 0.05s;">
          <div class="absolute -right-6 -top-6 text-[hsl(var(--primary))]/10 group-hover:text-[hsl(var(--primary))]/30 group-hover:scale-110 transition-all duration-500">
            <i data-lucide="layers" class="w-32 h-32"></i>
          </div>
          <div class="relative z-10">
            <p class="text-xs font-bold text-[hsl(var(--primary))] uppercase tracking-widest mb-2">Vector Embeddings</p>
            <h3 class="text-4xl font-extrabold text-[hsl(var(--foreground))] tracking-tighter">${data.total_embeddings.toLocaleString()}</h3>
          </div>
        </div>
        
        <div class="glass-panel rounded-xl p-6 hover-glow fade-in relative overflow-hidden group" style="animation-delay: 0.1s;">
          <div class="absolute -right-6 -top-6 text-[hsl(var(--primary))]/10 group-hover:text-[hsl(var(--primary))]/30 group-hover:scale-110 transition-all duration-500">
            <i data-lucide="cpu" class="w-32 h-32"></i>
          </div>
          <div class="relative z-10">
            <p class="text-xs font-bold text-[hsl(var(--primary))] uppercase tracking-widest mb-2">Est. Token Usage</p>
            <h3 class="text-4xl font-extrabold text-[hsl(var(--foreground))] tracking-tighter">${data.estimated_tokens_used.toLocaleString()}</h3>
          </div>
        </div>
        
        <div class="glass-panel rounded-xl p-6 hover-glow fade-in relative overflow-hidden group" style="animation-delay: 0.15s;">
          <div class="absolute -right-6 -top-6 text-[hsl(var(--primary))]/10 group-hover:text-[hsl(var(--primary))]/30 group-hover:scale-110 transition-all duration-500">
            <i data-lucide="activity" class="w-32 h-32"></i>
          </div>
          <div class="relative z-10">
            <p class="text-xs font-bold text-[hsl(var(--primary))] uppercase tracking-widest mb-2">System Status</p>
            <h3 class="text-4xl font-extrabold text-green-500 capitalize tracking-tighter">${data.status}</h3>
          </div>
        </div>
      `;

      // Render Docs
      const docsList = container.querySelector('#recent-docs-list');
      if (docsList) {
        if (data.recent_documents.length === 0) {
          docsList.innerHTML = `<div class="text-center text-sm text-[hsl(var(--muted-foreground))] py-8 border-2 border-dashed rounded-md">No documents uploaded yet.</div>`;
        } else {
          let docsHtml = '';
          data.recent_documents.forEach((d: any) => {
            const date = new Date(d.created_at).toLocaleDateString();
            docsHtml += `
              <div class="flex items-center justify-between py-4 border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--muted))]/50 transition-colors px-3 -mx-3 rounded-md cursor-pointer" onclick="window.history.pushState({}, '', '/documents'); window.dispatchEvent(new Event('popstate'));">
                <div class="flex items-center gap-4">
                  <div class="h-10 w-10 rounded-full bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] flex items-center justify-center shrink-0">
                    <i data-lucide="file" class="h-5 w-5"></i>
                  </div>
                  <div class="min-w-0">
                    <p class="font-medium text-sm text-[hsl(var(--foreground))] truncate">${d.filename}</p>
                    <p class="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">Uploaded ${date}</p>
                  </div>
                </div>
                <div class="shrink-0 text-xs font-semibold px-2.5 py-1 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                  ${d.status}
                </div>
              </div>
            `;
          });
          docsList.innerHTML = docsHtml;
        }
      }

      // Render Chats
      const chatsList = container.querySelector('#recent-chats-list');
      if (chatsList) {
        if (data.recent_chats.length === 0) {
          chatsList.innerHTML = `<div class="text-center text-sm text-[hsl(var(--muted-foreground))] py-8 border-2 border-dashed rounded-md">No active conversations.</div>`;
        } else {
          let chatsHtml = '';
          data.recent_chats.forEach((c: any) => {
            const date = new Date(c.created_at).toLocaleDateString();
            chatsHtml += `
              <div class="flex items-center justify-between py-4 border-b border-[hsl(var(--border))] last:border-0 hover:bg-[hsl(var(--muted))]/50 transition-colors px-3 -mx-3 rounded-md cursor-pointer group" onclick="window.history.pushState({}, '', '/chat'); window.dispatchEvent(new Event('popstate'));">
                <div class="flex items-center gap-4">
                  <div class="h-10 w-10 rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] flex items-center justify-center shrink-0 group-hover:bg-[hsl(var(--primary))] group-hover:text-white transition-colors">
                    <i data-lucide="message-circle" class="h-5 w-5"></i>
                  </div>
                  <div class="min-w-0">
                    <p class="font-medium text-sm text-[hsl(var(--foreground))] truncate group-hover:text-[hsl(var(--primary))] transition-colors">${c.title}</p>
                    <p class="text-xs text-[hsl(var(--muted-foreground))] mt-0.5">Started ${date}</p>
                  </div>
                </div>
                <i data-lucide="chevron-right" class="h-4 w-4 text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 transition-opacity"></i>
              </div>
            `;
          });
          chatsList.innerHTML = chatsHtml;
        }
      }

      import('lucide').then(({ createIcons, icons }) => createIcons({ icons }));
    } catch (e) {
      // Error Boundary fallback
      const statusText = container.querySelector('#system-status-text');
      if (statusText) {
        statusText.textContent = `API Disconnected`;
        statusText.className = "text-sm font-bold text-red-500";
      }
      
      const dot = container.querySelector('.bg-green-500');
      const ping = container.querySelector('.animate-ping');
      if (dot) dot.className = "relative inline-flex rounded-full h-3 w-3 bg-red-500";
      if (ping) ping.remove();

      gridContainer.innerHTML = `
        <div class="col-span-full p-6 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-4 shadow-sm">
          <i data-lucide="alert-triangle" class="h-10 w-10 shrink-0"></i>
          <div>
            <h3 class="font-bold text-lg mb-1">System Offline</h3>
            <p class="text-sm">Could not connect to the backend API. Please ensure the backend server is running.</p>
          </div>
        </div>
      `;
      import('lucide').then(({ createIcons, icons }) => createIcons({ icons }));
    }
  };

  requestAnimationFrame(() => loadDashboard());
  
  return DashboardLayout(container);
}

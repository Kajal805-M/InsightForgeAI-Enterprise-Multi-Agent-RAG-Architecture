import { DashboardLayout } from '../layouts/DashboardLayout';
import { api } from '../services/apiClient';
import { SkeletonCard, SkeletonList } from '../components/Skeleton';

export function Dashboard(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'w-full max-w-6xl mx-auto space-y-10';
  
  // Hero Banner
  const header = document.createElement('div');
  header.className = 'relative overflow-hidden rounded-2xl glass-panel p-8 md:p-12 border-b-0 fade-in-slide';
  header.innerHTML = `
    <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[hsl(var(--primary))]/10 border border-[hsl(var(--primary))]/20 text-[hsl(var(--primary))] text-xs font-bold mb-4">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-[hsl(var(--primary))] opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-[hsl(var(--primary))]"></span>
          </span>
          SYSTEM ONLINE
        </div>
        <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight text-[hsl(var(--foreground))] mb-2">Enterprise Intelligence</h1>
        <p class="text-lg text-[hsl(var(--muted-foreground))] max-w-xl">Your Multi-Agent RAG platform is ready. Ingest data, converse with agents, and extract insights.</p>
      </div>
      
      <div class="flex items-center gap-4 bg-[hsl(var(--background))]/50 backdrop-blur-md px-6 py-4 rounded-2xl border border-[hsl(var(--border))]/50 shadow-xl">
        <div class="flex flex-col items-end">
          <span class="text-xs text-[hsl(var(--muted-foreground))] uppercase font-bold tracking-wider">API Latency</span>
          <span class="text-xl font-black text-green-500" id="system-status-text">-- ms</span>
        </div>
        <div class="h-10 w-px bg-[hsl(var(--border))]"></div>
        <i data-lucide="activity" class="h-8 w-8 text-green-500 animate-pulse"></i>
      </div>
    </div>
    
    <!-- Abstract decorative background element for hero -->
    <div class="absolute -right-20 -top-40 w-[500px] h-[500px] bg-[hsl(var(--primary))]/10 rounded-full blur-3xl pointer-events-none"></div>
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
  feedsContainer.className = 'grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12';
  
  const docsFeed = document.createElement('div');
  docsFeed.className = 'glass-panel glow-card rounded-2xl flex flex-col fade-in-slide';
  docsFeed.style.animationDelay = '0.1s';
  docsFeed.innerHTML = `
    <div class="p-6 flex justify-between items-center border-b border-[hsl(var(--border))]/30">
      <h3 class="font-bold flex items-center gap-3 text-lg"><div class="p-2 bg-[hsl(var(--primary))]/10 rounded-lg"><i data-lucide="database" class="h-5 w-5 text-[hsl(var(--primary))]"></i></div> Recent Documents</h3>
      <button class="text-sm font-bold text-[hsl(var(--primary))] hover:text-white transition-colors" onclick="window.history.pushState({}, '', '/documents'); window.dispatchEvent(new Event('popstate'));">View All</button>
    </div>
    <div class="p-6 flex-1 space-y-2" id="recent-docs-list">
      ${SkeletonList(4)}
    </div>
  `;
  
  const chatsFeed = document.createElement('div');
  chatsFeed.className = 'glass-panel glow-card rounded-2xl flex flex-col fade-in-slide';
  chatsFeed.style.animationDelay = '0.2s';
  chatsFeed.innerHTML = `
    <div class="p-6 flex justify-between items-center border-b border-[hsl(var(--border))]/30">
      <h3 class="font-bold flex items-center gap-3 text-lg"><div class="p-2 bg-[hsl(var(--primary))]/10 rounded-lg"><i data-lucide="message-square" class="h-5 w-5 text-[hsl(var(--primary))]"></i></div> Recent Conversations</h3>
      <button class="text-sm font-bold text-[hsl(var(--primary))] hover:text-white transition-colors" onclick="window.history.pushState({}, '', '/chat'); window.dispatchEvent(new Event('popstate'));">View All</button>
    </div>
    <div class="p-6 flex-1 space-y-2" id="recent-chats-list">
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
      if (statusText) statusText.textContent = `${data.latency_ms} ms`;

      // Render Grid
      gridContainer.innerHTML = `
        <div class="glass-panel glow-card rounded-2xl p-6 fade-in-slide group">
          <div class="flex justify-between items-start mb-4">
            <div class="p-3 bg-blue-500/10 text-blue-500 rounded-xl group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(59,130,246,0)] group-hover:shadow-[0_0_15px_rgba(59,130,246,0.5)]">
              <i data-lucide="file-text" class="h-6 w-6"></i>
            </div>
          </div>
          <p class="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest mb-1">Ingested Documents</p>
          <h3 class="text-4xl font-black text-[hsl(var(--foreground))] tracking-tighter">${data.total_documents.toLocaleString()}</h3>
        </div>
        
        <div class="glass-panel glow-card rounded-2xl p-6 fade-in-slide group" style="animation-delay: 0.1s;">
          <div class="flex justify-between items-start mb-4">
            <div class="p-3 bg-purple-500/10 text-purple-500 rounded-xl group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(168,85,247,0)] group-hover:shadow-[0_0_15px_rgba(168,85,247,0.5)]">
              <i data-lucide="layers" class="h-6 w-6"></i>
            </div>
          </div>
          <p class="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest mb-1">Vector Embeddings</p>
          <h3 class="text-4xl font-black text-[hsl(var(--foreground))] tracking-tighter">${data.total_embeddings.toLocaleString()}</h3>
        </div>
        
        <div class="glass-panel glow-card rounded-2xl p-6 fade-in-slide group" style="animation-delay: 0.2s;">
          <div class="flex justify-between items-start mb-4">
            <div class="p-3 bg-pink-500/10 text-pink-500 rounded-xl group-hover:scale-110 group-hover:bg-pink-500 group-hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(236,72,153,0)] group-hover:shadow-[0_0_15px_rgba(236,72,153,0.5)]">
              <i data-lucide="cpu" class="h-6 w-6"></i>
            </div>
          </div>
          <p class="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest mb-1">Est. Token Usage</p>
          <h3 class="text-4xl font-black text-[hsl(var(--foreground))] tracking-tighter">${data.estimated_tokens_used.toLocaleString()}</h3>
        </div>
        
        <div class="glass-panel glow-card rounded-2xl p-6 fade-in-slide group" style="animation-delay: 0.3s;">
          <div class="flex justify-between items-start mb-4">
            <div class="p-3 bg-green-500/10 text-green-500 rounded-xl group-hover:scale-110 group-hover:bg-green-500 group-hover:text-white transition-all duration-300 shadow-[0_0_15px_rgba(34,197,94,0)] group-hover:shadow-[0_0_15px_rgba(34,197,94,0.5)]">
              <i data-lucide="activity" class="h-6 w-6"></i>
            </div>
          </div>
          <p class="text-xs font-bold text-[hsl(var(--muted-foreground))] uppercase tracking-widest mb-1">System Status</p>
          <h3 class="text-4xl font-black text-[hsl(var(--foreground))] tracking-tighter capitalize">${data.status}</h3>
        </div>
      `;

      // Render Docs
      const docsList = container.querySelector('#recent-docs-list');
      if (docsList) {
        if (data.recent_documents.length === 0) {
          docsList.innerHTML = `<div class="text-center text-sm font-medium text-[hsl(var(--muted-foreground))] py-12 rounded-xl bg-[hsl(var(--muted))]/10 border border-[hsl(var(--border))]/30">No documents uploaded yet.</div>`;
        } else {
          let docsHtml = '';
          data.recent_documents.forEach((d: any) => {
            const date = new Date(d.created_at).toLocaleDateString();
            docsHtml += `
              <div class="flex items-center justify-between p-4 rounded-xl bg-[hsl(var(--background))]/30 hover:bg-[hsl(var(--muted))]/80 border border-transparent hover:border-[hsl(var(--border))]/50 transition-all cursor-pointer group" onclick="window.history.pushState({}, '', '/documents'); window.dispatchEvent(new Event('popstate'));">
                <div class="flex items-center gap-4">
                  <div class="h-10 w-10 rounded-full bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-[hsl(var(--primary))] group-hover:text-white transition-all">
                    <i data-lucide="file" class="h-4 w-4"></i>
                  </div>
                  <div class="min-w-0">
                    <p class="font-bold text-sm text-[hsl(var(--foreground))] truncate">${d.filename}</p>
                    <p class="text-xs text-[hsl(var(--muted-foreground))] font-medium">Uploaded ${date}</p>
                  </div>
                </div>
                <div class="shrink-0 text-xs font-black px-3 py-1 bg-green-500/10 text-green-500 rounded-full border border-green-500/20">
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
          chatsList.innerHTML = `<div class="text-center text-sm font-medium text-[hsl(var(--muted-foreground))] py-12 rounded-xl bg-[hsl(var(--muted))]/10 border border-[hsl(var(--border))]/30">No active conversations.</div>`;
        } else {
          let chatsHtml = '';
          data.recent_chats.forEach((c: any) => {
            const date = new Date(c.created_at).toLocaleDateString();
            chatsHtml += `
              <div class="flex items-center justify-between p-4 rounded-xl bg-[hsl(var(--background))]/30 hover:bg-[hsl(var(--muted))]/80 border border-transparent hover:border-[hsl(var(--border))]/50 transition-all cursor-pointer group" onclick="window.history.pushState({}, '', '/chat'); window.dispatchEvent(new Event('popstate'));">
                <div class="flex items-center gap-4">
                  <div class="h-10 w-10 rounded-full bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-[hsl(var(--primary))] group-hover:text-white transition-all shadow-[0_0_15px_rgba(var(--primary),0)] group-hover:shadow-[0_0_15px_rgba(var(--primary),0.3)]">
                    <i data-lucide="message-circle" class="h-4 w-4"></i>
                  </div>
                  <div class="min-w-0">
                    <p class="font-bold text-sm text-[hsl(var(--foreground))] truncate group-hover:text-[hsl(var(--primary))] transition-colors">${c.title}</p>
                    <p class="text-xs text-[hsl(var(--muted-foreground))] font-medium">Started ${date}</p>
                  </div>
                </div>
                <div class="bg-[hsl(var(--background))] p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity border border-[hsl(var(--border))]">
                  <i data-lucide="arrow-right" class="h-3 w-3 text-[hsl(var(--primary))]"></i>
                </div>
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
        statusText.textContent = `Disconnected`;
        statusText.className = "text-xl font-black text-red-500";
      }
      
      const pingStatus = container.querySelector('.bg-green-500');
      const pingAnim = container.querySelector('.animate-ping');
      if (pingStatus) pingStatus.className = "relative inline-flex rounded-full h-2 w-2 bg-red-500";
      if (pingAnim) pingAnim.remove();
      
      const headerActivity = container.querySelector('[data-lucide="activity"]');
      if(headerActivity) {
         headerActivity.classList.remove('text-green-500');
         headerActivity.classList.add('text-red-500');
      }

      gridContainer.innerHTML = `
        <div class="col-span-full p-8 glass-panel glow-card rounded-2xl border-red-500/30 shadow-[0_0_30px_rgba(239,68,68,0.1)] flex items-center gap-6">
          <div class="p-4 bg-red-500/10 rounded-2xl text-red-500">
             <i data-lucide="alert-octagon" class="h-10 w-10 shrink-0"></i>
          </div>
          <div>
            <h3 class="font-black text-2xl mb-1 text-red-500">System Offline</h3>
            <p class="text-[hsl(var(--muted-foreground))] font-medium">Could not connect to the backend API. Please ensure the backend server is running.</p>
          </div>
        </div>
      `;
      import('lucide').then(({ createIcons, icons }) => createIcons({ icons }));
    }
  };

  requestAnimationFrame(() => loadDashboard());
  
  return DashboardLayout(container);
}

import { DashboardLayout } from '../layouts/DashboardLayout';
import type { ChatSession, ChatMessage } from '../services/apiClient';
import { api } from '../services/apiClient';
import { Button } from '../components/Button';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

export function Chat(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'flex h-[calc(100vh-8rem)] gap-6';

  let currentSessionId: number | null = null;
  let sessions: ChatSession[] = [];

  // ==========================================
  // SIDEBAR: Chat History
  // ==========================================
  const sidebar = document.createElement('div');
  sidebar.className = 'w-1/3 max-w-[300px] flex flex-col gap-4';
  
  const sidebarHeader = document.createElement('div');
  sidebarHeader.className = 'flex items-center justify-between';
  sidebarHeader.innerHTML = `<h2 class="text-xl font-bold tracking-tight">Conversations</h2>`;
  
  const newChatBtn = Button({
    text: '<i data-lucide="plus" class="mr-2 h-4 w-4"></i> New Chat',
    variant: 'default',
    onClick: async () => {
      await startNewSession();
    }
  });
  sidebarHeader.appendChild(newChatBtn);
  sidebar.appendChild(sidebarHeader);

  const historyList = document.createElement('div');
  historyList.className = 'flex-1 overflow-y-auto space-y-2 pr-2';
  sidebar.appendChild(historyList);
  
  container.appendChild(sidebar);

  // ==========================================
  // MAIN AREA: Active Chat
  // ==========================================
  const mainChatArea = document.createElement('div');
  mainChatArea.className = 'flex-1 flex flex-col bg-[hsl(var(--background))] glass-panel rounded-xl overflow-hidden relative shadow-sm';
  
  // Header inside chat area
  const chatHeader = document.createElement('div');
  chatHeader.className = 'border-b border-[hsl(var(--border))] p-4 bg-[hsl(var(--muted))]/30 flex items-center justify-between';
  chatHeader.innerHTML = `
    <div class="flex items-center gap-2">
      <i data-lucide="message-square" class="h-5 w-5 text-[hsl(var(--primary))]"></i>
      <h3 class="font-bold" id="active-chat-title">New Chat Session</h3>
    </div>
  `;
  mainChatArea.appendChild(chatHeader);

  // Messages Container
  const messagesContainer = document.createElement('div');
  messagesContainer.className = 'flex-1 overflow-y-auto p-6 space-y-6';
  mainChatArea.appendChild(messagesContainer);

  // Input Area
  const inputContainer = document.createElement('form');
  inputContainer.className = 'p-4 bg-[hsl(var(--muted))]/30 border-t flex gap-2 items-end';
  
  const input = document.createElement('textarea');
  input.className = 'flex-1 min-h-[44px] max-h-32 p-3 rounded-md border bg-[hsl(var(--background))] text-sm placeholder:text-[hsl(var(--muted-foreground))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))] resize-none';
  input.placeholder = 'Message the assistant...';
  input.rows = 1;

  // Auto-resize textarea
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 128) + 'px';
  });
  
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      inputContainer.dispatchEvent(new Event('submit'));
    }
  });

  const submitBtn = Button({ text: '<i data-lucide="send" class="h-4 w-4"></i>', type: 'submit' });
  inputContainer.appendChild(input);
  inputContainer.appendChild(submitBtn);
  mainChatArea.appendChild(inputContainer);
  
  container.appendChild(mainChatArea);

  // ==========================================
  // LOGIC & RENDERING
  // ==========================================

  const renderHistoryList = () => {
    historyList.innerHTML = '';
    if (sessions.length === 0) {
      historyList.innerHTML = `<div class="text-sm text-[hsl(var(--muted-foreground))] text-center py-4">No previous chats.</div>`;
      return;
    }
    
    sessions.forEach(session => {
      const item = document.createElement('div');
      const isActive = session.session_id === currentSessionId;
      item.className = `group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors border ${
        isActive 
          ? 'bg-[hsl(var(--primary))]/10 border-[hsl(var(--primary))]/30 text-[hsl(var(--primary))]' 
          : 'bg-transparent border-transparent hover:bg-[hsl(var(--muted))]/50 text-[hsl(var(--foreground))]'
      }`;
      
      const titleSpan = document.createElement('span');
      titleSpan.className = 'text-sm font-medium truncate pr-2';
      titleSpan.textContent = session.title;
      
      const actions = document.createElement('div');
      actions.className = 'flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity';
      
      const delBtn = document.createElement('button');
      delBtn.className = 'p-1.5 text-[hsl(var(--muted-foreground))] hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors';
      delBtn.innerHTML = `<i data-lucide="trash-2" class="h-4 w-4"></i>`;
      delBtn.onclick = async (e) => {
        e.stopPropagation();
        if (confirm('Are you sure you want to delete this chat?')) {
          await api.deleteChatSession(session.session_id);
          sessions = sessions.filter(s => s.session_id !== session.session_id);
          if (currentSessionId === session.session_id) {
            await startNewSession();
          } else {
            renderHistoryList();
          }
          import('lucide').then(({ createIcons, icons }) => createIcons({ icons }));
        }
      };
      
      actions.appendChild(delBtn);
      item.appendChild(titleSpan);
      item.appendChild(actions);
      
      item.onclick = async () => {
        if (currentSessionId !== session.session_id) {
          await loadSession(session.session_id, session.title);
        }
      };
      
      historyList.appendChild(item);
    });
    
    import('lucide').then(({ createIcons, icons }) => createIcons({ icons }));
  };

  const updateActiveChatTitle = (title: string) => {
    const titleEl = mainChatArea.querySelector('#active-chat-title');
    if (titleEl) titleEl.textContent = title;
  };

  const appendMessage = (sender: 'User' | 'AI', content: string = '', timestampStr?: string) => {
    const msgDiv = document.createElement('div');
    msgDiv.className = `flex w-full ${sender === 'User' ? 'justify-end' : 'justify-start'}`;
    
    const bubbleWrapper = document.createElement('div');
    bubbleWrapper.className = `flex flex-col max-w-[85%] ${sender === 'User' ? 'items-end' : 'items-start'}`;
    
    const bubble = document.createElement('div');
    bubble.className = `rounded-2xl px-5 py-4 text-sm shadow-sm w-full ${
      sender === 'User' 
        ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' 
        : 'bg-[hsl(var(--muted))]/50 text-[hsl(var(--foreground))] border'
    }`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0';
    if (content) {
      contentDiv.innerHTML = DOMPurify.sanitize(marked.parse(content) as string);
    }
    
    bubble.appendChild(contentDiv);
    bubbleWrapper.appendChild(bubble);
    
    const timeDiv = document.createElement('div');
    timeDiv.className = 'text-[10px] text-[hsl(var(--muted-foreground))] mt-1.5 px-2 font-medium opacity-70';
    
    let timeText = '';
    if (timestampStr) {
       const d = new Date(timestampStr);
       timeText = isNaN(d.getTime()) ? timestampStr : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' + d.toLocaleDateString();
    } else {
       const d = new Date();
       timeText = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' + d.toLocaleDateString();
    }
    timeDiv.textContent = timeText;
    
    bubbleWrapper.appendChild(timeDiv);
    msgDiv.appendChild(bubbleWrapper);
    messagesContainer.appendChild(msgDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    return contentDiv;
  };

  const appendCitations = (contentDiv: HTMLElement, citations: string[]) => {
    const citationContainer = document.createElement('div');
    citationContainer.className = 'mt-4 pt-3 border-t border-[hsl(var(--border))] flex flex-wrap gap-2 items-center';
    
    const label = document.createElement('span');
    label.className = 'text-xs text-[hsl(var(--muted-foreground))] font-semibold mr-1';
    label.textContent = 'Sources:';
    citationContainer.appendChild(label);
    
    citations.forEach(c => {
      const pill = document.createElement('span');
      pill.className = 'inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-[hsl(var(--background))] border text-[hsl(var(--muted-foreground))]';
      pill.innerHTML = `<i data-lucide="file-text" class="mr-1.5 h-3 w-3"></i> ${c}`;
      citationContainer.appendChild(pill);
    });
    
    contentDiv.parentElement!.appendChild(citationContainer);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  };

  const loadSession = async (sessionId: number, title: string) => {
    currentSessionId = sessionId;
    updateActiveChatTitle(title);
    renderHistoryList(); // update active state in sidebar
    messagesContainer.innerHTML = '';
    
    try {
      const history = await api.getChatHistory(sessionId);
      if (history.length === 0) {
        appendMessage('AI', 'Hello! I am your Enterprise AI Assistant. How can I help you analyze your documents today?');
      } else {
        history.forEach(msg => {
          appendMessage(msg.sender, msg.content, msg.timestamp);
        });
      }
    } catch (e) {
      messagesContainer.innerHTML = '<span class="text-red-500 font-medium">Failed to load chat history.</span>';
    }
  };

  const startNewSession = async () => {
    const session = await api.createChatSession();
    sessions = [session, ...sessions];
    await loadSession(session.session_id, session.title);
  };

  const initChats = async () => {
    try {
      sessions = await api.getChatSessions();
      if (sessions.length > 0) {
        await loadSession(sessions[0].session_id, sessions[0].title);
      } else {
        await startNewSession();
      }
    } catch (e) {
      console.error(e);
      await startNewSession(); // Fallback if API fails
    }
    import('lucide').then((lucide) => lucide.createIcons({ icons: lucide }));
  };

  // Submit Handler with SSE Streaming
  inputContainer.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query || !currentSessionId) return;

    input.value = '';
    input.style.height = 'auto';
    submitBtn.disabled = true;

    appendMessage('User', query);
    
    // Auto-update title locally if it's new
    const currentSession = sessions.find(s => s.session_id === currentSessionId);
    if (currentSession && currentSession.title === 'New Chat Session') {
      currentSession.title = query.substring(0, 30) + (query.length > 30 ? '...' : '');
      updateActiveChatTitle(currentSession.title);
      renderHistoryList();
    }

    const aiContentDiv = appendMessage('AI', '');
    // Immediately show loading state to bypass DOMPurify stripping data-lucide attributes
    aiContentDiv.innerHTML = `<div class="animate-pulse flex items-center gap-2 text-[hsl(var(--primary))] font-medium"><i data-lucide="loader-2" class="animate-spin h-4 w-4"></i> System is Analyzing...</div>`;
    import('lucide').then((lucide) => lucide.createIcons({ icons: lucide }));
    
    let aiFullContent = '';
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/chat/${currentSessionId}/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      if (reader) {
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || ''; 
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.substring(6));
                if (data.type === 'token') {
                  aiFullContent += data.content;
                  aiContentDiv.innerHTML = DOMPurify.sanitize(marked.parse(aiFullContent) as string);
                  messagesContainer.scrollTop = messagesContainer.scrollHeight;
                } else if (data.type === 'status') {
                  aiContentDiv.innerHTML = `<div class="animate-pulse flex items-center gap-2 text-[hsl(var(--primary))] font-medium"><i data-lucide="loader-2" class="animate-spin h-4 w-4"></i> ${data.content}</div>`;
                  import('lucide').then((lucide) => lucide.createIcons({ icons: lucide }));
                  messagesContainer.scrollTop = messagesContainer.scrollHeight;
                } else if (data.type === 'citations') {
                  appendCitations(aiContentDiv, data.content);
                } else if (data.type === 'error') {
                  aiFullContent += `<br><span class="text-red-500 font-medium">Error: ${data.content}</span>`;
                  aiContentDiv.innerHTML = DOMPurify.sanitize(marked.parse(aiFullContent) as string);
                  messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }
              } catch(e) {}
            }
          }
        }
      }
    } catch (err) {
      aiContentDiv.innerHTML = '<span class="text-red-500 font-medium">Error connecting to the AI service. Ensure GEMINI_API_KEY is set in the backend.</span>';
    } finally {
      submitBtn.disabled = false;
      input.focus();
      import('lucide').then(({ createIcons, icons }) => createIcons({ icons }));
    }
  });

  // Init
  requestAnimationFrame(() => {
    initChats();
  });

  return DashboardLayout(container);
}

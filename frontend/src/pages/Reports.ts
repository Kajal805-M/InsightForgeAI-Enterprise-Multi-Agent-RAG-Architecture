import { DashboardLayout } from '../layouts/DashboardLayout';
import { api } from '../services/apiClient';
import { Spinner } from '../components/Spinner';
import { Button } from '../components/Button';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

export function Reports(): HTMLElement {
  const container = document.createElement('div');
  
  // Header
  const header = document.createElement('div');
  header.className = 'mb-8';
  header.innerHTML = `
    <h1 class="text-3xl font-bold tracking-tight">Report Generator</h1>
    <p class="text-[hsl(var(--muted-foreground))] mt-1">Automatically synthesize Executive Summaries, Recommendations, and References into downloadable PDF reports.</p>
  `;
  container.appendChild(header);

  // Selector
  const formContainer = document.createElement('div');
  formContainer.className = 'mb-8 max-w-xl p-6 bg-[hsl(var(--card))] border rounded-xl shadow-sm';
  formContainer.innerHTML = `
    <label class="block text-sm font-semibold mb-2">Select Analyzed Dataset</label>
    <select id="dataset-select" class="w-full rounded-md border bg-[hsl(var(--background))] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))] mb-4">
      <option value="">Loading datasets...</option>
    </select>
  `;
  
  const generateBtn = Button({ text: '<i data-lucide="file-text" class="h-4 w-4 mr-2"></i> Generate Executive Report', id: 'gen-btn' });
  formContainer.appendChild(generateBtn);
  container.appendChild(formContainer);

  const previewContainer = document.createElement('div');
  container.appendChild(previewContainer);

  const loadDatasets = async () => {
    const select = container.querySelector('#dataset-select') as HTMLSelectElement;
    try {
      const datasets = await api.getAnalyticsDatasets();
      if (datasets.length === 0) {
        select.innerHTML = '<option value="">No valid datasets found. Upload a CSV/XLSX first.</option>';
        (generateBtn as HTMLButtonElement).disabled = true;
        return;
      }
      
      select.innerHTML = '<option value="">-- Choose a Dataset --</option>';
      datasets.forEach((d: any) => {
        const opt = document.createElement('option');
        opt.value = d.id.toString();
        opt.textContent = `${d.filename} (${d.file_type})`;
        select.appendChild(opt);
      });
    } catch (e) {
      select.innerHTML = '<option value="">Error loading datasets.</option>';
    }
  };

  generateBtn.addEventListener('click', async () => {
    const docId = (container.querySelector('#dataset-select') as HTMLSelectElement).value;
    if (!docId) return;

    previewContainer.innerHTML = `
      <div class="flex flex-col items-center justify-center p-12 text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))]/10 rounded-xl border border-dashed">
        ${Spinner('h-10 w-10 mb-4 text-[hsl(var(--primary))]')}
        <p class="animate-pulse font-medium text-lg">Synthesizing Business Report with Gemini... This may take up to a minute.</p>
      </div>
    `;

    try {
      (generateBtn as HTMLButtonElement).disabled = true;
      const data = await api.generateReport(parseInt(docId));
      
      // Ensure API points correctly for downloads
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
      
      previewContainer.innerHTML = `
        <div class="flex flex-col lg:flex-row gap-8">
          <div class="flex-1 bg-white dark:bg-[hsl(var(--card))] border rounded-xl shadow-lg overflow-hidden">
            <div class="border-b bg-[hsl(var(--muted))]/30 p-4 flex justify-between items-center">
              <h2 class="font-bold flex items-center gap-2"><i data-lucide="eye" class="h-4 w-4"></i> Document Preview</h2>
              <span class="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-medium shadow-sm border border-green-200">Generation Complete</span>
            </div>
            <div class="p-10 prose prose-slate dark:prose-invert max-w-none text-[hsl(var(--foreground))]">
              ${DOMPurify.sanitize(marked.parse(data.markdown_content) as string)}
            </div>
          </div>
          
          <div class="w-full lg:w-72 shrink-0">
            <div class="sticky top-8 bg-[hsl(var(--card))] border rounded-xl p-6 shadow-sm">
              <h3 class="font-bold mb-4">Export Options</h3>
              <a href="${API_URL}${data.pdf_url}" target="_blank" class="flex w-full items-center justify-center gap-2 rounded-md bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] px-4 py-3 text-sm font-medium hover:opacity-90 mb-3 shadow-sm transition-opacity">
                <i data-lucide="download"></i> Download PDF
              </a>
              <a href="${API_URL}${data.md_url}" target="_blank" class="flex w-full items-center justify-center gap-2 rounded-md bg-[hsl(var(--secondary))] text-[hsl(var(--secondary-foreground))] px-4 py-3 text-sm font-medium hover:bg-[hsl(var(--secondary))]/80 border shadow-sm transition-colors">
                <i data-lucide="code"></i> Download Markdown
              </a>
              
              <div class="mt-6 pt-6 border-t text-xs text-[hsl(var(--muted-foreground))]">
                <p class="mb-2"><i data-lucide="info" class="inline h-3 w-3 mr-1"></i> PDF rendering utilizes xhtml2pdf for clean tabular formatting.</p>
                <p>Report ID: <span class="font-mono bg-[hsl(var(--muted))] px-1 rounded">${data.report_id.substring(0,8)}</span></p>
              </div>
            </div>
          </div>
        </div>
      `;
      import('lucide').then(({ createIcons, icons }) => createIcons({ icons }));
    } catch (e) {
      previewContainer.innerHTML = `
        <div class="p-6 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-3">
          <i data-lucide="alert-circle" class="h-6 w-6"></i>
          <div>
            <h4 class="font-bold mb-1">Generation Failed</h4>
            <p class="text-sm">Ensure the backend is running and you have a valid Gemini API key set.</p>
          </div>
        </div>`;
      import('lucide').then(({ createIcons, icons }) => createIcons({ icons }));
    } finally {
      (generateBtn as HTMLButtonElement).disabled = false;
    }
  });

  requestAnimationFrame(() => loadDatasets());
  return DashboardLayout(container);
}

import { DashboardLayout } from '../layouts/DashboardLayout';
import { api } from '../services/apiClient';
import { Spinner } from '../components/Spinner';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import Chart from 'chart.js/auto';

export function Analytics(): HTMLElement {
  const container = document.createElement('div');
  
  // Header
  const header = document.createElement('div');
  header.className = 'mb-8';
  header.innerHTML = `
    <h1 class="text-3xl font-bold tracking-tight">Business Analytics</h1>
    <p class="text-[hsl(var(--muted-foreground))] mt-1">Select an uploaded dataset to automatically generate statistics, charts, and AI insights.</p>
  `;
  container.appendChild(header);

  // Selector
  const selectorContainer = document.createElement('div');
  selectorContainer.className = 'mb-8 max-w-md';
  selectorContainer.innerHTML = `
    <label class="block text-sm font-medium mb-2">Select Dataset (CSV/XLSX)</label>
    <select id="dataset-select" class="w-full rounded-md border bg-[hsl(var(--background))] px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))] shadow-sm transition-shadow">
      <option value="">Loading datasets...</option>
    </select>
  `;
  container.appendChild(selectorContainer);

  const resultsContainer = document.createElement('div');
  resultsContainer.id = 'analytics-results';
  container.appendChild(resultsContainer);

  // Keep track of Chart instances to prevent canvas re-render bugs
  let trendChartInstance: Chart | null = null;
  let missingChartInstance: Chart | null = null;

  const loadDatasets = async () => {
    const select = container.querySelector('#dataset-select') as HTMLSelectElement;
    try {
      const datasets = await api.getAnalyticsDatasets();
      if (datasets.length === 0) {
        select.innerHTML = '<option value="">No CSV/Excel datasets found. Upload one first.</option>';
        select.disabled = true;
        return;
      }
      
      select.innerHTML = '<option value="">-- Choose a Dataset --</option>';
      datasets.forEach((d: any) => {
        const opt = document.createElement('option');
        opt.value = d.id.toString();
        opt.textContent = `${d.filename} (${d.file_type})`;
        select.appendChild(opt);
      });

      select.addEventListener('change', async (e) => {
        const docId = (e.target as HTMLSelectElement).value;
        if (docId) {
          await renderAnalytics(parseInt(docId));
        } else {
          resultsContainer.innerHTML = '';
        }
      });
    } catch (e) {
      select.innerHTML = '<option value="">Error loading datasets from API.</option>';
    }
  };

  const renderAnalytics = async (documentId: number) => {
    resultsContainer.innerHTML = `
      <div class="flex flex-col items-center justify-center p-12 text-[hsl(var(--muted-foreground))] bg-[hsl(var(--muted))]/10 rounded-xl border border-dashed">
        ${Spinner('h-8 w-8 mb-4 text-[hsl(var(--primary))]')}
        <p class="animate-pulse font-medium">Crunching pandas stats and generating Gemini insights... This may take a moment.</p>
      </div>
    `;

    try {
      const data = await api.runAnalytics(documentId);
      
      // Data Quality Cards
      let html = `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div class="rounded-xl border bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] shadow-sm p-6 hover:shadow-md transition-shadow">
            <h3 class="text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-2">Total Rows</h3>
            <div class="text-4xl font-bold text-[hsl(var(--primary))]">${data.total_rows.toLocaleString()}</div>
          </div>
          <div class="rounded-xl border bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] shadow-sm p-6 hover:shadow-md transition-shadow">
            <h3 class="text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-2">Total Columns</h3>
            <div class="text-4xl font-bold text-[hsl(var(--primary))]">${data.total_columns.toLocaleString()}</div>
          </div>
          <div class="rounded-xl border bg-[hsl(var(--card))] text-[hsl(var(--card-foreground))] shadow-sm p-6 hover:shadow-md transition-shadow">
            <h3 class="text-sm font-semibold text-[hsl(var(--muted-foreground))] uppercase tracking-wider mb-2">Missing Values</h3>
            <div class="text-4xl font-bold text-red-500">${Object.values(data.missing_values).reduce((a: any, b: any) => a + b, 0)}</div>
          </div>
        </div>
      `;

      // AI Insights
      html += `
        <div class="rounded-xl border bg-gradient-to-br from-[hsl(var(--card))] to-[hsl(var(--muted))]/30 shadow-sm p-6 mb-8">
          <h3 class="text-xl font-bold flex items-center gap-2 mb-4 tracking-tight">
            <i data-lucide="sparkles" class="h-6 w-6 text-yellow-500"></i> AI Business Insights
          </h3>
          <div class="prose prose-sm dark:prose-invert max-w-none text-[hsl(var(--foreground))]">
            ${DOMPurify.sanitize(marked.parse(data.insights) as string)}
          </div>
        </div>
      `;

      // Charts Layout
      html += `
        <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
          <div class="rounded-xl border bg-[hsl(var(--card))] shadow-sm p-6">
            <h3 class="text-lg font-bold mb-4 tracking-tight text-[hsl(var(--foreground))]">
              Trend Analysis ${data.trend?.metric_name ? '<span class="text-sm font-normal text-[hsl(var(--muted-foreground))]">(' + data.trend.metric_name + ' over time)</span>' : ''}
            </h3>
            ${data.trend?.labels?.length > 0 
              ? '<div class="relative w-full h-72"><canvas id="trend-chart"></canvas></div>' 
              : '<div class="h-72 flex flex-col items-center justify-center text-sm text-[hsl(var(--muted-foreground))] border-2 border-dashed rounded-md bg-[hsl(var(--muted))]/20"><i data-lucide="calendar-off" class="h-8 w-8 mb-2"></i>No timeseries/date column detected to plot a trend.</div>'}
          </div>
          <div class="rounded-xl border bg-[hsl(var(--card))] shadow-sm p-6">
            <h3 class="text-lg font-bold mb-4 tracking-tight text-[hsl(var(--foreground))]">Missing Values Breakdown</h3>
            <div class="relative w-full h-72"><canvas id="missing-chart"></canvas></div>
          </div>
        </div>
      `;

      resultsContainer.innerHTML = html;
      
      // Initialize icons for the newly injected HTML
      import('lucide').then(({ createIcons, icons }) => createIcons({ icons }));

      // Clean up previous chart instances if they exist
      if (trendChartInstance) trendChartInstance.destroy();
      if (missingChartInstance) missingChartInstance.destroy();

      // Render Charts
      if (data.trend?.labels?.length > 0) {
        const trendCtx = document.getElementById('trend-chart') as HTMLCanvasElement;
        trendChartInstance = new Chart(trendCtx, {
          type: 'line',
          data: {
            labels: data.trend.labels,
            datasets: [{
              label: data.trend.metric_name,
              data: data.trend.values,
              borderColor: '#3b82f6', // Tailwind blue-500
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.4,
              pointRadius: 2,
              pointBackgroundColor: '#3b82f6'
            }]
          },
          options: { 
            responsive: true, 
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false }
            },
            scales: {
              x: { grid: { display: false } },
              y: { border: { dash: [4, 4] } }
            }
          }
        });
      }

      const missingCtx = document.getElementById('missing-chart') as HTMLCanvasElement;
      const missingLabels = Object.keys(data.missing_values);
      const missingData = Object.values(data.missing_values);
      
      missingChartInstance = new Chart(missingCtx, {
        type: 'bar',
        data: {
          labels: missingLabels,
          datasets: [{
            label: 'Missing Cells',
            data: missingData,
            backgroundColor: '#ef4444', // Tailwind red-500
            borderRadius: 4
          }]
        },
        options: { 
          responsive: true, 
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { 
            y: { beginAtZero: true, border: { dash: [4, 4] } },
            x: { grid: { display: false } }
          }
        }
      });

    } catch (e) {
      resultsContainer.innerHTML = `
        <div class="p-6 bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-3">
          <i data-lucide="alert-circle" class="h-6 w-6"></i>
          <div>
            <h4 class="font-bold">Analytics Failed</h4>
            <p class="text-sm">Failed to generate analytics. Ensure the backend is running and you uploaded a valid CSV/Excel file.</p>
          </div>
        </div>`;
      import('lucide').then(({ createIcons, icons }) => createIcons({ icons }));
    }
  };

  requestAnimationFrame(() => loadDatasets());

  return DashboardLayout(container);
}

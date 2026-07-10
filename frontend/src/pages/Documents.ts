import { DashboardLayout } from '../layouts/DashboardLayout';
import { Dropzone } from '../components/Dropzone';
import { api } from '../services/apiClient';
import { Toast } from '../components/Toast';
import { Spinner } from '../components/Spinner';

export function Documents(): HTMLElement {
  const container = document.createElement('div');
  
  // Header
  const header = document.createElement('div');
  header.className = 'mb-8';
  header.innerHTML = `
    <h1 class="text-3xl font-bold tracking-tight">Documents</h1>
    <p class="text-[hsl(var(--muted-foreground))] mt-1">Upload and manage enterprise documents for the RAG pipeline.</p>
  `;
  container.appendChild(header);

  // Upload Section
  const uploadSection = document.createElement('div');
  uploadSection.className = 'mb-8 max-w-2xl';
  
  const handleUpload = async (file: File) => {
    Toast(`Uploading ${file.name}...`, 'info');
    try {
      await api.uploadDocument(file);
      Toast(`${file.name} uploaded successfully!`, 'success');
      loadDocuments(); // Refresh list
    } catch (e) {
      // Error handled globally by apiClient interceptor
    }
  };

  uploadSection.appendChild(Dropzone({ onFileSelect: handleUpload }));
  container.appendChild(uploadSection);

  // List Section
  const listSection = document.createElement('div');
  listSection.innerHTML = `<h2 class="text-xl font-semibold mb-4 tracking-tight">Uploaded Documents</h2>`;
  
  const tableContainer = document.createElement('div');
  tableContainer.className = 'rounded-md border bg-[hsl(var(--background))] overflow-hidden';
  tableContainer.innerHTML = `
    <div class="flex justify-center p-8" id="docs-spinner-container">
    </div>
  `;
  
  listSection.appendChild(tableContainer);
  container.appendChild(listSection);

  // Data Fetching Logic
  const loadDocuments = async () => {
    const spinnerContainer = tableContainer.querySelector('#docs-spinner-container');
    if (spinnerContainer) {
      spinnerContainer.appendChild(Spinner('h-8 w-8 text-[hsl(var(--primary))]'));
    }

    try {
      const docs = await api.getDocuments();
      if (docs.length === 0) {
        tableContainer.innerHTML = `<div class="p-8 text-center text-[hsl(var(--muted-foreground))]">No documents uploaded yet.</div>`;
        return;
      }

      let html = `
        <div class="overflow-x-auto">
          <table class="w-full text-sm text-left">
            <thead class="text-xs uppercase bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] border-b">
              <tr>
                <th class="px-6 py-4 font-medium">Filename</th>
                <th class="px-6 py-4 font-medium">Type</th>
                <th class="px-6 py-4 font-medium">Size (Bytes)</th>
                <th class="px-6 py-4 font-medium">Status</th>
                <th class="px-6 py-4 font-medium">Uploaded At</th>
              </tr>
            </thead>
            <tbody>
      `;
      
      for (const doc of docs) {
        html += `
          <tr class="border-b last:border-0 hover:bg-[hsl(var(--muted))]/50 transition-colors">
            <td class="px-6 py-4 font-medium">${doc.filename}</td>
            <td class="px-6 py-4">
              <span class="px-2 py-1 bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))] rounded-md text-xs font-semibold">${doc.file_type}</span>
            </td>
            <td class="px-6 py-4 text-[hsl(var(--muted-foreground))]">${doc.file_size_bytes.toLocaleString()}</td>
            <td class="px-6 py-4">
              <span class="px-2.5 py-1 bg-green-500/15 text-green-700 dark:text-green-400 rounded-full text-xs font-medium border border-green-500/20">${doc.status}</span>
            </td>
            <td class="px-6 py-4 text-[hsl(var(--muted-foreground))]">${new Date(doc.created_at).toLocaleString()}</td>
          </tr>
        `;
      }
      html += `</tbody></table></div>`;
      tableContainer.innerHTML = html;
    } catch (e) {
      tableContainer.innerHTML = `<div class="p-8 text-center text-red-500">Failed to load documents. Ensure backend is running.</div>`;
    }
  };

  // Trigger initial fetch
  requestAnimationFrame(() => loadDocuments());

  return DashboardLayout(container);
}

interface DropzoneProps {
  onFileSelect: (file: File) => void;
}

export function Dropzone({ onFileSelect }: DropzoneProps): HTMLElement {
  const container = document.createElement('div');
  container.className = 'border-2 border-dashed border-[hsl(var(--border))] rounded-lg p-12 text-center hover:bg-[hsl(var(--muted))]/50 transition-colors cursor-pointer flex flex-col items-center justify-center';
  
  container.innerHTML = `
    <i data-lucide="upload-cloud" class="h-10 w-10 text-[hsl(var(--muted-foreground))] mb-4"></i>
    <p class="text-sm font-medium">Drag & drop your document here, or click to browse</p>
    <p class="text-xs text-[hsl(var(--muted-foreground))] mt-2">Supports PDF, DOCX, TXT, CSV, XLSX</p>
    <input type="file" class="hidden" accept=".pdf,.docx,.txt,.csv,.xlsx">
  `;

  const input = container.querySelector('input')!;
  
  container.addEventListener('click', () => input.click());
  
  input.addEventListener('change', (e) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) onFileSelect(file);
    input.value = ''; // Reset
  });

  // Drag and drop handlers
  container.addEventListener('dragover', (e) => {
    e.preventDefault();
    container.classList.add('border-[hsl(var(--primary))]', 'bg-[hsl(var(--muted))]');
  });

  container.addEventListener('dragleave', (e) => {
    e.preventDefault();
    container.classList.remove('border-[hsl(var(--primary))]', 'bg-[hsl(var(--muted))]');
  });

  container.addEventListener('drop', (e) => {
    e.preventDefault();
    container.classList.remove('border-[hsl(var(--primary))]', 'bg-[hsl(var(--muted))]');
    const file = e.dataTransfer?.files?.[0];
    if (file) onFileSelect(file);
  });

  return container;
}

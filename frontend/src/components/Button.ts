type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';

interface ButtonProps {
  text: string | HTMLElement;
  variant?: ButtonVariant;
  onClick?: (e: MouseEvent) => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

export function Button({ text, variant = 'primary', onClick, className = '', type = 'button', disabled = false }: ButtonProps): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = type;
  btn.disabled = disabled;
  
  const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--primary))] disabled:opacity-50 disabled:pointer-events-none h-10 py-2 px-4';
  
  let variantClasses = '';
  switch (variant) {
    case 'primary':
      variantClasses = 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] hover:bg-[hsl(var(--primary))]/90';
      break;
    case 'secondary':
      variantClasses = 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))]/80';
      break;
    case 'ghost':
      variantClasses = 'hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]';
      break;
    case 'destructive':
      variantClasses = 'bg-red-500 text-white hover:bg-red-600';
      break;
  }
  
  btn.className = `${baseClasses} ${variantClasses} ${className}`;
  
  if (typeof text === 'string') {
    btn.innerHTML = text;
  } else {
    btn.appendChild(text);
  }
  
  if (onClick) {
    btn.addEventListener('click', onClick);
  }
  
  return btn;
}

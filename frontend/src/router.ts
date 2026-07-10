export type RouteHandler = () => HTMLElement;

export class Router {
  private routes: Record<string, RouteHandler> = {};
  private rootElement: HTMLElement;
  private notFoundHandler: RouteHandler;

  constructor(rootElement: HTMLElement, notFoundHandler: RouteHandler) {
    this.rootElement = rootElement;
    this.notFoundHandler = notFoundHandler;

    // Handle back/forward navigation
    window.addEventListener('popstate', () => {
      this.render(window.location.pathname, false);
    });
    
    // Intercept internal link clicks globally
    document.body.addEventListener('click', (e) => {
      const target = (e.target as Element).closest('a');
      if (target && target.hasAttribute('data-link')) {
        e.preventDefault();
        const href = target.getAttribute('href');
        if (href) this.navigate(href);
      }
    });
  }

  addRoute(path: string, handler: RouteHandler) {
    this.routes[path] = handler;
  }

  navigate(path: string) {
    this.render(path, true);
  }

  render(path: string, pushState = true) {
    if (pushState) {
      window.history.pushState({}, '', path);
    }
    
    const handler = this.routes[path] || this.notFoundHandler;
    this.rootElement.innerHTML = '';
    this.rootElement.appendChild(handler());
  }
}

/**
 * Browser-based React Component Renderer
 * 
 * This module handles React component compilation and rendering in the browser
 * without requiring Node.js. It uses Babel standalone for JSX compilation
 * and creates isolated rendering environments.
 * 
 * Key challenges addressed:
 * 1. JSX/TSX compilation in browser using Babel standalone
 * 2. Dependency resolution for React components
 * 3. Safe execution in sandboxed environments
 * 4. Performance optimization for real-time rendering
 */

// Types for React rendering
export interface RenderResult {
  success: boolean;
  error?: string;
  compiledCode?: string;
  dependencies?: string[];
}

export interface ComponentRenderOptions {
  code: string;
  props?: Record<string, any>;
  dependencies?: string[];
  enableErrorBoundary?: boolean;
}

/**
 * Browser-compatible React component renderer
 * Uses Babel standalone for compilation and iframe for isolation
 */
export class BrowserReactRenderer {
  private babelLoaded = false;
  private reactDependencies: Record<string, string> = {};

  constructor() {
    this.loadBabel();
    this.setupReactDependencies();
  }

  /**
   * Load Babel standalone for JSX compilation
   */
  private async loadBabel(): Promise<void> {
    if (this.babelLoaded) return;

    try {
      // Load Babel standalone from CDN
      await this.loadScript('https://unpkg.com/@babel/standalone@7.24.0/babel.min.js');
      this.babelLoaded = true;
      console.log('✅ Babel standalone loaded successfully');
    } catch (error) {
      console.error('Failed to load Babel:', error);
      throw new Error('Failed to load Babel compiler');
    }
  }

  /**
   * Setup React dependencies that are available in browser
   */
  private setupReactDependencies(): void {
    this.reactDependencies = {
      'react': 'https://unpkg.com/react@18/umd/react.development.js',
      'react-dom': 'https://unpkg.com/react-dom@18/umd/react-dom.development.js',
      'react-dom/client': 'https://unpkg.com/react-dom@18/umd/react-dom.development.js',
      'lucide-react': 'https://unpkg.com/lucide-react@latest/dist/umd/lucide-react.js',
      'clsx': 'https://unpkg.com/clsx@2.1.0/dist/clsx.min.js',
      'class-variance-authority': 'https://unpkg.com/class-variance-authority@0.7.0/dist/index.umd.js'
    };
  }

  /**
   * Load external script dynamically
   */
  private loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.head.appendChild(script);
    });
  }

  /**
   * Compile React component code using Babel
   */
  private compileComponent(code: string): RenderResult {
    try {
      if (!this.babelLoaded || !(window as any).Babel) {
        throw new Error('Babel compiler not available');
      }

      const babelOptions = {
        presets: [
          ['react', { runtime: 'automatic' }],
          'typescript'
        ],
        plugins: [
          'transform-modules-umd'
        ]
      };

      // Clean the code - remove imports and add necessary wrapping
      let cleanedCode = this.preprocessCode(code);

      const compiled = (window as any).Babel.transform(cleanedCode, babelOptions);

      return {
        success: true,
        compiledCode: compiled.code,
        dependencies: this.extractDependencies(code)
      };

    } catch (error) {
      console.error('Compilation error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Compilation failed'
      };
    }
  }

  /**
   * Preprocess code to make it browser-compatible
   */
  private preprocessCode(code: string): string {
    // Remove TypeScript imports and replace with global references
    let processedCode = code
      .replace(/import\s+.*?from\s+['"]react['"];?\s*/g, '')
      .replace(/import\s+.*?from\s+['"]react-dom.*?['"];?\s*/g, '')
      .replace(/import\s+.*?from\s+['"]lucide-react['"];?\s*/g, '')
      .replace(/import\s+\{[^}]*\}\s+from\s+['"]@\/.*?['"];?\s*/g, '') // Remove internal imports
      .replace(/import\s+type\s+.*?;?\s*/g, '') // Remove TypeScript type imports
      .replace(/export\s+default\s+/g, 'window.GeneratedComponent = '); // Make component globally available

    // Add React hooks and components as global references
    processedCode = `
      const { useState, useEffect, useCallback, useMemo, useRef } = React;
      const { createRoot } = ReactDOM;
      
      ${processedCode}
      
      // Export the component for rendering
      if (typeof window.GeneratedComponent === 'function') {
        window.ComponentToRender = window.GeneratedComponent;
      }
    `;

    return processedCode;
  }

  /**
   * Extract dependencies from component code
   */
  private extractDependencies(code: string): string[] {
    const dependencies: string[] = ['react', 'react-dom'];
    
    if (code.includes('lucide-react')) {
      dependencies.push('lucide-react');
    }
    
    if (code.includes('clsx') || code.includes('cn(')) {
      dependencies.push('clsx');
    }
    
    return dependencies;
  }

  /**
   * Create HTML template for component rendering
   */
  private createRenderTemplate(compiledCode: string, props: Record<string, any> = {}): string {
    const propsJson = JSON.stringify(props);
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
        <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
        <script src="https://unpkg.com/lucide-react@latest/dist/umd/lucide-react.js"></script>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>
          body { margin: 0; padding: 16px; font-family: system-ui, sans-serif; }
          .error-boundary { 
            padding: 20px; 
            border: 2px solid #ef4444; 
            background: #fef2f2; 
            border-radius: 8px; 
            color: #dc2626; 
          }
        </style>
      </head>
      <body>
        <div id="root"></div>
        
        <script>
          // Error boundary component
          class ErrorBoundary extends React.Component {
            constructor(props) {
              super(props);
              this.state = { hasError: false, error: null };
            }
            
            static getDerivedStateFromError(error) {
              return { hasError: true, error };
            }
            
            componentDidCatch(error, errorInfo) {
              console.error('React component error:', error, errorInfo);
            }
            
            render() {
              if (this.state.hasError) {
                return React.createElement('div', { className: 'error-boundary' }, 
                  'Component Error: ' + (this.state.error?.message || 'Unknown error')
                );
              }
              return this.props.children;
            }
          }
          
          // Component code
          try {
            ${compiledCode}
            
            // Clear any existing content first
            const rootElement = document.getElementById('root');
            rootElement.innerHTML = '';
            
            // Create fresh root and render the component
            const root = ReactDOM.createRoot(rootElement);
            const props = ${propsJson};
            
            if (window.ComponentToRender) {
              // Ensure we only render once
              window.hasRendered = window.hasRendered || false;
              if (!window.hasRendered) {
                root.render(
                  React.createElement(ErrorBoundary, null,
                    React.createElement(window.ComponentToRender, props)
                  )
                );
                window.hasRendered = true;
              }
            } else {
              throw new Error('No component found to render');
            }
          } catch (error) {
            console.error('Rendering error:', error);
            document.getElementById('root').innerHTML = 
              '<div class="error-boundary">Rendering Error: ' + error.message + '</div>';
          }
        </script>
      </body>
      </html>
    `;
  }

  /**
   * Render React component in sandboxed iframe
   */
  public async renderComponent(options: ComponentRenderOptions): Promise<RenderResult> {
    try {
      await this.loadBabel();

      // Compile the component
      const compilationResult = this.compileComponent(options.code);
      
      if (!compilationResult.success) {
        return compilationResult;
      }

      // Create HTML template
      const html = this.createRenderTemplate(
        compilationResult.compiledCode!, 
        options.props || {}
      );

      return {
        success: true,
        compiledCode: html,
        dependencies: compilationResult.dependencies
      };

    } catch (error) {
      console.error('React rendering error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Rendering failed'
      };
    }
  }

  /**
   * Quick validation of React component code
   */
  public validateComponent(code: string): { valid: boolean; error?: string } {
    try {
      // Basic validation checks
      if (!code.trim()) {
        return { valid: false, error: 'Empty component code' };
      }

      if (!code.includes('return') && !code.includes('=>')) {
        return { valid: false, error: 'Component must return JSX' };
      }

      // Try compilation
      const result = this.compileComponent(code);
      return { valid: result.success, error: result.error };

    } catch (error) {
      return { 
        valid: false, 
        error: error instanceof Error ? error.message : 'Validation failed' 
      };
    }
  }
}

// Singleton instance
export const browserRenderer = new BrowserReactRenderer();

/**
 * Utility functions for easy component rendering
 */
export const renderReactComponent = async (
  code: string, 
  props?: Record<string, any>
): Promise<RenderResult> => {
  return browserRenderer.renderComponent({ code, props, enableErrorBoundary: true });
};

export const validateReactComponent = (code: string) => {
  return browserRenderer.validateComponent(code);
};

export default {
  BrowserReactRenderer,
  browserRenderer,
  renderReactComponent,
  validateReactComponent
};

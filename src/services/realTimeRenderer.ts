import { ReactComponent } from '../types/reactComponent';

export interface RenderingOptions {
  theme?: 'light' | 'dark' | 'auto';
  viewport?: 'mobile' | 'tablet' | 'desktop';
  enableHotReload?: boolean;
  showGrid?: boolean;
  showRuler?: boolean;
  isolation?: boolean;
}

export interface RenderError {
  type: 'syntax' | 'runtime' | 'import' | 'props' | 'styling';
  message: string;
  line?: number;
  column?: number;
  stack?: string;
  suggestions?: string[];
}

export interface RenderResult {
  success: boolean;
  rendered?: string;
  errors?: RenderError[];
  warnings?: string[];
  renderTime?: number;
  bundleSize?: number;
}

export interface RenderingState {
  isRendering: boolean;
  lastRender?: Date;
  renderCount: number;
  errors: RenderError[];
  warnings: string[];
  performance: {
    averageRenderTime: number;
    totalRenderTime: number;
    lastRenderTime: number;
  };
}

class RealTimeRendererService {
  private renderingState: Map<string, RenderingState> = new Map();
  private renderQueue: Map<string, ReactComponent> = new Map();
  private renderTimers: Map<string, NodeJS.Timeout> = new Map();
  private debounceTime = 300; // ms
  private maxConcurrentRenders = 3;
  private currentRenders = 0;

  async renderComponent(
    componentId: string,
    component: ReactComponent,
    options: RenderingOptions = {}
  ): Promise<RenderResult> {
    // Add to queue for debounced rendering
    this.renderQueue.set(componentId, component);
    
    // Clear existing timer
    const existingTimer = this.renderTimers.get(componentId);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    // Set up debounced render
    return new Promise((resolve) => {
      const timer = setTimeout(async () => {
        const result = await this.performRender(componentId, component, options);
        resolve(result);
      }, this.debounceTime);

      this.renderTimers.set(componentId, timer);
    });
  }

  private async performRender(
    componentId: string,
    component: ReactComponent,
    options: RenderingOptions
  ): Promise<RenderResult> {
    // Check concurrency limit
    if (this.currentRenders >= this.maxConcurrentRenders) {
      return {
        success: false,
        errors: [{ type: 'runtime', message: 'Too many concurrent renders. Please wait.' }]
      };
    }

    const startTime = Date.now();
    this.currentRenders++;

    // Initialize or update rendering state
    const state = this.renderingState.get(componentId) || {
      isRendering: false,
      renderCount: 0,
      errors: [],
      warnings: [],
      performance: {
        averageRenderTime: 0,
        totalRenderTime: 0,
        lastRenderTime: 0
      }
    };

    state.isRendering = true;
    state.lastRender = new Date();
    this.renderingState.set(componentId, state);

    try {
      // Pre-render validation
      const validationResult = await this.validateComponent(component);
      if (!validationResult.isValid) {
        return {
          success: false,
          errors: validationResult.errors,
          renderTime: Date.now() - startTime
        };
      }

      // Transform component for rendering
      const transformedComponent = await this.transformComponent(component, options);
      
      // Create isolated rendering environment
      const renderEnvironment = this.createRenderEnvironment(options);
      
      // Render the component
      const rendered = await this.executeRender(transformedComponent, renderEnvironment);
      
      // Calculate performance metrics
      const renderTime = Date.now() - startTime;
      this.updatePerformanceMetrics(componentId, renderTime);

      // Estimate bundle size
      const bundleSize = this.estimateBundleSize(transformedComponent);

      state.isRendering = false;
      state.renderCount++;
      state.errors = [];
      state.warnings = validationResult.warnings || [];

      return {
        success: true,
        rendered,
        warnings: state.warnings,
        renderTime,
        bundleSize
      };

    } catch (error) {
      const renderError = this.parseRenderError(error);
      state.errors = [renderError];
      state.isRendering = false;

      return {
        success: false,
        errors: [renderError],
        renderTime: Date.now() - startTime
      };
    } finally {
      this.currentRenders--;
      this.renderingState.set(componentId, state);
    }
  }

  private async validateComponent(component: ReactComponent): Promise<{
    isValid: boolean;
    errors?: RenderError[];
    warnings?: string[];
  }> {
    const errors: RenderError[] = [];
    const warnings: string[] = [];

    // Check for basic syntax issues
    if (!component.code) {
      errors.push({
        type: 'syntax',
        message: 'Component code is empty'
      });
    }

    // Check for React imports
    if (!component.code.includes('React') && !component.code.includes('import')) {
      warnings.push('Missing React import - will be added automatically');
    }

    // Check for export statement
    if (!component.code.includes('export')) {
      errors.push({
        type: 'syntax',
        message: 'Component must have an export statement',
        suggestions: ['Add "export default" before your component']
      });
    }

    // Check for common TypeScript issues
    const typeErrors = this.checkTypeScriptSyntax(component.code);
    errors.push(...typeErrors);

    // Validate props if provided
    if (component.props) {
      const propErrors = this.validateProps(component.props);
      errors.push(...propErrors);
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined,
      warnings: warnings.length > 0 ? warnings : undefined
    };
  }

  private checkTypeScriptSyntax(code: string): RenderError[] {
    const errors: RenderError[] = [];
    
    // Check for unmatched brackets/parentheses
    const brackets = { '(': ')', '[': ']', '{': '}' };
    const stack: string[] = [];
    
    for (let i = 0; i < code.length; i++) {
      const char = code[i];
      if (char in brackets) {
        stack.push(char);
      } else if (Object.values(brackets).includes(char)) {
        const last = stack.pop();
        if (!last || brackets[last as keyof typeof brackets] !== char) {
          errors.push({
            type: 'syntax',
            message: `Unmatched ${char}`,
            column: i
          });
        }
      }
    }

    // Check for common TypeScript patterns
    if (code.includes(': ') && !code.includes('interface') && !code.includes('type')) {
      // Inline type annotations without interface
      const lines = code.split('\n');
      lines.forEach((line, index) => {
        if (line.includes(': ') && !line.includes('//') && !line.includes('*')) {
          // This might be a type annotation
          if (!line.match(/^\s*(const|let|var|function|\w+\s*:)/)) {
            errors.push({
              type: 'syntax',
              message: 'Possible type annotation syntax error',
              line: index + 1,
              suggestions: ['Check TypeScript syntax for type annotations']
            });
          }
        }
      });
    }

    return errors;
  }

  private validateProps(props: any[]): RenderError[] {
    const errors: RenderError[] = [];
    
    props.forEach((prop, index) => {
      if (!prop.name) {
        errors.push({
          type: 'props',
          message: `Property at index ${index} is missing a name`
        });
      }
      
      if (!prop.type) {
        errors.push({
          type: 'props',
          message: `Property '${prop.name || index}' is missing a type`
        });
      }
    });

    return errors;
  }

  private async transformComponent(
    component: ReactComponent,
    options: RenderingOptions
  ): Promise<ReactComponent> {
    let code = component.code;

    // Add React import if missing
    if (!code.includes('import React') && !code.includes('import * as React')) {
      code = `import React from 'react';\n${code}`;
    }

    // Apply theme transformations
    if (options.theme && options.theme !== 'auto') {
      code = this.applyThemeTransform(code, options.theme);
    }

    // Add responsive viewport meta if needed
    if (options.viewport) {
      code = this.addViewportOptimizations(code, options.viewport);
    }

    // Wrap with error boundary
    code = this.wrapWithErrorBoundary(code);

    return {
      ...component,
      code
    };
  }

  private applyThemeTransform(code: string, theme: 'light' | 'dark'): string {
    // Apply CSS custom properties for theme
    const themeVars = theme === 'dark' 
      ? `
        :root {
          --bg-primary: #1a1a1a;
          --bg-secondary: #2d2d2d;
          --text-primary: #ffffff;
          --text-secondary: #b3b3b3;
          --border-color: #404040;
        }
      `
      : `
        :root {
          --bg-primary: #ffffff;
          --bg-secondary: #f5f5f5;
          --text-primary: #333333;
          --text-secondary: #666666;
          --border-color: #e0e0e0;
        }
      `;

    // Add theme styles
    if (code.includes('<style>')) {
      code = code.replace('<style>', `<style>${themeVars}`);
    } else {
      code = `<style>${themeVars}</style>\n${code}`;
    }

    return code;
  }

  private addViewportOptimizations(code: string, viewport: string): string {
    const viewportCSS = {
      mobile: 'max-width: 480px; padding: 8px;',
      tablet: 'max-width: 768px; padding: 16px;',
      desktop: 'max-width: 1200px; padding: 24px;'
    };

    const css = viewportCSS[viewport as keyof typeof viewportCSS] || '';
    
    if (css) {
      const containerStyle = `.component-container { ${css} margin: 0 auto; }`;
      if (code.includes('<style>')) {
        code = code.replace('</style>', `${containerStyle}</style>`);
      } else {
        code = `<style>${containerStyle}</style>\n${code}`;
      }
    }

    return code;
  }

  private wrapWithErrorBoundary(code: string): string {
    return `
      import React from 'react';
      
      class ErrorBoundary extends React.Component {
        constructor(props) {
          super(props);
          this.state = { hasError: false, error: null };
        }
        
        static getDerivedStateFromError(error) {
          return { hasError: true, error };
        }
        
        render() {
          if (this.state.hasError) {
            return (
              <div style={{
                padding: '20px',
                border: '1px solid #ff6b6b',
                borderRadius: '4px',
                backgroundColor: '#ffe0e0',
                color: '#d63031'
              }}>
                <h3>Component Error</h3>
                <p>{this.state.error?.message || 'Unknown error occurred'}</p>
              </div>
            );
          }
          
          return this.props.children;
        }
      }
      
      ${code}
      
      const WrappedComponent = (props) => (
        <ErrorBoundary>
          <div className="component-container">
            <Component {...props} />
          </div>
        </ErrorBoundary>
      );
      
      export default WrappedComponent;
    `;
  }

  private createRenderEnvironment(options: RenderingOptions): Record<string, any> {
    return {
      theme: options.theme || 'light',
      viewport: options.viewport || 'desktop',
      isolation: options.isolation !== false,
      showGrid: options.showGrid || false,
      showRuler: options.showRuler || false
    };
  }

  private async executeRender(
    component: ReactComponent,
    environment: Record<string, any>
  ): Promise<string> {
    // In a real implementation, this would use a sandboxed environment
    // For now, we'll return a simulated render result
    const timestamp = new Date().toISOString();
    
    return `
      <div id="react-component-render-${timestamp}" data-environment='${JSON.stringify(environment)}'>
        <!-- Rendered component would appear here -->
        <iframe
          srcDoc="${this.createComponentHTML(component, environment)}"
          style="width: 100%; height: 400px; border: none;"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    `;
  }

  private createComponentHTML(component: ReactComponent, environment: Record<string, any>): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Component Preview</title>
          <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
          <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
          <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
          <style>
            body { 
              margin: 0; 
              padding: 20px; 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
              background: ${environment.theme === 'dark' ? '#1a1a1a' : '#ffffff'};
              color: ${environment.theme === 'dark' ? '#ffffff' : '#333333'};
            }
            ${environment.showGrid ? `
              body::before {
                content: '';
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-image: 
                  linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px);
                background-size: 20px 20px;
                pointer-events: none;
                z-index: -1;
              }
            ` : ''}
          </style>
        </head>
        <body>
          <div id="root"></div>
          <script type="text/babel">
            ${component.code}
            
            const root = ReactDOM.createRoot(document.getElementById('root'));
            root.render(React.createElement(Component, ${JSON.stringify(component.defaultProps || {})}));
          </script>
        </body>
      </html>
    `;
  }

  private estimateBundleSize(component: ReactComponent): number {
    // Rough estimation based on code length and dependencies
    let size = component.code.length;
    
    // Add estimated sizes for common dependencies
    if (component.code.includes('styled-components')) size += 50000;
    if (component.code.includes('@emotion')) size += 30000;
    if (component.code.includes('framer-motion')) size += 100000;
    if (component.code.includes('lodash')) size += 70000;
    
    return size;
  }

  private updatePerformanceMetrics(componentId: string, renderTime: number): void {
    const state = this.renderingState.get(componentId);
    if (!state) return;

    state.performance.lastRenderTime = renderTime;
    state.performance.totalRenderTime += renderTime;
    state.performance.averageRenderTime = 
      state.performance.totalRenderTime / (state.renderCount + 1);
  }

  private parseRenderError(error: any): RenderError {
    if (error instanceof Error) {
      // Try to extract line/column information
      const stackMatch = error.stack?.match(/:(\d+):(\d+)/);
      
      return {
        type: this.categorizeError(error.message),
        message: error.message,
        line: stackMatch ? parseInt(stackMatch[1]) : undefined,
        column: stackMatch ? parseInt(stackMatch[2]) : undefined,
        stack: error.stack,
        suggestions: this.generateErrorSuggestions(error.message)
      };
    }
    
    return {
      type: 'runtime',
      message: String(error),
      suggestions: ['Check console for more details']
    };
  }

  private categorizeError(message: string): RenderError['type'] {
    if (message.includes('SyntaxError') || message.includes('Unexpected token')) {
      return 'syntax';
    }
    if (message.includes('Cannot resolve module') || message.includes('Module not found')) {
      return 'import';
    }
    if (message.includes('Props') || message.includes('property')) {
      return 'props';
    }
    if (message.includes('style') || message.includes('CSS')) {
      return 'styling';
    }
    return 'runtime';
  }

  private generateErrorSuggestions(message: string): string[] {
    const suggestions: string[] = [];
    
    if (message.includes('Unexpected token')) {
      suggestions.push('Check for missing semicolons or brackets');
      suggestions.push('Verify JSX syntax is correct');
    }
    
    if (message.includes('Module not found')) {
      suggestions.push('Check import paths');
      suggestions.push('Ensure all dependencies are available');
    }
    
    if (message.includes('undefined')) {
      suggestions.push('Check for undefined variables or props');
      suggestions.push('Add default values for optional props');
    }
    
    return suggestions;
  }

  // Public API methods
  getRenderingState(componentId: string): RenderingState | undefined {
    return this.renderingState.get(componentId);
  }

  getAllRenderingStates(): Map<string, RenderingState> {
    return new Map(this.renderingState);
  }

  clearRenderingState(componentId: string): void {
    this.renderingState.delete(componentId);
    this.renderQueue.delete(componentId);
    
    const timer = this.renderTimers.get(componentId);
    if (timer) {
      clearTimeout(timer);
      this.renderTimers.delete(componentId);
    }
  }

  setDebounceTime(ms: number): void {
    this.debounceTime = Math.max(100, Math.min(2000, ms));
  }

  setMaxConcurrentRenders(max: number): void {
    this.maxConcurrentRenders = Math.max(1, Math.min(10, max));
  }
}

export const realTimeRenderer = new RealTimeRendererService();

import React from 'react';
import { ReactComponent } from '@/types/react-components';

/**
 * Dynamic React component renderer for live previews
 */

/**
 * Render a React component dynamically from code string
 */
export function renderComponentFromCode(
  componentCode: string,
  props: Record<string, any> = {}
): Promise<React.ComponentType<any> | null> {
  return new Promise((resolve, reject) => {
    try {
      // Clean the component code
      const cleanCode = sanitizeComponentCode(componentCode);
      
      // Create a function that returns the component
      const componentFunction = new Function(
        'React',
        'props',
        `
        ${cleanCode}
        
        // Try to find the component export
        if (typeof ${extractComponentName(cleanCode)} !== 'undefined') {
          return ${extractComponentName(cleanCode)};
        }
        
        // Fallback: look for any function that looks like a component
        const componentFunctions = Object.keys(this).filter(key => 
          typeof this[key] === 'function' && 
          key[0] === key[0].toUpperCase()
        );
        
        if (componentFunctions.length > 0) {
          return this[componentFunctions[0]];
        }
        
        return null;
        `
      );

      const Component = componentFunction(React, props);
      resolve(Component);
    } catch (error) {
      console.error('Error rendering component:', error);
      reject(error);
    }
  });
}

/**
 * Create a safe preview component wrapper
 */
export function createPreviewComponent(
  componentCode: string,
  props: Record<string, any> = {}
): React.ComponentType<any> {
  return function PreviewWrapper() {
    const [Component, setComponent] = React.useState<React.ComponentType<any> | null>(null);
    const [error, setError] = React.useState<string | null>(null);

    React.useEffect(() => {
      renderComponentFromCode(componentCode, props)
        .then(setComponent)
        .catch((err) => {
          console.error('Preview render error:', err);
          setError(err.message);
        });
    }, [componentCode, props]);

    if (error) {
      return React.createElement('div', {
        className: 'p-4 bg-red-50 border border-red-200 rounded-lg text-red-700',
        children: [
          React.createElement('h3', { 
            className: 'font-medium mb-2',
            children: 'Preview Error'
          }),
          React.createElement('p', { 
            className: 'text-sm',
            children: error
          })
        ]
      });
    }

    if (!Component) {
      return React.createElement('div', {
        className: 'p-4 bg-gray-50 border border-gray-200 rounded-lg',
        children: React.createElement('div', {
          className: 'animate-pulse flex items-center justify-center',
          children: 'Loading preview...'
        })
      });
    }

    // Wrap in error boundary
    return React.createElement(ErrorBoundary, {
      children: React.createElement(Component, props)
    });
  };
}

/**
 * Error boundary for component previews
 */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Component preview error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return React.createElement('div', {
        className: 'p-4 bg-red-50 border border-red-200 rounded-lg',
        children: [
          React.createElement('h3', {
            className: 'text-red-800 font-medium mb-2',
            children: 'Component Error'
          }),
          React.createElement('p', {
            className: 'text-red-600 text-sm',
            children: this.state.error?.message || 'Something went wrong in the component'
          }),
          React.createElement('button', {
            className: 'mt-2 px-3 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded text-sm',
            onClick: () => this.setState({ hasError: false }),
            children: 'Try Again'
          })
        ]
      });
    }

    return this.props.children;
  }
}

/**
 * Sanitize component code for safe execution
 */
function sanitizeComponentCode(code: string): string {
  // Remove dangerous patterns
  let sanitized = code
    .replace(/import\s+.*?from\s+['"][^'"]*['"];?\s*/g, '') // Remove imports
    .replace(/export\s+default\s+/g, '') // Remove export default
    .replace(/export\s+{[^}]*}\s*;?\s*/g, '') // Remove named exports
    .replace(/console\.(log|warn|error|info)/g, '// console.$1') // Comment out console
    .replace(/alert\s*\(/g, '// alert(') // Comment out alerts
    .replace(/document\./g, '// document.') // Comment out document access
    .replace(/window\./g, '// window.') // Comment out window access
    .replace(/localStorage/g, '// localStorage') // Comment out localStorage
    .replace(/sessionStorage/g, '// sessionStorage'); // Comment out sessionStorage

  return sanitized;
}

/**
 * Extract component name from code
 */
function extractComponentName(code: string): string {
  // Look for function component
  const functionMatch = code.match(/function\s+([A-Z]\w*)/);
  if (functionMatch) {
    return functionMatch[1];
  }

  // Look for const component
  const constMatch = code.match(/const\s+([A-Z]\w*)\s*=/);
  if (constMatch) {
    return constMatch[1];
  }

  // Look for arrow function component
  const arrowMatch = code.match(/const\s+([A-Z]\w*)\s*:\s*React\.FC/);
  if (arrowMatch) {
    return arrowMatch[1];
  }

  return 'UnknownComponent';
}

/**
 * Create iframe-based preview (safer alternative)
 */
export function createIframePreview(
  componentCode: string,
  props: Record<string, any> = {},
  styling: string = 'tailwind'
): string {
  const componentName = extractComponentName(componentCode);
  
  const htmlTemplate = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Component Preview</title>
  ${getStylingHead(styling)}
  <script src="https://unpkg.com/react@18/umd/react.development.js"></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
</head>
<body>
  <div id="root"></div>
  
  <script type="text/babel">
    ${componentCode}
    
    const props = ${JSON.stringify(props)};
    
    const root = ReactDOM.createRoot(document.getElementById('root'));
    
    try {
      root.render(React.createElement(${componentName}, props));
    } catch (error) {
      console.error('Render error:', error);
      root.render(
        React.createElement('div', {
          style: { 
            padding: '20px', 
            backgroundColor: '#fef2f2', 
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#b91c1c'
          }
        }, 'Error rendering component: ' + error.message)
      );
    }
  </script>
</body>
</html>`;

  return htmlTemplate;
}

/**
 * Get styling head content based on styling method
 */
function getStylingHead(styling: string): string {
  switch (styling) {
    case 'tailwind':
      return '<script src="https://cdn.tailwindcss.com"></script>';
    
    case 'chakra-ui':
      return `
        <script src="https://unpkg.com/@chakra-ui/react@latest/dist/index.js"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
      `;
    
    case 'material-ui':
      return `
        <script src="https://unpkg.com/@mui/material@latest/umd/material-ui.development.js"></script>
        <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet">
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
      `;
    
    case 'styled-components':
      return '<script src="https://unpkg.com/styled-components@latest/dist/styled-components.min.js"></script>';
    
    default:
      return `
        <style>
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            margin: 0;
            padding: 20px;
          }
          * { box-sizing: border-box; }
        </style>
      `;
  }
}

/**
 * Extract styling dependencies from component code
 */
export function extractStylingDependencies(code: string): string[] {
  const dependencies: string[] = [];
  
  if (code.includes('styled-components') || code.includes('styled.')) {
    dependencies.push('styled-components');
  }
  
  if (code.includes('@chakra-ui') || code.includes('ChakraProvider')) {
    dependencies.push('@chakra-ui/react', '@emotion/react', '@emotion/styled');
  }
  
  if (code.includes('@mui/') || code.includes('MaterialUI')) {
    dependencies.push('@mui/material', '@emotion/react', '@emotion/styled');
  }
  
  if (code.includes('framer-motion')) {
    dependencies.push('framer-motion');
  }
  
  return dependencies;
}

/**
 * Validate component code before rendering
 */
export function validateComponentCode(code: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check for required React patterns
  if (!code.includes('function') && !code.includes('const') && !code.includes('class')) {
    errors.push('No valid React component found');
  }

  // Check for dangerous patterns
  if (code.includes('eval(')) {
    errors.push('eval() is not allowed for security reasons');
  }

  if (code.includes('Function(')) {
    errors.push('Function constructor is not allowed for security reasons');
  }

  // Check for common issues
  if (code.includes('useState') && !code.includes('React.useState') && !code.includes('import')) {
    warnings.push('useState might need React import or React.useState');
  }

  if (code.includes('useEffect') && !code.includes('React.useEffect') && !code.includes('import')) {
    warnings.push('useEffect might need React import or React.useEffect');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

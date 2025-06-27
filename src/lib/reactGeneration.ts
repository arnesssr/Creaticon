import { 
  ReactComponent, 
  ComponentGenerationRequest, 
  ComponentGenerationResponse, 
  ReactGenerationPrompt,
  GenerationContext,
  ComponentCategory,
  ComponentFramework,
  StylingMethod 
} from '@/types/react-components';
import { generateWithBestProvider } from '@/lib/aiServices';

/**
 * Generates React components using AI providers
 */
export async function generateReactComponent(
  request: ComponentGenerationRequest
): Promise<ComponentGenerationResponse> {
  try {
    const prompt = buildReactGenerationPrompt(request);
    
    const response = await generateWithBestProvider({
      projectDescription: prompt.userDescription,
      projectType: 'react-component',
      stylePreference: 'modern',
      colorScheme: request.theme || 'auto',
      provider: 'auto',
      additionalContext: {
        framework: request.framework,
        styling: request.styling,
        complexity: request.complexity,
        responsive: request.responsive,
        accessibility: request.accessibility
      }
    });

    if (response.success && response.html) {
      const component = parseGeneratedReactComponent(response.html, request);
      return {
        success: true,
        component
      };
    } else {
      return {
        success: false,
        error: response.error || 'Failed to generate React component'
      };
    }
  } catch (error) {
    console.error('React component generation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Builds specialized prompt for React component generation
 */
function buildReactGenerationPrompt(request: ComponentGenerationRequest): ReactGenerationPrompt {
  const basePrompt = `Create a ${request.framework} component with the following specifications:

COMPONENT DESCRIPTION: ${request.description}

REQUIREMENTS:
- Framework: ${request.framework}
- Styling: ${request.styling}
- Complexity: ${request.complexity || 'medium'}
- Responsive: ${request.responsive ? 'Yes' : 'No'}
- Accessibility: ${request.accessibility ? 'Full WCAG compliance' : 'Basic accessibility'}
- Category: ${request.category || 'general'}

TECHNICAL SPECIFICATIONS:
${getFrameworkSpecificInstructions(request.framework)}
${getStylingSpecificInstructions(request.styling)}
${getAccessibilityInstructions(request.accessibility)}
${getResponsiveInstructions(request.responsive)}

OUTPUT REQUIREMENTS:
1. Provide complete, production-ready React component code
2. Include proper TypeScript types if using TypeScript
3. Add comprehensive prop definitions with defaults
4. Include usage examples
5. Ensure code follows React best practices
6. Add proper error handling and loading states where applicable

COMPONENT STRUCTURE:
- Export as default function component
- Use proper naming conventions
- Include prop validation
- Add meaningful comments for complex logic
- Ensure component is reusable and customizable

Please generate only the component code without additional explanations.`;

  return {
    userDescription: basePrompt,
    category: request.category || 'layout',
    framework: request.framework,
    styling: request.styling,
    complexity: request.complexity || 'medium',
    responsive: request.responsive,
    accessibility: request.accessibility
  };
}

/**
 * Get framework-specific instructions
 */
function getFrameworkSpecificInstructions(framework: ComponentFramework): string {
  switch (framework) {
    case 'react-typescript':
      return `- Use TypeScript with proper type definitions
- Export interfaces for all props
- Use generic types where appropriate
- Include proper JSDoc comments`;
    
    case 'next':
      return `- Follow Next.js conventions
- Use Next.js specific features when appropriate (Image, Link, etc.)
- Consider SSR compatibility
- Include proper metadata if needed`;
    
    case 'remix':
      return `- Follow Remix conventions
- Consider server-side rendering
- Use Remix specific hooks when appropriate
- Ensure progressive enhancement`;
    
    case 'vite-react':
      return `- Optimize for Vite bundling
- Use ES modules syntax
- Consider hot module replacement
- Include proper imports`;
    
    default:
      return `- Use standard React patterns
- Follow React best practices
- Ensure component is framework-agnostic`;
  }
}

/**
 * Get styling-specific instructions
 */
function getStylingSpecificInstructions(styling: StylingMethod): string {
  switch (styling) {
    case 'tailwind':
      return `- Use Tailwind CSS classes exclusively
- Follow Tailwind naming conventions
- Use responsive prefixes (sm:, md:, lg:, xl:)
- Utilize Tailwind's design system (spacing, colors, etc.)
- Include dark mode variants when appropriate`;
    
    case 'styled-components':
      return `- Use styled-components for all styling
- Create reusable styled components
- Use theme provider for consistent styling
- Include proper TypeScript types for styled components`;
    
    case 'css-modules':
      return `- Create separate CSS module file
- Use camelCase class names
- Follow BEM naming conventions within modules
- Include responsive styles`;
    
    case 'emotion':
      return `- Use Emotion for CSS-in-JS
- Utilize emotion's css prop and styled components
- Include theme support
- Use emotion's responsive utilities`;
    
    case 'chakra-ui':
      return `- Use Chakra UI components and styling system
- Follow Chakra UI patterns and conventions
- Utilize Chakra's responsive arrays
- Use Chakra's color mode support`;
    
    case 'material-ui':
      return `- Use Material-UI components and styling
- Follow Material Design principles
- Use MUI's theme system
- Include proper MUI imports`;
    
    default:
      return `- Use vanilla CSS with proper class naming
- Follow standard CSS conventions
- Include responsive media queries
- Use CSS custom properties for theming`;
  }
}

/**
 * Get accessibility instructions
 */
function getAccessibilityInstructions(accessibility: boolean): string {
  if (!accessibility) {
    return `- Include basic accessibility features (alt text, labels)`;
  }
  
  return `- Full WCAG 2.1 AA compliance
- Proper ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader compatibility
- Color contrast compliance
- Semantic HTML structure
- Proper heading hierarchy`;
}

/**
 * Get responsive design instructions
 */
function getResponsiveInstructions(responsive: boolean): string {
  if (!responsive) {
    return `- Fixed desktop layout is acceptable`;
  }
  
  return `- Mobile-first responsive design
- Support for mobile, tablet, and desktop
- Flexible layouts using modern CSS
- Touch-friendly interactive elements
- Appropriate font sizes for all devices
- Optimized spacing for different screen sizes`;
}

/**
 * Parse the generated component from AI response
 */
function parseGeneratedReactComponent(
  generatedCode: string, 
  request: ComponentGenerationRequest
): ReactComponent {
  // Extract component code from the response
  const componentCode = extractComponentCode(generatedCode);
  const componentName = extractComponentName(componentCode);
  const props = extractComponentProps(componentCode);
  const dependencies = extractDependencies(componentCode);
  
  const component: ReactComponent = {
    id: generateId(),
    name: componentName,
    displayName: componentName.replace(/([A-Z])/g, ' $1').trim(),
    description: request.description,
    code: componentCode,
    props,
    dependencies,
    category: request.category || 'layout',
    framework: request.framework,
    styling: request.styling,
    preview: {
      livePreview: generateLivePreview(componentCode),
      codePreview: formatCodeForDisplay(componentCode),
      usage: generateUsageExample(componentName, props)
    },
    responsive: request.responsive,
    accessibility: {
      ariaLabels: request.accessibility,
      keyboardNavigation: request.accessibility,
      screenReaderFriendly: request.accessibility
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return component;
}

/**
 * Extract clean component code from AI response
 */
function extractComponentCode(response: string): string {
  // Remove markdown code blocks
  let code = response.replace(/```[a-zA-Z]*\n?/g, '');
  
  // Find React component pattern
  const componentMatch = code.match(/(?:export\s+default\s+)?(?:function|const)\s+\w+.*?(?=\n(?:export|function|const|$))/s);
  
  if (componentMatch) {
    return componentMatch[0].trim();
  }
  
  // Fallback: return cleaned response
  return code.trim();
}

/**
 * Extract component name from code
 */
function extractComponentName(code: string): string {
  const functionMatch = code.match(/(?:function|const)\s+(\w+)/);
  
  if (functionMatch) {
    return functionMatch[1];
  }
  
  return 'GeneratedComponent';
}

/**
 * Extract component props from code
 */
function extractComponentProps(code: string): any[] {
  // This is a simplified implementation
  // In a real-world scenario, you'd use a proper TypeScript/JSX parser
  const propsMatch = code.match(/interface\s+(\w+Props)\s*{([^}]*)}/s);
  
  if (propsMatch) {
    const propsContent = propsMatch[2];
    // Parse props from TypeScript interface
    return parsePropsFromInterface(propsContent);
  }
  
  return [];
}

/**
 * Parse props from TypeScript interface string
 */
function parsePropsFromInterface(propsContent: string): any[] {
  const props: any[] = [];
  const lines = propsContent.split('\n').map(line => line.trim()).filter(Boolean);
  
  for (const line of lines) {
    const propMatch = line.match(/(\w+)(\?)?:\s*([^;]+);?/);
    if (propMatch) {
      const [, name, optional, type] = propMatch;
      props.push({
        name,
        type: mapTypeScriptToSimpleType(type.trim()),
        required: !optional,
        description: `${name} prop`
      });
    }
  }
  
  return props;
}

/**
 * Map TypeScript types to simple types
 */
function mapTypeScriptToSimpleType(tsType: string): string {
  if (tsType.includes('string')) return 'string';
  if (tsType.includes('number')) return 'number';
  if (tsType.includes('boolean')) return 'boolean';
  if (tsType.includes('function') || tsType.includes('=>')) return 'function';
  if (tsType.includes('React.ReactNode') || tsType.includes('ReactNode')) return 'node';
  if (tsType.includes('[]') || tsType.includes('Array')) return 'array';
  return 'object';
}

/**
 * Extract dependencies from code
 */
function extractDependencies(code: string): string[] {
  const dependencies: string[] = [];
  const importMatches = code.matchAll(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/g);
  
  for (const match of importMatches) {
    const packageName = match[1];
    if (!packageName.startsWith('.') && !packageName.startsWith('/')) {
      dependencies.push(packageName);
    }
  }
  
  return [...new Set(dependencies)]; // Remove duplicates
}

/**
 * Generate live preview HTML
 */
function generateLivePreview(componentCode: string): string {
  // This would integrate with a React renderer in a real implementation
  return `<div>Live preview would be rendered here</div>`;
}

/**
 * Format code for display with syntax highlighting
 */
function formatCodeForDisplay(code: string): string {
  // This would integrate with a syntax highlighter like Prism.js
  return code;
}

/**
 * Generate usage example
 */
function generateUsageExample(componentName: string, props: any[]): string {
  const propExamples = props
    .filter(prop => prop.required)
    .map(prop => `${prop.name}={${getExampleValue(prop.type)}}`)
    .join(' ');
    
  return `<${componentName} ${propExamples} />`;
}

/**
 * Get example value for prop type
 */
function getExampleValue(type: string): string {
  switch (type) {
    case 'string': return '"example"';
    case 'number': return '42';
    case 'boolean': return 'true';
    case 'function': return '() => {}';
    case 'array': return '[]';
    case 'node': return '<div>content</div>';
    default: return '{}';
  }
}

/**
 * Generate unique ID
 */
function generateId(): string {
  return `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

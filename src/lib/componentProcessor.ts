import { ReactComponent, ComponentProp, ExportOptions, ExportResult } from '@/types/react-components';

/**
 * Enhanced component processing utilities
 */

/**
 * Validates React component code for syntax and best practices
 */
export function validateComponentCode(code: string): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Basic syntax checks
  if (!code.includes('export default') && !code.includes('export {')) {
    errors.push('Component must have a default export or named export');
  }

  if (!code.includes('function') && !code.includes('const') && !code.includes('class')) {
    errors.push('No valid React component declaration found');
  }

  // React best practices checks
  if (!code.includes('React') && !code.includes('import')) {
    warnings.push('Consider importing React explicitly for better compatibility');
  }

  if (code.includes('innerHTML') || code.includes('dangerouslySetInnerHTML')) {
    warnings.push('Be careful with innerHTML usage - potential XSS vulnerability');
  }

  // TypeScript checks
  if (code.includes('any') && code.includes('interface')) {
    warnings.push('Consider using specific types instead of "any" for better type safety');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Enhances component with additional metadata and optimizations
 */
export function enhanceComponent(component: ReactComponent): ReactComponent {
  const enhanced = { ...component };

  // Add inferred props if none exist
  if (enhanced.props.length === 0) {
    enhanced.props = inferPropsFromCode(enhanced.code);
  }

  // Add performance optimizations suggestions
  enhanced.preview.usage = generateOptimizedUsage(enhanced);

  // Add accessibility improvements
  enhanced.accessibility = enhanceAccessibility(enhanced.code, enhanced.accessibility);

  return enhanced;
}

/**
 * Infer props from component code
 */
function inferPropsFromCode(code: string): ComponentProp[] {
  const props: ComponentProp[] = [];

  // Look for destructured props in function parameters
  const destructureMatch = code.match(/\(\s*{\s*([^}]+)\s*}\s*[):]/) || 
                          code.match(/\(\s*props\s*:\s*{\s*([^}]+)\s*}\s*\)/);

  if (destructureMatch) {
    const propsString = destructureMatch[1];
    const propNames = propsString.split(',').map(p => p.trim().split(':')[0].trim());

    propNames.forEach(name => {
      if (name && !name.includes('...')) { // Skip spread operator
        props.push({
          name: name.replace(/[?=].*/, ''), // Remove optional markers and defaults
          type: 'string', // Default type
          required: !name.includes('?'),
          description: `${name} prop`
        });
      }
    });
  }

  return props;
}

/**
 * Generate optimized usage examples
 */
function generateOptimizedUsage(component: ReactComponent): string {
  const { name, props } = component;
  
  // Basic usage
  let usage = `// Basic usage\nimport ${name} from './${name}';\n\n`;
  
  // Example with props
  if (props.length > 0) {
    const requiredProps = props.filter(p => p.required);
    const optionalProps = props.filter(p => !p.required);

    if (requiredProps.length > 0) {
      const propsExample = requiredProps
        .map(prop => `  ${prop.name}={${getExampleValue(prop.type)}}`)
        .join('\n');
      
      usage += `<${name}\n${propsExample}\n/>\n\n`;
    }

    if (optionalProps.length > 0) {
      usage += `// With optional props\n`;
      const allPropsExample = props
        .map(prop => `  ${prop.name}={${getExampleValue(prop.type)}}`)
        .join('\n');
      
      usage += `<${name}\n${allPropsExample}\n/>\n\n`;
    }
  } else {
    usage += `<${name} />\n\n`;
  }

  // Performance tips
  if (component.code.includes('useState') || component.code.includes('useEffect')) {
    usage += `// Performance tip: Wrap in React.memo if props don't change frequently\nconst Memoized${name} = React.memo(${name});\n\n`;
  }

  return usage;
}

/**
 * Get example value for prop type
 */
function getExampleValue(type: string): string {
  switch (type) {
    case 'string': return '"Hello World"';
    case 'number': return '42';
    case 'boolean': return 'true';
    case 'function': return '() => console.log("clicked")';
    case 'array': return '[1, 2, 3]';
    case 'node': return '<span>Content</span>';
    case 'object': return '{ key: "value" }';
    default: return '{}';
  }
}

/**
 * Enhance accessibility metadata
 */
function enhanceAccessibility(code: string, currentA11y: any): any {
  const enhanced = { ...currentA11y };

  // Check for ARIA attributes
  enhanced.ariaLabels = code.includes('aria-') || code.includes('ariaLabel');
  
  // Check for keyboard event handlers
  enhanced.keyboardNavigation = code.includes('onKeyDown') || 
                                code.includes('onKeyPress') || 
                                code.includes('onKeyUp') ||
                                code.includes('tabIndex');

  // Check for semantic HTML
  enhanced.screenReaderFriendly = code.includes('<button') ||
                                  code.includes('<nav') ||
                                  code.includes('<header') ||
                                  code.includes('<main') ||
                                  code.includes('<section') ||
                                  code.includes('role=');

  return enhanced;
}

/**
 * Generate component exports in different formats
 */
export function exportComponent(
  component: ReactComponent,
  options: ExportOptions
): ExportResult {
  const files: ExportResult['files'] = [];
  const dependencies: string[] = [...component.dependencies];

  // Main component file
  const componentFile = generateComponentFile(component, options);
  files.push(componentFile);

  // Styles file (if separate styling)
  if (options.includeStyles && shouldGenerateSeparateStyles(component.styling)) {
    const stylesFile = generateStylesFile(component, options);
    files.push(stylesFile);
  }

  // PropTypes file (if requested)
  if (options.includePropTypes && component.framework === 'react') {
    const propTypesFile = generatePropTypesFile(component);
    files.push(propTypesFile);
    dependencies.push('prop-types');
  }

  // Storybook file (if requested)
  if (options.includeStorybook) {
    const storyFile = generateStoryFile(component);
    files.push(storyFile);
    dependencies.push('@storybook/react');
  }

  // Test file (if requested)
  if (options.includeTests) {
    const testFile = generateTestFile(component, options);
    files.push(testFile);
    dependencies.push('@testing-library/react', '@testing-library/jest-dom');
  }

  // Package.json (if package bundle)
  if (options.bundleType === 'package') {
    const packageFile = generatePackageJson(component, dependencies, options);
    files.push(packageFile);
  }

  // README.md
  const readmeFile = generateReadmeFile(component, options);
  files.push(readmeFile);

  return {
    files,
    instructions: generateInstructions(component, options),
    dependencies: [...new Set(dependencies)]
  };
}

/**
 * Generate main component file
 */
function generateComponentFile(
  component: ReactComponent,
  options: ExportOptions
): ExportResult['files'][0] {
  let code = component.code;
  
  // Convert to TypeScript if requested
  if (options.format === 'tsx' || options.format === 'ts') {
    code = convertToTypeScript(code, component);
  }

  // Add PropTypes if requested
  if (options.includePropTypes && !code.includes('PropTypes')) {
    code += '\n\n' + generatePropTypesCode(component);
  }

  return {
    name: `${component.name}.${options.format}`,
    content: code,
    type: 'component'
  };
}

/**
 * Check if separate styles file should be generated
 */
function shouldGenerateSeparateStyles(styling: string): boolean {
  return styling === 'css-modules' || styling === 'vanilla-css';
}

/**
 * Generate styles file
 */
function generateStylesFile(
  component: ReactComponent,
  options: ExportOptions
): ExportResult['files'][0] {
  const extension = component.styling === 'css-modules' ? 'module.css' : 'css';
  
  return {
    name: `${component.name}.${extension}`,
    content: extractStylesFromCode(component.code),
    type: 'style'
  };
}

/**
 * Extract styles from component code
 */
function extractStylesFromCode(code: string): string {
  // This is a simplified implementation
  // In practice, you'd need a more sophisticated CSS extraction
  const styleMatch = code.match(/const styles = `([^`]+)`/);
  
  if (styleMatch) {
    return styleMatch[1];
  }
  
  return `/* Styles for component */\n.container {\n  /* Add your styles here */\n}`;
}

/**
 * Generate PropTypes code
 */
function generatePropTypesCode(component: ReactComponent): string {
  const propTypesEntries = component.props.map(prop => {
    const type = mapToPropType(prop.type);
    const required = prop.required ? '.isRequired' : '';
    return `  ${prop.name}: PropTypes.${type}${required}`;
  });

  return `import PropTypes from 'prop-types';\n\n${component.name}.propTypes = {\n${propTypesEntries.join(',\n')}\n};`;
}

/**
 * Map component prop type to PropTypes
 */
function mapToPropType(type: string): string {
  switch (type) {
    case 'string': return 'string';
    case 'number': return 'number';
    case 'boolean': return 'bool';
    case 'function': return 'func';
    case 'array': return 'array';
    case 'node': return 'node';
    case 'object': return 'object';
    default: return 'any';
  }
}

/**
 * Generate PropTypes file
 */
function generatePropTypesFile(component: ReactComponent): ExportResult['files'][0] {
  return {
    name: `${component.name}.propTypes.js`,
    content: generatePropTypesCode(component),
    type: 'component'
  };
}

/**
 * Generate Storybook story file
 */
function generateStoryFile(component: ReactComponent): ExportResult['files'][0] {
  const stories = `import { Meta, StoryObj } from '@storybook/react';
import ${component.name} from './${component.name}';

const meta: Meta<typeof ${component.name}> = {
  title: 'Components/${component.name}',
  component: ${component.name},
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    ${component.props.filter(p => p.required).map(prop => 
      `${prop.name}: ${getExampleValue(prop.type)}`
    ).join(',\n    ')}
  },
};

${component.props.length > 0 ? `
export const WithAllProps: Story = {
  args: {
    ${component.props.map(prop => 
      `${prop.name}: ${getExampleValue(prop.type)}`
    ).join(',\n    ')}
  },
};` : ''}`;

  return {
    name: `${component.name}.stories.tsx`,
    content: stories,
    type: 'story'
  };
}

/**
 * Generate test file
 */
function generateTestFile(
  component: ReactComponent,
  options: ExportOptions
): ExportResult['files'][0] {
  const extension = options.format.includes('ts') ? 'tsx' : 'jsx';
  
  const testCode = `import { render, screen } from '@testing-library/react';
import ${component.name} from './${component.name}';

describe('${component.name}', () => {
  it('renders without crashing', () => {
    render(<${component.name} ${component.props.filter(p => p.required).map(prop => 
      `${prop.name}={${getExampleValue(prop.type)}}`
    ).join(' ')} />);
  });

  ${component.props.map(prop => `
  it('handles ${prop.name} prop correctly', () => {
    const testValue = ${getExampleValue(prop.type)};
    render(<${component.name} ${prop.name}={testValue} />);
    // Add specific assertions based on prop behavior
  });`).join('\n')}
});`;

  return {
    name: `${component.name}.test.${extension}`,
    content: testCode,
    type: 'test'
  };
}

/**
 * Generate package.json for component package
 */
function generatePackageJson(
  component: ReactComponent,
  dependencies: string[],
  options: ExportOptions
): ExportResult['files'][0] {
  const packageJson = {
    name: component.name.toLowerCase().replace(/([A-Z])/g, '-$1').substring(1),
    version: '1.0.0',
    description: component.description,
    main: `${component.name}.js`,
    module: `${component.name}.js`,
    types: `${component.name}.d.ts`,
    scripts: {
      build: 'npm run build',
      test: 'jest',
      storybook: 'start-storybook'
    },
    peerDependencies: {
      react: '^18.0.0',
      'react-dom': '^18.0.0'
    },
    dependencies: dependencies.reduce((acc, dep) => {
      acc[dep] = 'latest';
      return acc;
    }, {} as Record<string, string>),
    keywords: [component.category, 'react', 'component', 'ui'],
    author: 'AI-Generated Component',
    license: 'MIT'
  };

  return {
    name: 'package.json',
    content: JSON.stringify(packageJson, null, 2),
    type: 'package'
  };
}

/**
 * Generate README file
 */
function generateReadmeFile(
  component: ReactComponent,
  options: ExportOptions
): ExportResult['files'][0] {
  const readme = `# ${component.displayName}

${component.description}

## Installation

\`\`\`bash
npm install ${component.name.toLowerCase()}
\`\`\`

## Usage

\`\`\`jsx
${component.preview.usage}
\`\`\`

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
${component.props.map(prop => 
  `| ${prop.name} | ${prop.type} | ${prop.required ? 'Yes' : 'No'} | ${prop.description || 'No description'} |`
).join('\n')}

## Features

- ✅ ${component.responsive ? 'Responsive design' : 'Fixed layout'}
- ✅ ${component.accessibility.ariaLabels ? 'ARIA labels' : 'Basic accessibility'}
- ✅ ${component.accessibility.keyboardNavigation ? 'Keyboard navigation' : 'Mouse/touch navigation'}
- ✅ ${component.framework} compatible
- ✅ ${component.styling} styling

## Dependencies

${component.dependencies.map(dep => `- ${dep}`).join('\n')}

## License

MIT
`;

  return {
    name: 'README.md',
    content: readme,
    type: 'readme'
  };
}

/**
 * Convert JavaScript to TypeScript
 */
function convertToTypeScript(code: string, component: ReactComponent): string {
  let tsCode = code;

  // Add React import if not present
  if (!tsCode.includes('import React')) {
    tsCode = `import React from 'react';\n\n${tsCode}`;
  }

  // Add prop interface if not present
  if (component.props.length > 0 && !tsCode.includes('interface')) {
    const propsInterface = generatePropsInterface(component);
    tsCode = `${propsInterface}\n\n${tsCode}`;
  }

  return tsCode;
}

/**
 * Generate TypeScript props interface
 */
function generatePropsInterface(component: ReactComponent): string {
  const interfaceName = `${component.name}Props`;
  const props = component.props.map(prop => {
    const optional = prop.required ? '' : '?';
    return `  ${prop.name}${optional}: ${mapToTypeScriptType(prop.type)};`;
  });

  return `interface ${interfaceName} {\n${props.join('\n')}\n}`;
}

/**
 * Map simple type to TypeScript type
 */
function mapToTypeScriptType(type: string): string {
  switch (type) {
    case 'string': return 'string';
    case 'number': return 'number';
    case 'boolean': return 'boolean';
    case 'function': return '() => void';
    case 'array': return 'any[]';
    case 'node': return 'React.ReactNode';
    case 'object': return 'Record<string, any>';
    default: return 'any';
  }
}

/**
 * Generate setup instructions
 */
function generateInstructions(
  component: ReactComponent,
  options: ExportOptions
): string {
  return `## Setup Instructions

1. ${options.bundleType === 'single-file' ? 'Copy the component file to your project' : 'Extract all files to your project directory'}

2. Install dependencies:
   \`\`\`bash
   ${options.packageManager} install ${component.dependencies.join(' ')}
   \`\`\`

3. Import and use the component:
   \`\`\`jsx
   import ${component.name} from './${component.name}';
   
   function App() {
     return (
       <${component.name} ${component.props.filter(p => p.required).map(p => `${p.name}={${getExampleValue(p.type)}}`).join(' ')} />
     );
   }
   \`\`\`

${options.includeTests ? '\n4. Run tests:\n   ```bash\n   npm test\n   ```' : ''}

${options.includeStorybook ? '\n5. View in Storybook:\n   ```bash\n   npm run storybook\n   ```' : ''}`;
}

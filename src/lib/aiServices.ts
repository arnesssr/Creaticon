import { UserInput, ReactComponentInput } from '@/types';
import { generateUIWithOpenAI, generateIconsWithOpenAI, generateFastWithOpenAI } from './openaiService';
import { generateUIWithAnthropic, generateIconsWithAnthropic, generateFastWithAnthropic } from './anthropicService';
import { ComponentGenerationRequest, ComponentGenerationResponse } from '@/types/react-components';

export interface GenerationRequest {
  projectDescription: string;
  projectType: string;
  stylePreference: string;
  colorScheme?: string;
  provider?: string;
}

export interface GenerationResponse {
  html: string;
  success: boolean;
  error?: string;
}

export type AIProvider = 'openrouter' | 'openai' | 'anthropic' | 'gemini' | 'huggingface';

export const AI_PROVIDERS = {
  openrouter: {
    name: 'OpenRouter (DeepSeek V3)',
    description: 'Fast, creative AI with access to latest models',
    icon: '🟡',
    models: ['deepseek-chat-v3']
  },
  openai: {
    name: 'OpenAI',
    description: 'GPT-4 and GPT-3.5 for reliable generation',
    icon: '🟢',
    models: ['gpt-4', 'gpt-3.5-turbo']
  },
  anthropic: {
    name: 'Anthropic Claude',
    description: 'Claude Sonnet and Haiku for thoughtful design',
    icon: '🟣',
    models: ['claude-3-sonnet', 'claude-3-haiku']
  },
  gemini: {
    name: 'Google Gemini',
    description: 'Google\'s advanced AI for creative solutions',
    icon: '🔵',
    models: ['gemini-pro']
  },
  huggingface: {
    name: 'Hugging Face',
    description: 'Open-source models for enhancement',
    icon: '🤗',
    models: ['deepseek-coder']
  }
} as const;

// ===== OPENROUTER (DEEPSEEK V3) - UI COMPONENT GENERATION =====
export const generateUIWithOpenRouter = async (input: GenerationRequest): Promise<GenerationResponse> => {
  try {
    console.log('🟡 OpenRouter DeepSeek V3: Generating UI components...');
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    const prompt = `Create a complete, modern HTML page for: "${input.projectDescription}"

Requirements:
- Complete HTML5 structure with DOCTYPE
- Embedded CSS in <style> tags with modern features
- Responsive design with ${input.stylePreference} style
- Color scheme: ${input.colorScheme || 'modern professional'}
- Include custom SVG icons throughout
- Interactive elements with JavaScript
- Mobile-friendly responsive design
- Modern CSS animations and transitions
- Professional layout and typography

Return ONLY the complete HTML code, no explanations.
Start with <!DOCTYPE html> and end with </html>`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'HTTP-Referer': 'https://creaticon.app',
        'X-Title': 'Creaticon - AI Icon Studio',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3-0324:free",
        messages: [
          {
            role: "system",
            content: "You are a professional frontend developer creating modern, responsive web interfaces."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        stream: false,
        temperature: 0.7,
        max_tokens: 8000
      })
    });

    if (!response.ok) {
      throw new Error('OpenRouter API error: ' + response.status);
    }

    const result = await response.json();
    const html = result.choices[0]?.message?.content || '';

    return {
      html: cleanHTML(html),
      success: true
    };
  } catch (error) {
    console.error('❌ OpenRouter UI Generation Error:', error);
    return {
      html: '',
      success: false,
      error: error instanceof Error ? error.message : 'OpenRouter UI generation failed'
    };
  }
};

// ===== OPENROUTER (DEEPSEEK V3) - ICON GENERATION =====
export const generateIconsWithOpenRouter = async (input: GenerationRequest): Promise<GenerationResponse> => {
  try {
    console.log('🟡 OpenRouter DeepSeek V3: Generating icons...');
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenRouter API key not configured');
    }

    const prompt = `Create a beautiful icon pack for: "${input.projectDescription}"

ICON LIBRARY INSPIRATION:
- Lucide (clean, minimal)
- Heroicons (modern, professional)
- Feather (lightweight, elegant)
- Phosphor (versatile, comprehensive)

REQUIREMENTS:
1. Analyze the app purpose and create 20-30 contextual SVG icons
2. Categories: Navigation, Actions, Content, Communication, Status
3. Style: ${input.stylePreference}
4. Colors: ${input.colorScheme || 'modern gradients'}
5. Each icon 24x24 viewBox with semantic naming
6. Hover animations and modern CSS effects
7. Responsive grid layout with categories

Return a complete HTML document with:
- DOCTYPE declaration
- Embedded CSS with animations
- All SVG icons organized by category
- Interactive demonstrations
- Size variants (16px, 24px, 32px, 48px)

Return ONLY HTML code, no explanations.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'HTTP-Referer': 'https://creaticon.app',
        'X-Title': 'Creaticon - AI Icon Studio',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat-v3-0324:free",
        messages: [
          {
            role: "system",
            content: "You are a professional icon designer creating beautiful, contextual SVG icon packs."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        stream: false,
        temperature: 0.7,
        max_tokens: 8000
      })
    });

    if (!response.ok) {
      throw new Error('OpenRouter API error: ' + response.status);
    }

    const result = await response.json();
    const html = result.choices[0]?.message?.content || '';

    return {
      html: cleanHTML(html),
      success: true
    };
  } catch (error) {
    console.error('❌ OpenRouter Icon Generation Error:', error);
    return {
      html: '',
      success: false,
      error: error instanceof Error ? error.message : 'OpenRouter icon generation failed'
    };
  }
};

// ===== HUGGING FACE (DEEPSEEK CODER) - STYLING & ENHANCEMENT =====
export const enhanceWithHuggingFace = async (input: GenerationRequest): Promise<GenerationResponse> => {
  try {
    console.log('🔵 Hugging Face DeepSeek: Enhancing styles...');
    const apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
    
    if (!apiKey) {
      throw new Error('Hugging Face API key not configured');
    }

    const prompt = `Enhance and style this web application: "${input.projectDescription}"

ENHANCEMENT REQUIREMENTS:
1. Advanced CSS animations and micro-interactions
2. Modern design patterns and layouts
3. Accessibility improvements
4. Performance optimizations
5. Beautiful color schemes and gradients
6. Responsive design enhancements
7. Interactive JavaScript components

Style: ${input.stylePreference}
Colors: ${input.colorScheme || 'modern professional palette'}

Create a complete HTML document with enhanced styling and interactions.
Return ONLY HTML code with embedded CSS and JavaScript.`;

    const response = await fetch('https://api-inference.huggingface.co/models/deepseek-ai/deepseek-coder-6.7b-instruct', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 6000,
          temperature: 0.7,
          do_sample: true,
          top_p: 0.9,
          return_full_text: false
        }
      })
    });

    if (!response.ok) {
      throw new Error('Hugging Face API error: ' + response.status);
    }

    const result = await response.json();
    const html = Array.isArray(result) ? result[0]?.generated_text || '' : '';

    return {
      html: cleanHTML(html),
      success: true
    };
  } catch (error) {
    console.error('❌ Hugging Face Enhancement Error:', error);
    return {
      html: '',
      success: false,
      error: error instanceof Error ? error.message : 'Hugging Face enhancement failed'
    };
  }
};

// ===== REACT COMPONENT GENERATION =====
export const generateReactComponentWithAI = async (
  request: ComponentGenerationRequest
): Promise<ComponentGenerationResponse> => {
  try {
    console.log('⚛️ Generating React component with AI...');
    
    const prompt = buildReactComponentPrompt(request);
    
    // Try OpenRouter first
    const openrouterKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    if (openrouterKey) {
      console.log('🚀 Using OpenRouter DeepSeek V3 for React component generation...');
      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer ' + openrouterKey,
            'HTTP-Referer': 'https://creaticon.app',
            'X-Title': 'Creaticon - AI React Component Studio',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            model: "deepseek/deepseek-chat-v3-0324:free",
            messages: [
              {
                role: "system",
                content: "You are an expert React developer creating production-ready, accessible components with modern best practices."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            stream: false,
            temperature: 0.7,
            max_tokens: 8000
          })
        });

        if (response.ok) {
          const result = await response.json();
          const componentCode = result.choices[0]?.message?.content || '';
          
          // Parse the generated component
          const component = parseGeneratedReactComponent(componentCode, request);
          
          return {
            success: true,
            component
          };
        } else {
          console.log('OpenRouter failed, trying Gemini fallback...');
        }
      } catch (error) {
        console.error('OpenRouter error:', error);
        console.log('OpenRouter error, trying Gemini fallback...');
      }
    }

    // Fallback to Gemini
    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (geminiKey) {
      console.log('🔵 Using Gemini as fallback for React component generation...');
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `You are an expert React developer. ${prompt}`
              }]
            }],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 8000
            }
          })
        });

        if (response.ok) {
          const result = await response.json();
          const componentCode = result.candidates?.[0]?.content?.parts?.[0]?.text || '';
          
          // Parse the generated component
          const component = parseGeneratedReactComponent(componentCode, request);
          
          return {
            success: true,
            component
          };
        } else {
          console.log('Gemini failed, no more fallbacks available.');
        }
      } catch (error) {
        console.error('Gemini error:', error);
      }
    }

    throw new Error('All AI providers failed. Please check your API keys.');

  } catch (error) {
    console.error('❌ React Component Generation Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'React component generation failed'
    };
  }
};

function buildReactComponentPrompt(request: ComponentGenerationRequest): string {
  return `Create a ${request.framework} component: "${request.description}"

REQUIREMENTS:
- Framework: ${request.framework}
- Styling: ${request.styling}
- Complexity: ${request.complexity || 'medium'}
- Responsive: ${request.responsive ? 'Yes' : 'No'}
- Accessibility: ${request.accessibility ? 'Full WCAG compliance' : 'Basic accessibility'}
- Category: ${request.category || 'general'}

COMPONENT SPECIFICATIONS:
${getFrameworkInstructions(request.framework)}
${getStylingInstructions(request.styling)}
${getAccessibilityInstructions(request.accessibility)}

OUTPUT REQUIREMENTS:
1. Complete, production-ready React component
2. TypeScript if framework includes typescript
3. Proper prop definitions with defaults
4. Include usage examples in comments
5. Follow React best practices
6. Include error handling where appropriate
7. Make component reusable and customizable

Return ONLY the component code, no explanations.`;
}

function getFrameworkInstructions(framework: string): string {
  switch (framework) {
    case 'react-typescript':
      return '- Use TypeScript with proper interfaces\n- Export prop types\n- Include JSDoc comments';
    case 'next':
      return '- Use Next.js conventions\n- Consider SSR compatibility\n- Use Next.js components when appropriate';
    case 'remix':
      return '- Follow Remix patterns\n- Consider progressive enhancement\n- Use Remix hooks when needed';
    default:
      return '- Use standard React patterns\n- Follow React best practices\n- Ensure broad compatibility';
  }
}

function getStylingInstructions(styling: string): string {
  switch (styling) {
    case 'tailwind':
      return '- Use Tailwind CSS classes exclusively\n- Include responsive prefixes\n- Use dark mode variants';
    case 'styled-components':
      return '- Use styled-components for styling\n- Create reusable styled components\n- Include theme support';
    case 'css-modules':
      return '- Create CSS module styles\n- Use camelCase class names\n- Include responsive styles';
    case 'chakra-ui':
      return '- Use Chakra UI components\n- Follow Chakra patterns\n- Use responsive arrays';
    case 'material-ui':
      return '- Use Material-UI components\n- Follow Material Design\n- Use MUI theme system';
    default:
      return '- Use vanilla CSS\n- Include responsive media queries\n- Use CSS custom properties';
  }
}

function getAccessibilityInstructions(accessibility: boolean): string {
  if (!accessibility) {
    return '- Include basic accessibility (alt text, labels)';
  }
  return '- Full WCAG 2.1 AA compliance\n- Proper ARIA labels and roles\n- Keyboard navigation\n- Screen reader compatibility';
}

function parseGeneratedReactComponent(code: string, request: ComponentGenerationRequest): any {
  try {
    // Clean the code more thoroughly
    let cleanCode = code
      .replace(/```[a-zA-Z]*\n?/g, '') // Remove code blocks
      .replace(/^\s*```\s*$/gm, '') // Remove standalone code block markers
      .trim();
    
    // Validate that we have actual code
    if (!cleanCode || cleanCode.length < 10) {
      throw new Error('Generated code is too short or empty');
    }
    
    // Extract component name with better regex
    const nameMatch = cleanCode.match(/(?:export\s+default\s+)?(?:function|const|class)\s+(\w+)/);
    const componentName = nameMatch ? nameMatch[1] : 'GeneratedComponent';
    
    // Extract dependencies more comprehensively
    const dependencies: string[] = ['react'];
    const importMatches = cleanCode.matchAll(/import\s+.*?\s+from\s+['"]([^'"]+)['"]/g);
    for (const match of importMatches) {
      const packageName = match[1];
      if (!packageName.startsWith('.') && !packageName.startsWith('/') && !packageName.startsWith('react/')) {
        dependencies.push(packageName);
      }
    }
    
    // Add styling-specific dependencies
    if (request.styling === 'tailwind' && !dependencies.includes('tailwindcss')) {
      dependencies.push('tailwindcss');
    }
    if (cleanCode.includes('lucide-react') && !dependencies.includes('lucide-react')) {
      dependencies.push('lucide-react');
    }
    
    // Extract props with improved parsing
    const props = extractPropsFromCode(cleanCode);
    
    // Generate better preview content
    const previewHtml = generateComponentPreview(cleanCode, componentName, props);
    
    // Generate usage example
    const usageExample = generateUsageExample(componentName, props);
    
    return {
      id: `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: componentName,
      displayName: componentName.replace(/([A-Z])/g, ' $1').trim(),
      description: request.description,
      code: cleanCode,
      props: props,
      dependencies: [...new Set(dependencies)],
      category: request.category || 'layout',
      framework: request.framework,
      styling: request.styling,
      preview: {
        livePreview: previewHtml,
        codePreview: cleanCode,
        usage: usageExample
      },
      variants: [], // Could be populated later
      responsive: request.responsive || true,
      accessibility: {
        ariaLabels: request.accessibility || false,
        keyboardNavigation: request.accessibility || false,
        screenReaderFriendly: request.accessibility || false
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error parsing generated React component:', error);
    
    // Return a fallback component structure
    return {
      id: `comp_error_${Date.now()}`,
      name: 'ErrorComponent',
      displayName: 'Error Component',
      description: `Error parsing component: ${error instanceof Error ? error.message : 'Unknown error'}`,
      code: `// Error parsing generated code\n// Original request: ${request.description}\n\nconst ErrorComponent = () => {\n  return (\n    <div className="p-4 border border-red-300 bg-red-50 rounded-lg">\n      <h3 className="text-red-800 font-medium">Component Generation Error</h3>\n      <p className="text-red-600 text-sm mt-1">\n        There was an issue parsing the generated component code.\n      </p>\n    </div>\n  );\n};\n\nexport default ErrorComponent;`,
      props: [],
      dependencies: ['react'],
      category: 'feedback',
      framework: request.framework,
      styling: request.styling,
      preview: {
        livePreview: '<div class="p-4 border border-red-300 bg-red-50 rounded-lg"><h3 class="text-red-800 font-medium">Component Generation Error</h3><p class="text-red-600 text-sm mt-1">There was an issue parsing the generated component code.</p></div>',
        codePreview: 'Error parsing code',
        usage: '<ErrorComponent />'
      },
      responsive: true,
      accessibility: {
        ariaLabels: true,
        keyboardNavigation: false,
        screenReaderFriendly: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}

// ===== COORDINATED AI GENERATION =====
export const generateWithCoordinatedAI = async (
  input: GenerationRequest, 
  type: 'icons' | 'ui' | 'react-component'
): Promise<GenerationResponse> => {
  try {
    console.log(`🚀 Starting coordinated AI generation for ${type}...`);

    if (type === 'icons') {
      // Use OpenRouter DeepSeek V3 for icon generation
      const result = await generateIconsWithOpenRouter(input);
      
      if (result.success) {
        console.log('✅ Icon generation completed successfully');
        return result;
      } else {
        // Fallback to Hugging Face if OpenRouter fails
        console.log('⚠️ OpenRouter failed, falling back to Hugging Face...');
        return await enhanceWithHuggingFace(input);
      }
    } else {
      // Use OpenRouter for UI generation
      const result = await generateUIWithOpenRouter(input);
      
      if (result.success) {
        console.log('✅ UI generation completed successfully');
        return result;
      } else {
        // Fallback to Hugging Face if OpenRouter fails
        console.log('⚠️ OpenRouter failed, falling back to Hugging Face...');
        return await enhanceWithHuggingFace(input);
      }
    }
  } catch (error) {
    console.error('❌ Coordinated AI Generation Error:', error);
    return {
      html: '',
      success: false,
      error: error instanceof Error ? error.message : 'All AI providers failed'
    };
  }
};

// ===== HELPER FUNCTIONS FOR COMPONENT PARSING =====
function extractPropsFromCode(code: string): any[] {
  const props: any[] = [];
  
  try {
    // Look for interface definitions
    const interfaceMatch = code.match(/interface\s+(\w*Props)\s*{([^}]+)}/s);
    if (interfaceMatch) {
      const propsBody = interfaceMatch[2];
      const propLines = propsBody.split('\n').map(line => line.trim()).filter(line => line && !line.startsWith('/'));
      
      propLines.forEach(line => {
        const propMatch = line.match(/(\w+)(\?)?:\s*([^;]+);?/);
        if (propMatch) {
          const [, name, optional, type] = propMatch;
          props.push({
            name: name,
            type: mapTypeScriptToSimpleType(type.trim()),
            required: !optional,
            description: `${name} prop`
          });
        }
      });
    }
    
    // Look for destructured props in function parameters
    const destructureMatch = code.match(/\(\s*{\s*([^}]+)\s*}\s*[):]/);
    if (destructureMatch && props.length === 0) {
      const propsString = destructureMatch[1];
      const propNames = propsString.split(',').map(p => p.trim().split(':')[0].trim());
      
      propNames.forEach(name => {
        if (name && !name.includes('...')) {
          props.push({
            name: name.replace(/[?=].*/, ''),
            type: 'string',
            required: !name.includes('?'),
            description: `${name} prop`
          });
        }
      });
    }
  } catch (error) {
    console.warn('Error extracting props:', error);
  }
  
  return props;
}

function mapTypeScriptToSimpleType(tsType: string): string {
  const type = tsType.toLowerCase().trim();
  if (type.includes('string')) return 'string';
  if (type.includes('number')) return 'number';
  if (type.includes('boolean')) return 'boolean';
  if (type.includes('function') || type.includes('=>')) return 'function';
  if (type.includes('array') || type.includes('[]')) return 'array';
  if (type.includes('reactnode') || type.includes('element')) return 'node';
  if (type.includes('object') || type.includes('{')) return 'object';
  return 'string'; // default fallback
}

function generateComponentPreview(code: string, componentName: string, props: any[]): string {
  // Generate a simple HTML preview
  const hasProps = props.length > 0;
  const defaultProps = hasProps ? props.map(p => `${p.name}="example"`).join(' ') : '';
  
  return `
    <div class="component-preview p-4 border border-gray-200 rounded-lg">
      <div class="component-header mb-2">
        <h3 class="text-lg font-semibold">${componentName}</h3>
        <p class="text-sm text-gray-600">React Component Preview</p>
      </div>
      <div class="component-demo">
        <!-- Component would render here: <${componentName} ${defaultProps} /> -->
        <div class="bg-gray-50 p-4 rounded border-2 border-dashed border-gray-300 text-center">
          <p class="text-gray-600">🚧 Live preview will be generated</p>
          <p class="text-sm text-gray-500 mt-1">${componentName} component</p>
        </div>
      </div>
    </div>
  `;
}

function generateUsageExample(componentName: string, props: any[]): string {
  if (props.length === 0) {
    return `// Basic usage
import ${componentName} from './${componentName}';

<${componentName} />`;
  }
  
  const requiredProps = props.filter(p => p.required);
  const optionalProps = props.filter(p => !p.required);
  
  let usage = `// Basic usage with required props
import ${componentName} from './${componentName}';

`;
  
  if (requiredProps.length > 0) {
    const propsExample = requiredProps
      .map(prop => `  ${prop.name}={${getExampleValue(prop.type)}}`)
      .join('\n');
    usage += `<${componentName}\n${propsExample}\n/>\n\n`;
  }
  
  if (optionalProps.length > 0) {
    usage += `// With all props\n`;
    const allPropsExample = props
      .map(prop => `  ${prop.name}={${getExampleValue(prop.type)}}`)
      .join('\n');
    usage += `<${componentName}\n${allPropsExample}\n/>`;
  }
  
  return usage;
}

function getExampleValue(type: string): string {
  switch (type) {
    case 'string': return '"Hello World"';
    case 'number': return '42';
    case 'boolean': return 'true';
    case 'function': return '() => console.log("clicked")';
    case 'array': return '[1, 2, 3]';
    case 'node': return '<span>Content</span>';
    case 'object': return '{ key: "value" }';
    default: return '"example"';
  }
}

// ===== UTILITY FUNCTIONS =====
const cleanHTML = (html: string): string => {
  // Remove markdown formatting
  let cleaned = html.replace(/```html\n?/g, '').replace(/```\n?/g, '');
  
  // Ensure proper HTML structure
  if (!cleaned.includes('<!DOCTYPE html>')) {
    cleaned = '<!DOCTYPE html>\n' + cleaned;
  }
  
  return cleaned.trim();
};

// ===== LEGACY FUNCTIONS FOR COMPATIBILITY =====
export const generateIconsWithGemini = async (input: GenerationRequest): Promise<GenerationResponse> => {
  console.log('🔄 Redirecting to coordinated AI for icons...');
  return generateWithCoordinatedAI(input, 'icons');
};

export const generateIconsWithHuggingFace = async (input: GenerationRequest): Promise<GenerationResponse> => {
  console.log('🔄 Using Hugging Face for enhancement...');
  return enhanceWithHuggingFace(input);
};

export const generateUIWithHuggingFace = async (input: GenerationRequest): Promise<GenerationResponse> => {
  console.log('🔄 Using Hugging Face for UI enhancement...');
  return enhanceWithHuggingFace(input);
};

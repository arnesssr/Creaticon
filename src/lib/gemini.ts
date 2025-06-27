
import { GoogleGenerativeAI } from '@google/generative-ai';
import { UserInput } from '@/types';

// Use dynamic import for Hugging Face to avoid build issues
let HfInference: any = null;
try {
  if (typeof window !== 'undefined') {
    // Browser environment - use fetch directly
    HfInference = null;
  } else {
    // Server environment - dynamic import
    HfInference = import('@huggingface/inference').then(module => module.HfInference);
  }
} catch (error) {
  console.warn('Hugging Face Inference not available:', error);
}

// Helper function to get API key from environment or localStorage
const getGeminiApiKey = (): string | null => {
  // First try environment variable
  const envKey = import.meta.env.VITE_GEMINI_API_KEY;
  if (envKey) return envKey;
  
  // Then try localStorage
  try {
    const savedKeys = localStorage.getItem('creaticon_api_keys');
    if (savedKeys) {
      const parsed = JSON.parse(savedKeys);
      return parsed.gemini || null;
    }
  } catch (error) {
    console.error('Failed to parse saved API keys:', error);
  }
  
  return null;
};

// Initialize with a placeholder, will be updated when needed
let genAI: GoogleGenerativeAI | null = null;

export interface PageDefinition {
  name: string;
  path: string;
  html: string;
  description: string;
}

export interface LogoDefinition {
  name: string;
  svg: string;
  description: string;
  variants: string[];
}

export interface CompleteProjectGeneration {
  mainPage: string;
  pages: PageDefinition[];
  logos: LogoDefinition[];
  globalCSS: string;
  globalJS: string;
  success: boolean;
  error?: string;
}

export interface GenerationRequest {
  projectDescription: string;
  projectType: string;
  stylePreference: string;
  colorScheme?: string;
  provider?: 'gemini' | 'huggingface';
}

export interface GenerationResponse {
  html: string;
  css?: string;
  javascript?: string;
  pages?: Array<{name: string; path: string; html: string; description: string;}>;
  logos?: Array<{name: string; svg: string; description: string; variants: string[];}>;
  success: boolean;
  error?: string;
}

// New intelligent icon generation function
export const generateIconsWithGemini = async (input: GenerationRequest): Promise<GenerationResponse> => {
  try {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      throw new Error('Please add your Gemini API key in Settings to use this feature');
    }
    
    // Initialize Gemini AI with the API key
    genAI = new GoogleGenerativeAI(apiKey);
    
    console.log('Generating intelligent icon pack with Gemini API...');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const userInput = {
      projectDescription: input.projectDescription,
      projectType: input.projectType as any,
      stylePreference: input.stylePreference as any,
      colorScheme: input.colorScheme
    };
    const prompt = generateIconPackPrompt(userInput);
    
    console.log('Sending intelligent icon prompt to Gemini:', prompt.substring(0, 200) + '...');
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedHTML = response.text();

    console.log('Received icon pack from Gemini:', generatedHTML.substring(0, 200) + '...');

    // Clean and validate the HTML
    const cleanHTML = cleanGeneratedHTML(generatedHTML);

    return {
      html: cleanHTML,
      success: true
    };
  } catch (error) {
    console.error('Gemini Icon Generation Error:', error);
    return {
      html: '',
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate icons with Gemini'
    };
  }
};

export const generateUIWithGemini = async (input: GenerationRequest): Promise<GenerationResponse> => {
  try {
    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      throw new Error('Please add your Gemini API key in Settings to use this feature');
    }
    
    // Initialize Gemini AI with the API key
    genAI = new GoogleGenerativeAI(apiKey);
    
    console.log('Generating UI with Gemini API...');
    // Use gemini-1.5-flash for free tier instead of gemini-pro
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // Use the simpler prompt function
    const userInput = {
      projectDescription: input.projectDescription,
      projectType: input.projectType as any,
      stylePreference: input.stylePreference as any,
      colorScheme: input.colorScheme
    };
    const prompt = generateUIPrompt(userInput);
    
    console.log('Sending prompt to Gemini:', prompt.substring(0, 200) + '...');
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedHTML = response.text();

    console.log('Received response from Gemini:', generatedHTML.substring(0, 200) + '...');

    // Clean and validate the HTML
    const cleanHTML = cleanGeneratedHTML(generatedHTML);

    return {
      html: cleanHTML,
      success: true
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    return {
      html: '',
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate UI with Gemini'
    };
  }
};

export const generateUIWithHuggingFace = async (input: GenerationRequest): Promise<GenerationResponse> => {
  try {
    const apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
    
    if (!apiKey) {
      throw new Error('Hugging Face API key not provided');
    }

    console.log('Using DeepSeek through Hugging Face Inference API...');
    const prompt = createUIGenerationPrompt(input);
    
    // Use DeepSeek model through Hugging Face Inference API
    const response = await fetch('https://api-inference.huggingface.co/models/deepseek-ai/deepseek-coder-6.7b-instruct', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 4000,
          temperature: 0.7,
          do_sample: true,
          top_p: 0.9,
          return_full_text: false
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const result = await response.json();
    let generatedHTML = '';
    
    if (Array.isArray(result) && result[0]?.generated_text) {
      generatedHTML = result[0].generated_text;
    } else {
      throw new Error('Invalid response format from Hugging Face');
    }

    const cleanHTML = cleanGeneratedHTML(generatedHTML);

    return {
      html: cleanHTML,
      success: true
    };
  } catch (error) {
    console.error('Hugging Face API Error:', error);
    return {
      html: '',
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate UI with Hugging Face'
    };
  }
};

// Intelligent icon generation prompt that understands context
const generateIconPackPrompt = (input: UserInput): string => `
You are an expert UI/UX designer and icon creator. Analyze this app description and create a comprehensive icon pack:

"${input.projectDescription}"

FIRST, understand the app context:
1. What type of application is this?
2. What are the main features/sections this app would have?
3. What user actions would be common?
4. What is the target audience and style?

THEN, create a complete HTML document with:
1. A comprehensive set of SVG icons (15-25 icons minimum)
2. Icons should cover ALL app sections: navigation, features, actions, states, etc.
3. Each icon should be semantically meaningful and contextually relevant
4. Apply beautiful CSS styling using:
   - Gradients that match the app's purpose
   - Hover effects and animations
   - Consistent design language
   - Modern styling techniques
   - Color schemes that reflect the app's domain

Style requirements:
- App style: ${input.stylePreference}
- Color preference: ${input.colorScheme || 'modern and contextual'}
- Icons should feel cohesive and professional
- Use CSS animations, transforms, and modern properties
- Each icon should have proper naming (data-name attribute)

Create an HTML showcase page that displays all icons with:
- Proper categorization (navigation, actions, features, etc.)
- Hover effects and animations
- Consistent styling
- Beautiful presentation

Return ONLY the complete HTML code with embedded CSS and all SVG icons.
Start with <!DOCTYPE html> and end with </html>
`;

// Structured prompt for UI generation
const generateUIPrompt = (input: UserInput): string => `
Create a complete, functional HTML page for: "${input.projectDescription}"

Requirements:
- Complete HTML5 structure with head, body
- Embedded CSS (in <style> tags)
- Inline SVG icons (no external dependencies)
- Responsive design using CSS Grid/Flexbox
- Interactive elements with basic JavaScript
- Color scheme: ${input.colorScheme || 'professional'}
- Style: ${input.stylePreference}

The page should include:
1. Header with navigation
2. Main content area
3. Sidebar (if applicable)
4. Custom SVG icons throughout
5. Footer

Return ONLY the complete HTML code, no explanations.
Start with <!DOCTYPE html> and end with </html>
`;

const createUIGenerationPrompt = (input: GenerationRequest): string => {
  return `
Create a complete, functional, and beautiful HTML page for: "${input.projectDescription}"

REQUIREMENTS:
- Complete HTML5 structure with proper DOCTYPE, head, and body
- All CSS must be embedded in <style> tags within the head
- All JavaScript must be embedded in <script> tags
- Use inline SVG icons (no external dependencies)
- Responsive design using CSS Grid, Flexbox, and media queries
- Interactive elements with smooth animations
- Modern ${input.stylePreference} design style
- Color scheme: ${input.colorScheme || 'professional blue and purple gradients'}
- Project type: ${input.projectType}

STRUCTURE TO INCLUDE:
1. Header with navigation and branding
2. Hero/main content section
3. Feature sections or content areas
4. Custom SVG icons throughout the design
5. Footer with links
6. Sidebar or additional sections if relevant
7. Interactive buttons and forms
8. Smooth hover effects and transitions

DESIGN GUIDELINES:
- Use modern CSS properties like backdrop-filter, gradients, shadows
- Include plenty of custom SVG icons with descriptive names
- Make it fully responsive (mobile, tablet, desktop)
- Use semantic HTML elements
- Include smooth animations and micro-interactions
- Professional typography and spacing
- Accessibility considerations (alt text, proper contrast)

IMPORTANT:
- Return ONLY the complete HTML code
- Start with <!DOCTYPE html>
- End with </html>
- No explanations or markdown formatting
- Ensure all SVG icons have proper viewBox and are scalable
- Make the design modern and visually appealing
  }
};

// Enhanced DeepSeek icon generation through Hugging Face API (without streaming client)
export const generateIconsWithHuggingFace = async (input: GenerationRequest): Promise<GenerationResponse> => {
  try {
    const apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
    
    if (!apiKey) {
      throw new Error('Hugging Face API key not provided');
    }

    console.log('Generating icons with DeepSeek Coder through Hugging Face...');
    
    // Create enhanced icon generation prompt with styling context
    const prompt = createEnhancedIconPrompt(input);
    
    console.log('Sending enhanced icon prompt to DeepSeek:', prompt.substring(0, 200) + '...');
    
    // Use direct fetch instead of HfInference client
    const response = await fetch('https://api-inference.huggingface.co/models/deepseek-ai/deepseek-coder-6.7b-instruct', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 6000,
          temperature: 0.7,
          do_sample: true,
          top_p: 0.9,
          repetition_penalty: 1.1,
          return_full_text: false
        }
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status}`);
    }
    
    const result = await response.json();
    let generatedHTML = '';
    
    if (Array.isArray(result) && result[0]?.generated_text) {
      generatedHTML = result[0].generated_text;
    } else {
      throw new Error('Invalid response format from Hugging Face');
    }
    
    console.log('Received complete icon response from DeepSeek:', generatedHTML.substring(0, 200) + '...');
    
    const cleanHTML = cleanGeneratedHTML(generatedHTML);
    
    return {
      html: cleanHTML,
      success: true
    };
    
  } catch (error) {
    console.error('DeepSeek Icon Generation Error:', error);
    return {
      html: '',
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate icons with DeepSeek'
    };
  }
};

// Enhanced icon generation prompt with context awareness and styling instructions
const createEnhancedIconPrompt = (input: GenerationRequest): string => {
  const iconLibraryReference = `Popular icon libraries reference for inspiration:
- Lucide (modern, minimal, consistent stroke width)
- Heroicons (tailwind-style, modern, professional)
- Feather (lightweight, elegant, simple)
- Phosphor (versatile, comprehensive, well-crafted)
- Tabler (clean, consistent, developer-friendly)
- Material Design Icons (Google's design language)
- Font Awesome (comprehensive, widely used)
- Remix Icon (neutral style, comprehensive)

Design principles: Consistency, clarity, context awareness, modern aesthetics
Use these as style inspiration but create original SVG icons.`;

  const prompt = `${iconLibraryReference}

You are a professional icon designer and frontend developer. Create a comprehensive icon pack for this application:

App Description: "${input.projectDescription}"
App Type: ${input.projectType}
Style Preference: ${input.stylePreference}
Color Scheme: ${input.colorScheme || 'modern and contextual'}

CONTEXT ANALYSIS REQUIRED:
1. What is the core purpose of this application?
2. What are the main user workflows and features?
3. What navigation elements would be needed?
4. What actions can users perform?
5. What status indicators are required?
6. What content types does the app handle?

DESIGN REQUIREMENTS:
- Create 20-30 contextually relevant SVG icons
- Each icon should be 24x24 base size with proper viewBox
- Use semantic naming (data-icon-name attribute)
- Apply consistent design language across all icons
- Include hover animations and micro-interactions
- Use modern CSS with gradients, shadows, and animations

STYLING CONTEXT:
- Primary colors should reflect the app's domain
- Secondary colors for states (success, warning, error, info)
- Gradients and modern visual effects
- Consistent stroke width and corner radius
- Smooth transitions and hover effects

ICON CATEGORIES TO INCLUDE:
1. Navigation Icons: home, menu, back, forward, search, profile
2. Action Icons: add, edit, delete, save, share, download, upload
3. Content Icons: text, image, video, file, folder, document
4. Communication Icons: message, email, phone, notification, chat
5. Status Icons: success, error, warning, info, loading, completed
6. Feature-Specific Icons: Based on the app's unique functionality

TECHNICAL REQUIREMENTS:
- Create a complete HTML document with embedded CSS
- Organize icons in a responsive grid layout
- Include category headers and descriptions
- Add smooth CSS animations (hover, focus, active states)
- Use CSS custom properties for theming
- Ensure accessibility (proper aria-labels, semantic markup)

ANIMATION GUIDELINES:
- Subtle hover effects (scale, color change, glow)
- Smooth transitions (0.3s ease-in-out)
- Micro-interactions for user feedback
- Consider loading states and progressive disclosure

OUTPUT FORMAT:
Return ONLY a complete HTML document that:
1. Starts with <!DOCTYPE html>
2. Includes proper meta tags and title
3. Has embedded CSS in <style> tags
4. Contains all SVG icons with proper organization
5. Includes interactive demonstrations
6. Shows different size variants (16px, 24px, 32px, 48px)
7. Ends with </html>

Do not include any explanations or markdown formatting. Generate professional, production-ready icons that feel cohesive and purposeful for the specific application described.`;

  return prompt;
};

// New function for generating complete multi-page projects with SVG logos
export const generateCompleteProject = async (input: GenerationRequest): Promise<CompleteProjectGeneration> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    // First, generate the project structure
    const structurePrompt = createProjectStructurePrompt(input);
    const structureResult = await model.generateContent(structurePrompt);
    const structureResponse = await structureResult.response;
    const projectStructure = JSON.parse(cleanJSONResponse(structureResponse.text()));

    // Generate SVG logos
    const logoPrompt = createLogoGenerationPrompt(input);
    const logoResult = await model.generateContent(logoPrompt);
    const logoResponse = await logoResult.response;
    const logos = JSON.parse(cleanJSONResponse(logoResponse.text()));

    // Generate each page
    const pages: PageDefinition[] = [];
    let mainPage = '';

    for (const pageInfo of projectStructure.pages) {
      const pagePrompt = createPageGenerationPrompt(input, pageInfo, logos.logos);
      const pageResult = await model.generateContent(pagePrompt);
      const pageResponse = await pageResult.response;
      const pageHTML = cleanGeneratedHTML(pageResponse.text());

      const page: PageDefinition = {
        name: pageInfo.name,
        path: pageInfo.path,
        html: pageHTML,
        description: pageInfo.description
      };

      pages.push(page);
      
      if (pageInfo.isMain) {
        mainPage = pageHTML;
      }
    }

    // Generate global CSS and JS
    const globalStylesPrompt = createGlobalStylesPrompt(input, projectStructure);
    const globalStylesResult = await model.generateContent(globalStylesPrompt);
    const globalStylesResponse = await globalStylesResult.response;
    const globalStyles = cleanCodeResponse(globalStylesResponse.text(), 'css');

    return {
      mainPage: mainPage || pages[0]?.html || '',
      pages,
      logos: logos.logos,
      globalCSS: globalStyles,
      globalJS: '',
      success: true
    };

  } catch (error) {
    console.error('Complete project generation error:', error);
    return {
      mainPage: '',
      pages: [],
      logos: [],
      globalCSS: '',
      globalJS: '',
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate complete project'
    };
  }
};

const createProjectStructurePrompt = (input: GenerationRequest): string => {
  return `
Create a JSON structure for a complete ${input.projectType} project: "${input.projectDescription}"

Return a JSON object with this exact structure:
{
  "pages": [
    {
      "name": "Home",
      "path": "/",
      "description": "Main landing page",
      "isMain": true
    },
    {
      "name": "About",
      "path": "/about",
      "description": "About page",
      "isMain": false
    }
    // Add 3-7 more relevant pages for this project type
  ]
}

For ${input.projectType}, include pages that make sense for: ${input.projectDescription}

Return ONLY the JSON, no explanations.
`;
};

const createLogoGenerationPrompt = (input: GenerationRequest): string => {
  return `
Create SVG logos for: "${input.projectDescription}"

Return a JSON object with this exact structure:
{
  "logos": [
    {
      "name": "Main Logo",
      "svg": "<svg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'><!-- Complete SVG content --></svg>",
      "description": "Primary brand logo",
      "variants": ["horizontal", "icon-only", "white-version"]
    },
    {
      "name": "Icon Logo",
      "svg": "<svg viewBox='0 0 50 50' xmlns='http://www.w3.org/2000/svg'><!-- Complete SVG content --></svg>",
      "description": "Compact icon version",
      "variants": ["small", "favicon"]
    }
    // Add 2-3 more logo variations
  ]
}

Design requirements:
- Style: ${input.stylePreference}
- Colors: ${input.colorScheme || 'professional blue and purple'}
- Related to: ${input.projectDescription}
- Each SVG must be complete and valid
- Use appropriate viewBox dimensions
- Include gradients, shapes, and professional styling

Return ONLY the JSON, no explanations.
`;
};

const createPageGenerationPrompt = (input: GenerationRequest, pageInfo: any, logos: any[]): string => {
  const logoSVGs = logos.map(logo => logo.svg).join('\\n');
  
  return `
Create a complete HTML page for: ${pageInfo.name} (${pageInfo.description})
Project: "${input.projectDescription}"

Page Requirements:
- Type: ${input.projectType}
- Style: ${input.stylePreference}
- Colors: ${input.colorScheme || 'professional blue and purple'}
- Purpose: ${pageInfo.description}

Available logos to use:
${logoSVGs}

Structure:
1. Complete HTML5 document with DOCTYPE
2. Embedded CSS in <style> tags
3. Embedded JavaScript in <script> tags
4. Use the provided logos appropriately
5. Include navigation to other pages
6. Responsive design
7. Interactive elements
8. Professional ${input.stylePreference} styling

Return ONLY the complete HTML code, starting with <!DOCTYPE html>
`;
};

const createGlobalStylesPrompt = (input: GenerationRequest, structure: any): string => {
  return `
Create global CSS styles for the ${input.projectType} project: "${input.projectDescription}"

Include:
- CSS variables for consistent theming
- Typography styles
- Color palette based on: ${input.colorScheme || 'professional blue and purple'}
- Responsive breakpoints
- Animation keyframes
- Utility classes
- Component base styles

Style: ${input.stylePreference}

Return ONLY the CSS code, no explanations or markdown.
`;
};

const cleanGeneratedHTML = (html: string): string => {
  // Remove any markdown formatting if present
  let cleaned = html.replace(/```html\n?/g, '').replace(/```\n?/g, '');
  
  // Ensure proper HTML structure
  if (!cleaned.includes('<!DOCTYPE html>')) {
    cleaned = '<!DOCTYPE html>\n' + cleaned;
  }
  
  // Basic validation and cleanup
  cleaned = cleaned.trim();
  
  return cleaned;
};

const cleanJSONResponse = (response: string): string => {
  // Remove markdown formatting
  let cleaned = response.replace(/```json\n?/g, '').replace(/```\n?/g, '');
  
  // Find JSON object boundaries
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  
  if (start !== -1 && end !== -1) {
    cleaned = cleaned.substring(start, end + 1);
  }
  
  return cleaned.trim();
};

const cleanCodeResponse = (response: string, type: 'css' | 'js'): string => {
  // Remove markdown formatting
  let cleaned = response.replace(new RegExp(`\`\`\`${type}\\n?`, 'g'), '').replace(/```\n?/g, '');
  
  return cleaned.trim();
};

import { GenerationRequest, GenerationResponse } from './gemini';

export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OpenRouterRequest {
  model: string;
  messages: OpenRouterMessage[];
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
}

export interface OpenRouterResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface OpenRouterStreamChunk {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    delta: {
      role?: string;
      content?: string;
    };
    finish_reason?: string;
  }>;
}

// Helper function to get API key from environment or localStorage
const getOpenRouterApiKey = (): string | null => {
  // First try environment variable
  const envKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (envKey) return envKey;
  
  // Then try localStorage
  try {
    const savedKeys = localStorage.getItem('creaticon_api_keys');
    if (savedKeys) {
      const parsed = JSON.parse(savedKeys);
      return parsed.openrouter || null;
    }
  } catch (error) {
    console.error('Failed to parse saved API keys:', error);
  }
  
  return null;
};

// DeepSeek V3 icon generation with OpenRouter
export const generateIconsWithOpenRouter = async (input: GenerationRequest): Promise<GenerationResponse> => {
  try {
    const apiKey = getOpenRouterApiKey();
    
    if (!apiKey) {
      throw new Error('Please add your OpenRouter API key in Settings to use this feature');
    }

    console.log('🚀 Generating icons with DeepSeek V3 through OpenRouter...');
    
    // Create enhanced icon generation prompt
    const prompt = createOpenRouterIconPrompt(input);
    
    const requestBody: OpenRouterRequest = {
      model: "deepseek/deepseek-chat-v3-0324:free",
      messages: [
        {
          role: "system",
          content: "You are Creaticon AI, a professional icon designer. Create beautiful, contextual SVG icon packs quickly and efficiently."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      stream: true,
      temperature: 0.5, // Lower for faster, more focused responses
      max_tokens: 6000, // Reduced for faster generation
      top_p: 0.8 // More focused responses
    };

    console.log('📤 Sending request to DeepSeek V3:', prompt.substring(0, 200) + '...');
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://creaticon.app',
        'X-Title': 'Creaticon - AI Icon Studio',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('No response body received');
    }

    let out = '';
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              continue;
            }
            
            try {
              const parsed: OpenRouterStreamChunk = JSON.parse(data);
              
              if (parsed.choices && parsed.choices.length > 0) {
                const newContent = parsed.choices[0].delta?.content;
                if (newContent) {
                  out += newContent;
                  console.log(newContent);
                }
              }
            } catch (parseError) {
              // Skip invalid JSON chunks
              continue;
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
    
    console.log('✅ Received complete icon response from DeepSeek V3:', out.substring(0, 200) + '...');
    
    const cleanHTML = cleanGeneratedHTML(out);
    
    return {
      html: cleanHTML,
      success: true
    };
    
  } catch (error) {
    console.error('❌ DeepSeek V3 Icon Generation Error:', error);
    return {
      html: '',
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate icons with DeepSeek V3'
    };
  }
};

// DeepSeek V3 UI generation with OpenRouter
export const generateUIWithOpenRouter = async (input: GenerationRequest): Promise<GenerationResponse> => {
  try {
    const apiKey = getOpenRouterApiKey();
    
    if (!apiKey) {
      throw new Error('Please add your OpenRouter API key in Settings to use this feature');
    }

    console.log('🚀 Generating UI with DeepSeek V3 through OpenRouter...');
    
    const prompt = createOpenRouterUIPrompt(input);
    
    const requestBody: OpenRouterRequest = {
      model: "deepseek/deepseek-chat-v3-0324:free",
      messages: [
        {
          role: "system",
          content: "You are Creaticon AI, a professional frontend developer. Create beautiful, modern web interfaces quickly and efficiently."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      stream: true,
      temperature: 0.6, // Balanced for speed and creativity
      max_tokens: 7000, // Reduced for faster generation
      top_p: 0.85 // More focused responses
    };

    console.log('📤 Sending UI request to DeepSeek V3:', prompt.substring(0, 200) + '...');
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://creaticon.app',
        'X-Title': 'Creaticon - AI Icon Studio',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('No response body received');
    }

    let out = '';
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            
            if (data === '[DONE]') {
              continue;
            }
            
            try {
              const parsed: OpenRouterStreamChunk = JSON.parse(data);
              
              if (parsed.choices && parsed.choices.length > 0) {
                const newContent = parsed.choices[0].delta?.content;
                if (newContent) {
                  out += newContent;
                  console.log(newContent);
                }
              }
            } catch (parseError) {
              // Skip invalid JSON chunks
              continue;
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
    
    console.log('✅ Received complete UI response from DeepSeek V3:', out.substring(0, 200) + '...');
    
    const cleanHTML = cleanGeneratedHTML(out);
    
    return {
      html: cleanHTML,
      success: true
    };
    
  } catch (error) {
    console.error('❌ DeepSeek V3 UI Generation Error:', error);
    return {
      html: '',
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate UI with DeepSeek V3'
    };
  }
};

// Simplified icon generation prompt for faster responses
const createOpenRouterIconPrompt = (input: GenerationRequest): string => {
  return `Create a complete HTML icon pack for: "${input.projectDescription}"

STRICT Requirements:
- EXACTLY 20 SVG icons (no more, no less)
- Style: ${input.stylePreference}
- Colors: ${input.colorScheme || 'modern palette'}
- Categories: navigation (4), actions (6), content (4), communication (3), status (3)
- 24x24px base size with data-icon-name attributes
- Embedded CSS with hover effects
- Responsive grid layout organized by category

IMPORTANT: Create exactly 20 icons total. Do not exceed this limit.
Return ONLY complete HTML starting with <!DOCTYPE html> and ending with </html>.
No explanations or markdown. Make it fast and beautiful!
};

// Enhanced UI generation prompt for DeepSeek V3
const createOpenRouterUIPrompt = (input: GenerationRequest): string => {
  return `
🎨 **CREATICON UI GENERATION TASK**

**Project Specifications:**
- **Description:** "${input.projectDescription}"
- **Type:** ${input.projectType}
- **Style:** ${input.stylePreference}
- **Colors:** ${input.colorScheme || 'modern professional palette'}

**DESIGN MISSION:**
Create a stunning, fully functional web interface that embodies modern design principles and provides an exceptional user experience.

**TECHNICAL REQUIREMENTS:**

1. **Document Structure:**
   - Complete HTML5 document with proper DOCTYPE
   - Semantic markup for accessibility
   - Embedded CSS in <style> tags (no external dependencies)
   - Embedded JavaScript in <script> tags for interactions

2. **Design System:**
   - Modern ${input.stylePreference} aesthetic
   - Professional color palette: ${input.colorScheme || 'sophisticated blues and purples'}
   - Consistent spacing and typography
   - Custom CSS properties for theming

3. **Layout Components:**
   - Responsive header with navigation
   - Hero section or main content area
   - Feature sections with engaging content
   - Interactive elements and forms
   - Professional footer

4. **Visual Excellence:**
   - Custom SVG icons throughout the interface
   - Smooth animations and micro-interactions
   - Modern CSS effects (gradients, shadows, backdrop-filter)
   - Responsive design (mobile, tablet, desktop)

5. **Interactive Features:**
   - Smooth hover effects and transitions
   - Form validation and feedback
   - Dynamic content interactions
   - Loading states and progressive enhancement

**SPECIFIC REQUIREMENTS:**
- Create inline SVG icons (no external dependencies)
- Use CSS Grid and Flexbox for layout
- Implement smooth animations and transitions
- Ensure accessibility (proper contrast, semantic markup)
- Make it fully responsive across all devices
- Include interactive JavaScript functionality

**OUTPUT FORMAT:**
Return ONLY a complete HTML document that:
- Starts with \`<!DOCTYPE html>\`
- Includes proper meta tags and title
- Has all CSS embedded in <style> tags
- Contains all JavaScript in <script> tags
- Features custom SVG icons throughout
- Ends with \`</html>\`

Create a professional, modern interface that users will love to interact with!`;
};

// Clean generated HTML helper
const cleanGeneratedHTML = (html: string): string => {
  // Remove any markdown formatting
  let cleaned = html.replace(/```html\n?/g, '').replace(/```\n?/g, '');
  
  // Ensure proper HTML structure
  if (!cleaned.includes('<!DOCTYPE html>')) {
    cleaned = '<!DOCTYPE html>\n' + cleaned;
  }
  
  // Basic validation and cleanup
  cleaned = cleaned.trim();
  
  return cleaned;
};

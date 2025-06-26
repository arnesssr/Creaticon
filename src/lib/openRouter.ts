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

// DeepSeek V3 icon generation with OpenRouter
export const generateIconsWithOpenRouter = async (input: GenerationRequest): Promise<GenerationResponse> => {
  try {
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenRouter API key not provided');
    }

    console.log('🚀 Generating icons with DeepSeek V3 through OpenRouter...');
    
    // Create enhanced icon generation prompt
    const prompt = createOpenRouterIconPrompt(input);
    
    const requestBody: OpenRouterRequest = {
      model: "deepseek/deepseek-chat-v3-0324:free",
      messages: [
        {
          role: "system",
          content: "You are Creaticon AI, a professional icon designer and frontend developer. You create beautiful, contextual SVG icon packs with modern styling and animations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 8000,
      top_p: 0.9
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
    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenRouter API key not provided');
    }

    console.log('🚀 Generating UI with DeepSeek V3 through OpenRouter...');
    
    const prompt = createOpenRouterUIPrompt(input);
    
    const requestBody: OpenRouterRequest = {
      model: "deepseek/deepseek-chat-v3-0324:free",
      messages: [
        {
          role: "system",
          content: "You are Creaticon AI, a professional frontend developer and UI/UX designer. You create beautiful, modern, and responsive web interfaces with embedded CSS and JavaScript."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      stream: true,
      temperature: 0.7,
      max_tokens: 8000,
      top_p: 0.9
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

// Enhanced icon generation prompt for DeepSeek V3
const createOpenRouterIconPrompt = (input: GenerationRequest): string => {
  const iconLibraryReference = `
// Icon Library Style References (for inspiration only - create original SVGs):
// - Lucide: Clean, minimal, consistent stroke width
// - Heroicons: Tailwind-style, modern, professional
// - Feather: Lightweight, elegant, simple
// - Phosphor: Versatile, comprehensive, well-crafted
// - Tabler: Clean, consistent, developer-friendly

// Design principles: Consistency, clarity, context awareness, modern aesthetics
`;

  return `${iconLibraryReference}

🎨 **CREATICON ICON GENERATION TASK**

**Project Analysis:**
- **Description:** "${input.projectDescription}"
- **Type:** ${input.projectType}
- **Style:** ${input.stylePreference}
- **Colors:** ${input.colorScheme || 'modern contextual palette'}

**CONTEXT INTELLIGENCE REQUIRED:**
1. 🧠 **App Purpose Analysis:** What is the core function of this application?
2. 🔄 **User Journey Mapping:** What workflows and interactions does this app facilitate?
3. 🧭 **Navigation Structure:** What navigation elements are essential?
4. ⚡ **Action Categories:** What primary and secondary actions can users perform?
5. 📊 **Status & Feedback:** What status indicators and feedback mechanisms are needed?
6. 📁 **Content Types:** What types of content, data, or media does the app handle?

**DESIGN SPECIFICATIONS:**
- **Icon Count:** 25-35 contextually relevant SVG icons
- **Base Size:** 24x24px with flexible scaling (16px, 32px, 48px variants)
- **Naming Convention:** Use data-icon-name attribute with semantic names
- **Design Language:** Consistent stroke width (2px), rounded corners (2px radius)
- **Animation Ready:** Prepare for hover states and micro-interactions

**CONTEXTUAL COLOR STRATEGY:**
- **Domain Colors:** Reflect app purpose (e.g., finance=blue/green, health=blue/white, creative=purple/pink)
- **State Colors:** Success (#10b981), Warning (#f59e0b), Error (#ef4444), Info (#3b82f6)
- **Gradients:** Modern, subtle gradients for premium feel
- **Accessibility:** Ensure proper contrast ratios (AA standard)

**REQUIRED ICON CATEGORIES:**

1. **🧭 Navigation & Core (6-8 icons):**
   - home, menu, search, profile, settings, back/forward

2. **⚡ Primary Actions (8-10 icons):**
   - add/create, edit, delete, save, share, download, upload, refresh

3. **📁 Content & Media (6-8 icons):**
   - text, image, video, file, folder, document, gallery

4. **💬 Communication (4-6 icons):**
   - message, email, phone, notification, chat, comment

5. **📊 Status & Feedback (4-6 icons):**
   - success, error, warning, info, loading, completed, pending

6. **🎯 Feature-Specific (8-12 icons):**
   - Based on the specific app functionality described

**TECHNICAL IMPLEMENTATION:**
- **HTML Structure:** Complete document with DOCTYPE, head, body
- **CSS Organization:** Embedded styles with CSS custom properties
- **Grid Layout:** Responsive CSS Grid with category sections
- **Accessibility:** Proper aria-labels, semantic markup, keyboard navigation
- **Animations:** Smooth hover effects, transitions, micro-interactions

**ANIMATION GUIDELINES:**
- **Hover Effects:** Subtle scale (1.05x), color transitions, glow effects
- **Timing:** 0.3s ease-in-out for most transitions
- **Performance:** CSS transforms over position changes
- **User Feedback:** Clear visual response to interactions

**OUTPUT REQUIREMENTS:**
Generate a complete HTML document with:

1. **Document Structure:**
   - Proper DOCTYPE and meta tags
   - Embedded CSS in <style> tags
   - Responsive design principles

2. **Icon Organization:**
   - Categorized sections with headers
   - Responsive grid layout
   - Size variant demonstrations
   - Interactive hover states

3. **Quality Standards:**
   - Professional, production-ready icons
   - Consistent visual language
   - Semantic and accessible markup
   - Modern CSS techniques

4. **Demonstration Features:**
   - Icon size variants (16, 24, 32, 48px)
   - Color variations and themes
   - Animation examples
   - Usage examples

**CRITICAL:** Return ONLY the complete HTML document. Start with \`<!DOCTYPE html>\` and end with \`</html>\`. No explanations, no markdown formatting. Create icons that feel purposeful, cohesive, and specifically designed for the described application.

Make this the most beautiful, contextual, and professional icon pack that perfectly serves the application's needs!`;
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

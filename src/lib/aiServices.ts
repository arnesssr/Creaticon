import { UserInput } from '@/types';

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

// ===== COORDINATED AI GENERATION =====
export const generateWithCoordinatedAI = async (
  input: GenerationRequest, 
  type: 'icons' | 'ui'
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

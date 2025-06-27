import { GenerationRequest, GenerationResponse } from './aiServices';

// ===== OPENAI GPT-4 - UI COMPONENT GENERATION =====
export const generateUIWithOpenAI = async (input: GenerationRequest): Promise<GenerationResponse> => {
  try {
    console.log('🟢 OpenAI GPT-4: Generating UI components...');
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
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
- Use CSS Grid and Flexbox for layouts
- Include hover effects and micro-interactions

Return ONLY the complete HTML code, no explanations.
Start with <!DOCTYPE html> and end with </html>`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a professional frontend developer creating modern, responsive web interfaces with excellent UX design principles."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 8000
      })
    });

    if (!response.ok) {
      throw new Error('OpenAI API error: ' + response.status);
    }

    const result = await response.json();
    const html = result.choices[0]?.message?.content || '';

    return {
      html: cleanHTML(html),
      success: true
    };
  } catch (error) {
    console.error('❌ OpenAI UI Generation Error:', error);
    return {
      html: '',
      success: false,
      error: error instanceof Error ? error.message : 'OpenAI UI generation failed'
    };
  }
};

// ===== OPENAI GPT-4 - ICON GENERATION =====
export const generateIconsWithOpenAI = async (input: GenerationRequest): Promise<GenerationResponse> => {
  try {
    console.log('🟢 OpenAI GPT-4: Generating icons...');
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Create a beautiful icon pack for: "${input.projectDescription}"

ICON DESIGN PRINCIPLES:
- Follow modern icon design standards (Material Design, Apple Human Interface Guidelines)
- Consistent stroke width and visual weight
- Pixel-perfect alignment on 24x24 grid
- Scalable vector graphics with clean paths
- Semantic and intuitive iconography

REQUIREMENTS:
1. Create 25-30 contextually relevant SVG icons
2. Categories: Navigation, Actions, Content, Communication, Status, Tools
3. Style: ${input.stylePreference} with consistent visual language
4. Colors: ${input.colorScheme || 'modern color palette'}
5. Each icon: 24x24 viewBox, 2px stroke width, rounded line caps
6. Hover animations and smooth transitions
7. Organized grid layout with category headers
8. Multiple size variants (16px, 24px, 32px, 48px)

TECHNICAL SPECS:
- SVG format with proper viewBox
- Clean, optimized paths
- Consistent naming convention
- Interactive hover states
- CSS animations for engagement

Return a complete HTML document with:
- DOCTYPE declaration and semantic HTML
- Embedded CSS with modern styling
- All SVG icons organized by category
- Interactive demonstrations
- Responsive grid layout
- Copy-to-clipboard functionality

Return ONLY HTML code, no explanations.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a professional icon designer with expertise in creating beautiful, functional SVG icon sets that follow modern design principles."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 8000
      })
    });

    if (!response.ok) {
      throw new Error('OpenAI API error: ' + response.status);
    }

    const result = await response.json();
    const html = result.choices[0]?.message?.content || '';

    return {
      html: cleanHTML(html),
      success: true
    };
  } catch (error) {
    console.error('❌ OpenAI Icon Generation Error:', error);
    return {
      html: '',
      success: false,
      error: error instanceof Error ? error.message : 'OpenAI icon generation failed'
    };
  }
};

// ===== OPENAI GPT-3.5 - FAST GENERATION =====
export const generateFastWithOpenAI = async (input: GenerationRequest): Promise<GenerationResponse> => {
  try {
    console.log('🟢 OpenAI GPT-3.5: Fast generation...');
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    
    if (!apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const prompt = `Create a ${input.projectType} for: "${input.projectDescription}"

Style: ${input.stylePreference}
Colors: ${input.colorScheme || 'modern'}

Create a complete HTML page with embedded CSS and JavaScript.
Make it responsive, modern, and functional.
Include relevant icons and interactive elements.

Return ONLY HTML code.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a skilled web developer creating modern, responsive interfaces."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 6000
      })
    });

    if (!response.ok) {
      throw new Error('OpenAI API error: ' + response.status);
    }

    const result = await response.json();
    const html = result.choices[0]?.message?.content || '';

    return {
      html: cleanHTML(html),
      success: true
    };
  } catch (error) {
    console.error('❌ OpenAI Fast Generation Error:', error);
    return {
      html: '',
      success: false,
      error: error instanceof Error ? error.message : 'OpenAI fast generation failed'
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

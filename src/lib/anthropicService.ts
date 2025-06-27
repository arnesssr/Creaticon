import { GenerationRequest, GenerationResponse } from './aiServices';

// ===== ANTHROPIC CLAUDE - UI COMPONENT GENERATION =====
export const generateUIWithAnthropic = async (input: GenerationRequest): Promise<GenerationResponse> => {
  try {
    console.log('🟣 Anthropic Claude: Generating UI components...');
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      throw new Error('Anthropic API key not configured');
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
- Accessibility features (ARIA labels, semantic HTML)
- Performance optimizations
- Clean, maintainable code structure

Design Principles:
- Follow modern UX/UI best practices
- Ensure excellent user experience
- Use semantic HTML for better accessibility
- Implement responsive design patterns
- Include subtle animations and micro-interactions

Return ONLY the complete HTML code, no explanations.
Start with <!DOCTYPE html> and end with </html>`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229",
        max_tokens: 8000,
        temperature: 0.7,
        messages: [
          {
            role: "user",
            content: `You are a professional frontend developer with expertise in creating modern, accessible, and responsive web interfaces. Focus on clean code, excellent UX design, and modern web standards.\n\n${prompt}`
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error('Anthropic API error: ' + response.status);
    }

    const result = await response.json();
    const html = result.content[0]?.text || '';

    return {
      html: cleanHTML(html),
      success: true
    };
  } catch (error) {
    console.error('❌ Anthropic UI Generation Error:', error);
    return {
      html: '',
      success: false,
      error: error instanceof Error ? error.message : 'Anthropic UI generation failed'
    };
  }
};

// ===== ANTHROPIC CLAUDE - ICON GENERATION =====
export const generateIconsWithAnthropic = async (input: GenerationRequest): Promise<GenerationResponse> => {
  try {
    console.log('🟣 Anthropic Claude: Generating icons...');
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      throw new Error('Anthropic API key not configured');
    }

    const prompt = `Create a comprehensive icon pack for: "${input.projectDescription}"

DESIGN PHILOSOPHY:
- Clarity: Icons should be immediately recognizable
- Consistency: Unified visual language throughout the set
- Simplicity: Clean, uncluttered designs that scale well
- Context: Icons should relate meaningfully to the application purpose

ICON SPECIFICATIONS:
1. Create 25-35 contextually relevant SVG icons
2. Categories: Navigation, Actions, Content, Communication, Status, Tools, Settings
3. Style: ${input.stylePreference} with cohesive design language
4. Colors: ${input.colorScheme || 'sophisticated color palette'}
5. Technical specs: 24x24 viewBox, 2px stroke width, rounded line caps
6. Consistent visual weight and optical balance
7. Scalable from 16px to 48px without losing clarity

ICON CATEGORIES TO INCLUDE:
- Navigation: home, menu, back, forward, search
- Actions: add, edit, delete, save, share, download
- Content: file, folder, image, video, document
- Communication: mail, message, phone, notification
- Status: success, warning, error, info, loading
- Tools: settings, filter, sort, calendar, clock
- User: profile, login, logout, account, team

IMPLEMENTATION REQUIREMENTS:
- Semantic HTML structure with proper headings
- CSS Grid layout for responsive icon display
- Hover animations and interactive states
- Copy-to-clipboard functionality for each icon
- Multiple size variants (16px, 24px, 32px, 48px)
- Category-based organization with visual separators
- Modern CSS with custom properties for theming

Return a complete HTML document with embedded CSS and JavaScript.
Include all icons with proper labeling and interactive features.
Return ONLY HTML code, no explanations.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229",
        max_tokens: 8000,
        temperature: 0.7,
        messages: [
          {
            role: "user",
            content: `You are a professional icon designer with deep expertise in creating cohesive, functional icon systems. Focus on creating icons that are both beautiful and highly functional.\n\n${prompt}`
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error('Anthropic API error: ' + response.status);
    }

    const result = await response.json();
    const html = result.content[0]?.text || '';

    return {
      html: cleanHTML(html),
      success: true
    };
  } catch (error) {
    console.error('❌ Anthropic Icon Generation Error:', error);
    return {
      html: '',
      success: false,
      error: error instanceof Error ? error.message : 'Anthropic icon generation failed'
    };
  }
};

// ===== ANTHROPIC CLAUDE HAIKU - FAST GENERATION =====
export const generateFastWithAnthropic = async (input: GenerationRequest): Promise<GenerationResponse> => {
  try {
    console.log('🟣 Anthropic Claude Haiku: Fast generation...');
    const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY;
    
    if (!apiKey) {
      throw new Error('Anthropic API key not configured');
    }

    const prompt = `Create a ${input.projectType} for: "${input.projectDescription}"

Style: ${input.stylePreference}
Colors: ${input.colorScheme || 'modern'}

Requirements:
- Complete HTML page with embedded CSS and JavaScript
- Responsive design that works on all devices
- Modern, clean interface
- Relevant icons and interactive elements
- Professional appearance
- Good user experience

Return ONLY the HTML code, no explanations.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + apiKey,
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: "claude-3-haiku-20240307",
        max_tokens: 6000,
        temperature: 0.7,
        messages: [
          {
            role: "user",
            content: `You are a skilled web developer creating modern, responsive interfaces quickly and efficiently.\n\n${prompt}`
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error('Anthropic API error: ' + response.status);
    }

    const result = await response.json();
    const html = result.content[0]?.text || '';

    return {
      html: cleanHTML(html),
      success: true
    };
  } catch (error) {
    console.error('❌ Anthropic Fast Generation Error:', error);
    return {
      html: '',
      success: false,
      error: error instanceof Error ? error.message : 'Anthropic fast generation failed'
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

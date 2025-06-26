
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export interface GenerationRequest {
  projectDescription: string;
  projectType: string;
  stylePreference: string;
  colorScheme?: string;
  provider?: 'gemini' | 'huggingface';
}

export interface GenerationResponse {
  html: string;
  success: boolean;
  error?: string;
}

export const generateUIWithGemini = async (input: GenerationRequest): Promise<GenerationResponse> => {
  try {
    // Use gemini-1.5-flash for free tier instead of gemini-pro
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = createUIGenerationPrompt(input);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const generatedHTML = response.text();

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

    const prompt = createUIGenerationPrompt(input);
    
    const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-large', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_length: 4000,
          temperature: 0.7,
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

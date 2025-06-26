
import { GenerationRequest } from '@/lib/gemini';
import { generateUIWithGemini } from '@/lib/gemini';
import { processGeneratedHTML } from '@/lib/processors';

export interface GenerateResponse {
  success: boolean;
  data?: {
    html: string;
    css: string;
    javascript: string;
    icons: any[];
    preview: string;
  };
  error?: string;
}

export const generateAPI = async (input: GenerationRequest): Promise<GenerateResponse> => {
  try {
    // Validate input
    if (!input.projectDescription || input.projectDescription.trim().length < 10) {
      return { 
        success: false, 
        error: 'Project description must be at least 10 characters long' 
      };
    }

    // Generate UI with Gemini
    console.log('Generating UI for:', input.projectDescription);
    const geminiResponse = await generateUIWithGemini(input);

    if (!geminiResponse.success) {
      return { 
        success: false, 
        error: geminiResponse.error || 'Failed to generate UI' 
      };
    }

    // Process the generated HTML
    const processedCode = processGeneratedHTML(geminiResponse.html);

    return {
      success: true,
      data: {
        html: processedCode.html,
        css: processedCode.css,
        javascript: processedCode.javascript,
        icons: processedCode.icons,
        preview: processedCode.preview
      }
    };

  } catch (error) {
    console.error('Generation API Error:', error);
    return { 
      success: false, 
      error: 'Internal server error during generation' 
    };
  }
};

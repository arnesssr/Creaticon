
import { GenerationRequest } from '@/lib/gemini';
import { generateUIWithAI, AIProvider } from '@/lib/aiService';
import { processGeneratedHTML } from '@/lib/processors';

export interface GenerateRequest extends GenerationRequest {
  provider?: AIProvider;
}

export interface GenerateResponse {
  success: boolean;
  data?: {
    html: string;
    css: string;
    javascript: string;
    pages: Array<{name: string; path: string; html: string; description: string;}>;
    logos: Array<{name: string; svg: string; description: string; variants: string[];}>;
    icons: any[];
    preview: string;
  };
  error?: string;
}

export const generateAPI = async (input: GenerateRequest): Promise<GenerateResponse> => {
  try {
    // Validate input
    if (!input.projectDescription || input.projectDescription.trim().length < 10) {
      return { 
        success: false, 
        error: 'Project description must be at least 10 characters long' 
      };
    }

    // Use auto provider by default
    const provider = input.provider || 'auto';

    // Generate UI with selected AI provider
    console.log('Generating UI for:', input.projectDescription, 'using provider:', provider);
    const aiResponse = await generateUIWithAI({
      ...input,
      provider
    });

    if (!aiResponse.success) {
      return { 
        success: false, 
        error: aiResponse.error || 'Failed to generate UI' 
      };
    }

    // Process the generated HTML
    const processedCode = processGeneratedHTML(aiResponse.html);

    return {
      success: true,
      data: {
        html: processedCode.html,
        css: processedCode.css,
        javascript: processedCode.javascript,
        pages: aiResponse.pages || [],
        logos: aiResponse.logos || [],
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

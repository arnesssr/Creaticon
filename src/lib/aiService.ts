
import { GenerationRequest, GenerationResponse, generateUIWithGemini, generateUIWithHuggingFace } from './gemini';

export type AIProvider = 'gemini' | 'huggingface' | 'auto';

export interface AIServiceRequest extends GenerationRequest {
  provider: AIProvider;
}

export const generateUIWithAI = async (input: AIServiceRequest): Promise<GenerationResponse> => {
  const { provider, ...generationInput } = input;

  // Auto mode: try providers in order of preference
  if (provider === 'auto') {
    // Try Gemini first
    if (import.meta.env.VITE_GEMINI_API_KEY) {
      console.log('Trying Gemini API...');
      const geminiResult = await generateUIWithGemini(generationInput);
      if (geminiResult.success) {
        return geminiResult;
      }
      console.log('Gemini failed, trying alternatives...');
    }

    // Try Hugging Face as fallback
    if (import.meta.env.VITE_HUGGINGFACE_API_KEY) {
      console.log('Trying Hugging Face API...');
      const hfResult = await generateUIWithHuggingFace(generationInput);
      if (hfResult.success) {
        return hfResult;
      }
    }

    return {
      html: '',
      success: false,
      error: 'No AI providers available or all failed'
    };
  }

  // Use specific provider
  switch (provider) {
    case 'gemini':
      if (!import.meta.env.VITE_GEMINI_API_KEY) {
        return {
          html: '',
          success: false,
          error: 'Gemini API key not configured'
        };
      }
      return generateUIWithGemini(generationInput);

    case 'huggingface':
      if (!import.meta.env.VITE_HUGGINGFACE_API_KEY) {
        return {
          html: '',
          success: false,
          error: 'Hugging Face API key not configured'
        };
      }
      return generateUIWithHuggingFace(generationInput);

    default:
      return {
        html: '',
        success: false,
        error: 'Invalid AI provider specified'
      };
  }
};

export const getAvailableProviders = (): { provider: AIProvider; name: string; available: boolean }[] => {
  return [
    {
      provider: 'auto',
      name: 'Auto (Best Available)',
      available: true
    },
    {
      provider: 'gemini',
      name: 'Google Gemini',
      available: !!import.meta.env.VITE_GEMINI_API_KEY
    },
    {
      provider: 'huggingface',
      name: 'Hugging Face',
      available: !!import.meta.env.VITE_HUGGINGFACE_API_KEY
    }
  ];
};

import { 
  GenerationRequest, 
  GenerationResponse, 
  generateIconsWithOpenRouter,
  enhanceWithHuggingFace
} from './aiServices';
import { generateIconsWithGemini } from './gemini';

export type AIProvider = 'deepseek' | 'openrouter' | 'gemini' | 'auto';

export interface AIServiceRequest extends GenerationRequest {
  provider: AIProvider;
  type?: 'ui' | 'icons';
}

// Helper function to check if API key is available (environment or localStorage)
const hasApiKey = (provider: string): boolean => {
  // Check environment variables
  const envKey = import.meta.env[`VITE_${provider.toUpperCase()}_API_KEY`];
  if (envKey) return true;
  
  // Check localStorage
  try {
    const savedKeys = localStorage.getItem('creaticon_api_keys');
    if (savedKeys) {
      const parsed = JSON.parse(savedKeys);
      return !!parsed[provider.toLowerCase()];
    }
  } catch (error) {
    console.error('Failed to parse saved API keys:', error);
  }
  
  return false;
};

// This service ONLY handles icon generation - UI generation is in aiServices.ts

// Icon generation with AI coordination
export const generateIconsWithAI = async (input: AIServiceRequest): Promise<GenerationResponse> => {
  const { provider, ...generationInput } = input;

  // Auto mode: try providers in order of preference for icons
  if (provider === 'auto') {
    // Try OpenRouter first for icon generation
    if (hasApiKey('openrouter')) {
      console.log('🚀 Using DeepSeek V3 through OpenRouter for icon generation...');
      try {
        const openrouterResult = await generateIconsWithOpenRouter(generationInput);
        if (openrouterResult.success) {
          return openrouterResult;
        }
        console.log('OpenRouter failed, trying Gemini fallback...');
      } catch (error) {
        console.error('OpenRouter error:', error);
        console.log('OpenRouter error, trying Gemini fallback...');
      }
    }

    // Try Gemini as primary fallback (always available)
    if (hasApiKey('gemini')) {
      console.log('🔵 Using Gemini as fallback for icon generation...');
      try {
        const geminiResult = await generateIconsWithGemini(generationInput);
        if (geminiResult.success) {
          return geminiResult;
        }
        console.log('Gemini failed, trying Hugging Face...');
      } catch (error) {
        console.error('Gemini error:', error);
        console.log('Gemini error, trying Hugging Face...');
      }
    }

    // Final fallback to Hugging Face
    if (hasApiKey('huggingface')) {
      console.log('🤗 Using Hugging Face as final fallback for icon generation...');
      try {
        const hfResult = await enhanceWithHuggingFace(generationInput);
        if (hfResult.success) {
          return hfResult;
        }
      } catch (error) {
        console.error('Hugging Face error:', error);
      }
    }

    return {
      html: '',
      success: false,
      error: 'Please add your API keys in Settings to use AI generation features'
    };
  }

  // Use specific provider for icons
  switch (provider) {
    case 'openrouter':
      if (!hasApiKey('openrouter')) {
        return {
          html: '',
          success: false,
          error: 'Please add your OpenRouter API key in Settings'
        };
      }
      return generateIconsWithOpenRouter(generationInput);

    case 'gemini':
      if (!hasApiKey('gemini')) {
        return {
          html: '',
          success: false,
          error: 'Please add your Gemini API key in Settings'
        };
      }
      return generateIconsWithGemini(generationInput);

    case 'deepseek':
      if (!hasApiKey('huggingface')) {
        return {
          html: '',
          success: false,
          error: 'Please add your Hugging Face API key in Settings (required for DeepSeek)'
        };
      }
      return enhanceWithHuggingFace(generationInput);

    default:
      return {
        html: '',
        success: false,
        error: 'Icon generation not supported for this provider'
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
      provider: 'openrouter',
      name: 'DeepSeek V3 (via OpenRouter)',
      available: !!import.meta.env.VITE_OPENROUTER_API_KEY
    },
    {
      provider: 'deepseek',
      name: 'DeepSeek Coder (via HF)',
      available: !!import.meta.env.VITE_HUGGINGFACE_API_KEY
    }
  ];
};

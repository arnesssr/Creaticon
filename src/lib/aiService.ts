import { 
  GenerationRequest, 
  GenerationResponse, 
  generateUIWithOpenRouter, 
  generateIconsWithOpenRouter,
  generateWithCoordinatedAI,
  enhanceWithHuggingFace
} from './aiServices';
import { generateIconsWithGemini, generateUIWithGemini } from './gemini';

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

export const generateUIWithAI = async (input: AIServiceRequest): Promise<GenerationResponse> => {
  const { provider, type = 'ui', ...generationInput } = input;

  // Use coordinated AI for better results
  if (type === 'icons') {
    return generateIconsWithAI({ ...input, provider });
  }

  // Auto mode: try providers in order of preference for UI
  if (provider === 'auto') {
    // Try OpenRouter first for UI generation
    if (hasApiKey('openrouter')) {
      console.log('🚀 Using OpenRouter DeepSeek V3 for UI generation...');
      const openrouterResult = await generateUIWithOpenRouter(generationInput);
      if (openrouterResult.success) {
        return openrouterResult;
      }
      console.log('OpenRouter failed, trying Gemini...');
    }

    // Try Gemini as fallback
    if (hasApiKey('gemini')) {
      console.log('Using Gemini as fallback for UI generation...');
      const geminiResult = await generateUIWithGemini(generationInput);
      if (geminiResult.success) {
        return geminiResult;
      }
      console.log('Gemini failed, trying Hugging Face...');
    }

    // Fallback to Hugging Face
    if (hasApiKey('huggingface')) {
      console.log('Using Hugging Face DeepSeek as final fallback...');
      const hfResult = await enhanceWithHuggingFace(generationInput);
      if (hfResult.success) {
        return hfResult;
      }
    }

    return {
      html: '',
      success: false,
      error: 'Please add your API keys in Settings to use AI generation features'
    };
  }

  // Use specific provider
  switch (provider) {
    case 'openrouter':
      if (!hasApiKey('openrouter')) {
        return {
          html: '',
          success: false,
          error: 'Please add your OpenRouter API key in Settings'
        };
      }
      return generateUIWithOpenRouter(generationInput);

    case 'gemini':
      if (!hasApiKey('gemini')) {
        return {
          html: '',
          success: false,
          error: 'Please add your Gemini API key in Settings'
        };
      }
      return generateUIWithGemini(generationInput);

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
        error: 'Invalid AI provider specified'
      };
  }
};

// Icon generation with AI coordination
export const generateIconsWithAI = async (input: AIServiceRequest): Promise<GenerationResponse> => {
  const { provider, ...generationInput } = input;

  // Auto mode: try providers in order of preference for icons
  if (provider === 'auto') {
    // Try OpenRouter first for icon generation
    if (hasApiKey('openrouter')) {
      console.log('🚀 Using DeepSeek V3 through OpenRouter for icon generation...');
      const openrouterResult = await generateIconsWithOpenRouter(generationInput);
      if (openrouterResult.success) {
        return openrouterResult;
      }
      console.log('OpenRouter failed, trying Gemini...');
    }

    // Try Gemini as fallback
    if (hasApiKey('gemini')) {
      console.log('Using Gemini as fallback for icon generation...');
      const geminiResult = await generateIconsWithGemini(generationInput);
      if (geminiResult.success) {
        return geminiResult;
      }
      console.log('Gemini failed, trying Hugging Face...');
    }

    // Fallback to Hugging Face
    if (hasApiKey('huggingface')) {
      console.log('Using Hugging Face as final fallback for icon generation...');
      const hfResult = await enhanceWithHuggingFace(generationInput);
      if (hfResult.success) {
        return hfResult;
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

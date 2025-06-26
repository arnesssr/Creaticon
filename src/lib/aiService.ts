import { 
  GenerationRequest, 
  GenerationResponse, 
  generateUIWithOpenRouter, 
  generateIconsWithOpenRouter,
  generateWithCoordinatedAI,
  enhanceWithHuggingFace
} from './aiServices';

export type AIProvider = 'deepseek' | 'openrouter' | 'auto';

export interface AIServiceRequest extends GenerationRequest {
  provider: AIProvider;
  type?: 'ui' | 'icons';
}

export const generateUIWithAI = async (input: AIServiceRequest): Promise<GenerationResponse> => {
  const { provider, type = 'ui', ...generationInput } = input;

  // Use coordinated AI for better results
  if (type === 'icons') {
    return generateIconsWithAI({ ...input, provider });
  }

  // Auto mode: try providers in order of preference for UI
  if (provider === 'auto') {
    // Try OpenRouter first for UI generation
    if (import.meta.env.VITE_OPENROUTER_API_KEY) {
      console.log('🚀 Using OpenRouter DeepSeek V3 for UI generation...');
      const openrouterResult = await generateUIWithOpenRouter(generationInput);
      if (openrouterResult.success) {
        return openrouterResult;
      }
      console.log('OpenRouter failed, trying Hugging Face...');
    }

    // Fallback to Hugging Face
    if (import.meta.env.VITE_HUGGINGFACE_API_KEY) {
      console.log('Using Hugging Face DeepSeek as fallback...');
      const hfResult = await enhanceWithHuggingFace(generationInput);
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
    case 'deepseek':
      if (!import.meta.env.VITE_HUGGINGFACE_API_KEY) {
        return {
          html: '',
          success: false,
          error: 'Hugging Face API key not configured (required for DeepSeek)'
        };
      }
      return enhanceWithHuggingFace(generationInput);

    case 'openrouter':
      if (!import.meta.env.VITE_OPENROUTER_API_KEY) {
        return {
          html: '',
          success: false,
          error: 'OpenRouter API key not configured'
        };
      }
      return generateUIWithOpenRouter(generationInput);

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

  // Auto mode: Use OpenRouter with DeepSeek V3 for best icon generation
  if (provider === 'auto') {
    // Prioritize OpenRouter with DeepSeek V3 for icon generation
    if (import.meta.env.VITE_OPENROUTER_API_KEY) {
      console.log('🚀 Using DeepSeek V3 through OpenRouter for icon generation...');
      const openrouterResult = await generateIconsWithOpenRouter(generationInput);
      if (openrouterResult.success) {
        return openrouterResult;
      }
      console.log('OpenRouter failed, trying Hugging Face...');
    }

    // Fallback to Hugging Face
    if (import.meta.env.VITE_HUGGINGFACE_API_KEY) {
      console.log('Using Hugging Face as fallback for icon generation...');
      const hfResult = await enhanceWithHuggingFace(generationInput);
      if (hfResult.success) {
        return hfResult;
      }
    }

    return {
      html: '',
      success: false,
      error: 'No AI providers available for icon generation'
    };
  }

  // Use specific provider for icons
  switch (provider) {
    case 'openrouter':
      if (!import.meta.env.VITE_OPENROUTER_API_KEY) {
        return {
          html: '',
          success: false,
          error: 'OpenRouter API key not configured'
        };
      }
      return generateIconsWithOpenRouter(generationInput);

    case 'deepseek':
      if (!import.meta.env.VITE_HUGGINGFACE_API_KEY) {
        return {
          html: '',
          success: false,
          error: 'Hugging Face API key not configured (required for DeepSeek)'
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

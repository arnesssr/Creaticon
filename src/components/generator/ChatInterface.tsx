import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette, Layout, Send } from 'lucide-react';
import { generateIconsWithAI } from '@/lib/aiService';
import { generateReactComponentWithAI } from '@/lib/aiServices';
import { processIconHTML } from '@/lib/processors';
import Spinner from '../ui/Spinner';
import toast from 'react-hot-toast';
import { ProcessedCode, GenerationResult, ReactComponent } from '@/types';
import { ComponentGenerationRequest } from '@/types/react-components';

interface ChatInterfaceProps {
  generationType: 'icons' | 'react-component';
  setGenerationType: (type: 'icons' | 'react-component') => void;
  setGeneratedCode: (code: ProcessedCode | null) => void;
  setError: (error: string | null) => void;
  setReactComponent?: (component: ReactComponent | null) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ generationType, setGenerationType, setGeneratedCode, setError, setReactComponent }) => {
  const [input, setInput] = useState('');
  const [isLocalLoading, setIsLocalLoading] = useState(false);

  const handleGenerate = async () => {
    if (!input.trim()) {
      toast.error('Please enter a description.');
      return;
    }

    // IMMEDIATELY trigger local loading state
    console.log('🔄 Setting local loading state to TRUE');
    setIsLocalLoading(true);
    setError(null);
    setGeneratedCode(null); // Clear previous results

    try {
      console.log(`🚀 Starting ${generationType} generation with input:`, input);
      
      if (generationType === 'icons') {
        // Use OpenRouter DeepSeek V3 for icon generation
        console.log('🎨 Using DeepSeek V3 for icon generation...');
        
        const response = await generateIconsWithAI({
          projectDescription: input,
          projectType: 'icon-pack',
          stylePreference: 'modern',
          colorScheme: 'contextual and beautiful gradients',
          provider: 'auto' // Use best available provider
        });

        console.log('✅ Icon Generation Response:', response);

        if (response.success && response.html) {
          const processedCode = processIconHTML(response.html);
          setGeneratedCode(processedCode);
          toast.success(`🎨 ${processedCode.svgIcons.length} beautiful icons generated!`);
        } else {
          setError(response.error || 'Failed to generate icons');
          toast.error(response.error || 'Failed to generate icons');
        }
      } else if (generationType === 'react-component') {
        // Use AI for React component generation
        console.log('⚛️ Using AI for React component generation...');
        
        const componentRequest: ComponentGenerationRequest = {
          description: input,
          framework: 'react-typescript',
          styling: 'tailwind',
          responsive: true,
          accessibility: true,
          complexity: 'medium'
        };
        
        const response = await generateReactComponentWithAI(componentRequest);
        
        console.log('✅ React Component Generation Response:', response);
        
        if (response.success && response.component) {
          // Set the React component data directly
          if (setReactComponent) {
            setReactComponent(response.component);
          }
          
          // Clear any previous generated code since we're using React components now
          setGeneratedCode(null);
          toast.success('⚛️ React component generated!');
        } else {
          setError(response.error || 'Failed to generate React component');
          toast.error(response.error || 'Failed to generate React component');
        }
      }
    } catch (error) {
      console.error('Generation error:', error);
      let errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      // Handle specific error types
      if (errorMessage.includes('429')) {
        errorMessage = 'Please use your own API key for better performance and unlimited access. You can add your keys in the settings.';
        toast.error('Please add your own API keys for unlimited access', { duration: 4000 });
        
        // Try fallback to Gemini after a short delay
        setTimeout(async () => {
          try {
            console.log('🔄 Trying fallback provider (Gemini)...');
            let fallbackResponse;
            
            if (generationType === 'icons') {
              fallbackResponse = await generateIconsWithAI({
                projectDescription: input,
                projectType: 'icon-pack',
                stylePreference: 'modern',
                colorScheme: 'contextual and beautiful gradients',
                provider: 'gemini' // Use Gemini as fallback
              });
            } else if (generationType === 'react-component') {
              const componentRequest: ComponentGenerationRequest = {
                description: input,
                framework: 'react-typescript',
                styling: 'tailwind',
                responsive: true,
                accessibility: true,
                complexity: 'medium'
              };
              
              fallbackResponse = await generateReactComponentWithAI(componentRequest);
            }
            
            if (fallbackResponse.success) {
              if (generationType === 'icons' && fallbackResponse.html) {
                const processedCode = processIconHTML(fallbackResponse.html);
                setGeneratedCode(processedCode);
                toast.success('✅ Icons generated successfully with fallback provider!');
              } else if (generationType === 'react-component' && fallbackResponse.component) {
                if (setReactComponent) {
                  setReactComponent(fallbackResponse.component);
                }
                setGeneratedCode(null);
                toast.success('✅ React component generated successfully with fallback provider!');
              }
            } else {
              setError('All AI providers are currently unavailable. Please try again later.');
              toast.error('All providers unavailable');
            }
          } catch (fallbackError) {
            console.error('Fallback generation error:', fallbackError);
            setError('All AI providers are currently unavailable. Please try again later.');
            toast.error('All providers unavailable');
          } finally {
            setIsLocalLoading(false);
          }
        }, 2000);
        
        return; // Don't set loading to false yet, fallback is running
      } else if (errorMessage.includes('401') || errorMessage.includes('403')) {
        errorMessage = 'API authentication failed. Please check your API keys in the environment variables.';
      } else if (errorMessage.includes('500')) {
        errorMessage = 'AI service is temporarily unavailable. Please try again in a few moments.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLocalLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="bg-card shadow-lg rounded-2xl border border-border mb-6">
      <div className="p-6">
        {/* Type display - now controlled by top menu */}
        <div className="mb-4">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            {generationType === 'icons' ? (
              <>
                <Palette className="h-4 w-4" />
                Creating Icon Pack
              </>
            ) : (
              <>
                <Layout className="h-4 w-4" />
                Creating React Component
              </>
            )}
          </div>
        </div>

        {/* Input with send button */}
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Describe the ${generationType} you want to create...\n\nFor ${generationType === 'icons' ? 'icons: "A set of minimalist e-commerce icons including cart, search, user profile, heart, and payment"' : 'UI: "A modern login form with gradient background, social login buttons, and smooth animations"'}`}
            className="w-full p-4 pr-16 border border-input bg-background text-foreground rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent min-h-[120px] text-base placeholder:text-muted-foreground"
            rows={4}
          />
          <Button
            onClick={handleGenerate}
            disabled={!input.trim() || isLocalLoading}
            className="absolute bottom-3 right-3 h-10 w-10 p-0 rounded-lg"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
          <br />
          <span className="text-blue-600 dark:text-blue-400">
            💡 For better results use: Claude 3.5 Sonnet, GPT-4o, Gemini Pro, or DeepSeek V3
          </span>
        </div>

        {/* Loading Animation - Show directly here when generating */}
        {isLocalLoading && (
          <div className="mt-6 p-6 bg-muted/50 border border-border rounded-xl">
            <div className="flex items-center justify-center mb-4">
              <Spinner />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {generationType === 'icons' ? '🎨 Generating Icons...' : '⚛️ Creating React Component...'}
              </h3>
              <p className="text-muted-foreground">
                {generationType === 'icons' 
                  ? 'Crafting beautiful SVG icons for your project...' 
                  : 'Building your custom React component...'
                }
              </p>
              <div className="mt-3">
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full animate-pulse" style={{width: '60%'}}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInterface;

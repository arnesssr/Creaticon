import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette, Layout, Send } from 'lucide-react';
import { generateAPI } from '@/api/generate';
import { generateIconsWithAI, generateUIWithAI } from '@/lib/aiService';
import { processGeneratedHTML } from '@/lib/processors';
import { generateIntelligentIconPack } from '@/lib/iconGeneration';
import Spinner from '../ui/Spinner';
import toast from 'react-hot-toast';
import { ProcessedCode } from '@/types';

interface ChatInterfaceProps {
  generationType: 'icons' | 'ui';
  setGenerationType: (type: 'icons' | 'ui') => void;
  setGeneratedCode: (code: ProcessedCode | null) => void;
  setError: (error: string | null) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ generationType, setGenerationType, setGeneratedCode, setError }) => {
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
          const processedCode = processGeneratedHTML(response.html);
          setGeneratedCode(processedCode);
          toast.success(`🎨 ${processedCode.svgIcons.length} beautiful icons generated!`);
        } else {
          setError(response.error || 'Failed to generate icons');
          toast.error(response.error || 'Failed to generate icons');
        }
      } else {
        // Use OpenRouter DeepSeek V3 for UI generation
        console.log('🖼️ Using DeepSeek V3 for UI generation...');
        
        const response = await generateUIWithAI({
          projectDescription: input,
          projectType: 'web-app',
          stylePreference: 'modern',
          colorScheme: 'professional blue and purple gradients',
          provider: 'auto' // Use best available provider
        });

        console.log('✅ UI Generation Response:', response);

        if (response.success && response.html) {
          const processedCode = processGeneratedHTML(response.html);
          setGeneratedCode(processedCode);
          toast.success('🖼️ Beautiful UI component generated!');
        } else {
          setError(response.error || 'Failed to generate UI');
          toast.error(response.error || 'Failed to generate UI');
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
            } else {
              fallbackResponse = await generateUIWithAI({
                projectDescription: input,
                projectType: 'web-app',
                stylePreference: 'modern',
                colorScheme: 'professional blue and purple gradients',
                provider: 'gemini' // Use Gemini as fallback
              });
            }
            
            if (fallbackResponse.success && fallbackResponse.html) {
              const processedCode = processGeneratedHTML(fallbackResponse.html);
              setGeneratedCode(processedCode);
              toast.success('✅ Generated successfully with fallback provider!');
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
        {/* Type selector */}
        <div className="mb-4">
          <label className="text-sm font-medium text-foreground mb-2 block">
            What would you like to generate?
          </label>
          <Select
            value={generationType}
            onValueChange={(value: 'icons' | 'ui') => setGenerationType(value)}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="icons">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Icon Pack
                </div>
              </SelectItem>
              <SelectItem value="ui">
                <div className="flex items-center gap-2">
                  <Layout className="h-4 w-4" />
                  UI Component
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
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
                {generationType === 'icons' ? '🎨 Generating Icons...' : '🖼️ Creating UI Component...'}
              </h3>
              <p className="text-muted-foreground">
                {generationType === 'icons' 
                  ? 'Crafting beautiful SVG icons for your project...' 
                  : 'Building your custom UI component...'
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

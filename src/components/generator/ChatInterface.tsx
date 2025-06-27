import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette, Layout, Send } from 'lucide-react';
import { generateIconsFast, generateComponentFast } from '@/lib/independentGeneration';
import { quickEnhancePrompt } from '@/lib/aiPromptEnhancer';
import { Sparkles, Lightbulb } from 'lucide-react';
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
  setIsLoading: (loading: boolean) => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ generationType, setGenerationType, setGeneratedCode, setError, setReactComponent, setIsLoading }) => {
  const [input, setInput] = useState('');
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [showEnhancement, setShowEnhancement] = useState(false);

  const handleGenerate = async () => {
    if (!input.trim()) {
      toast.error('Please enter a description.');
      return;
    }

    // IMMEDIATELY trigger loading state for the specific generation type
    console.log(`🔄 Starting ${generationType} generation...`);
    setIsLocalLoading(true);
    setIsLoading(true); // Set parent loading state
    setError(null);
    
    // Clear only relevant previous results
    if (generationType === 'icons') {
      setGeneratedCode(null);
      // Don't clear React component if we're generating icons
    } else if (generationType === 'react-component') {
      if (setReactComponent) {
        setReactComponent(null);
      }
      // Don't clear generated code if we're generating components
    }

    try {
      console.log(`🚀 Starting enhanced ${generationType} generation with AI workflow...`);
      
      if (generationType === 'icons') {
        // Use independent icon generation with V3 → V1 workflow
        console.log('🎨 Using enhanced icon generation (V3 analysis + V1 generation)...');
        
        const result = await generateIconsFast(input);
        
        console.log('✅ Icon Generation Result:', result);
        
        if (result.success && result.icons) {
          setGeneratedCode(result.icons);
          
          const analysisText = result.analysisUsed ? ' (AI-enhanced)' : '';
          const timeText = result.timeElapsed ? ` in ${(result.timeElapsed / 1000).toFixed(1)}s` : '';
          
          toast.success(`🎨 ${result.icons.svgIcons.length} beautiful icons generated${analysisText}${timeText}!`);
        } else {
          setError(result.error || 'Failed to generate icons');
          toast.error(result.error || 'Failed to generate icons');
        }
        
      } else if (generationType === 'react-component') {
        // Use independent React component generation with V3 → V1 workflow
        console.log('⚛️ Using enhanced React component generation (V3 analysis + V1 generation)...');
        
        const result = await generateComponentFast(input);
        
        console.log('✅ React Component Generation Result:', result);
        
        if (result.success && result.component) {
          // Set the React component data directly
          if (setReactComponent) {
            setReactComponent(result.component);
          }
          
          const analysisText = result.analysisUsed ? ' (AI-enhanced)' : '';
          const timeText = result.timeElapsed ? ` in ${(result.timeElapsed / 1000).toFixed(1)}s` : '';
          
          toast.success(`⚛️ React component generated${analysisText}${timeText}!`);
        } else {
          setError(result.error || 'Failed to generate React component');
          toast.error(result.error || 'Failed to generate React component');
        }
      }
    } catch (error) {
      console.error('Enhanced generation error:', error);
      let errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      
      // Handle specific error types
      if (errorMessage.includes('timeout')) {
        errorMessage = 'Generation took longer than expected. Our AI is working hard! Please try again.';
        toast.error('Generation timeout - please try again', { duration: 4000 });
      } else if (errorMessage.includes('429')) {
        errorMessage = 'Rate limit reached. Please add your own API keys for unlimited access.';
        toast.error('Please add your own API keys for unlimited access', { duration: 4000 });
      } else if (errorMessage.includes('401') || errorMessage.includes('403')) {
        errorMessage = 'API authentication failed. Please check your API keys.';
      } else if (errorMessage.includes('500')) {
        errorMessage = 'AI service is temporarily unavailable. Please try again in a few moments.';
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLocalLoading(false);
      setIsLoading(false); // Clear parent loading state
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInput(value);
    
    // Generate enhanced prompt suggestion in real-time
    if (value.trim() && value.length > 10) {
      const enhanced = quickEnhancePrompt(value, generationType);
      if (enhanced !== value) {
        setEnhancedPrompt(enhanced);
        setShowEnhancement(true);
      } else {
        setShowEnhancement(false);
      }
    } else {
      setShowEnhancement(false);
    }
  };

  const applyEnhancement = () => {
    setInput(enhancedPrompt);
    setShowEnhancement(false);
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
            onChange={handleInputChange}
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
        
        {/* AI Prompt Enhancement Suggestion */}
        {showEnhancement && !isLocalLoading && (
          <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                  ✨ AI Enhanced Suggestion
                </div>
                <div className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                  {enhancedPrompt}
                </div>
                <button
                  onClick={applyEnhancement}
                  className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md transition-colors"
                >
                  Use Enhanced Prompt
                </button>
              </div>
            </div>
          </div>
        )}
        
        <div className="text-xs text-muted-foreground mt-2">
          Press Enter to send, Shift+Enter for new line
          <br />
          <span className="text-blue-600 dark:text-blue-400">
            💡 For best results, use latest models: GPT-4o, Claude 3.5 Sonnet, Gemini Pro, or DeepSeek V3
          </span>
        </div>

        {/* Loading Animation - Show only for icons */}
        {isLocalLoading && generationType === 'icons' && (
          <div className="mt-6 p-6 bg-muted/50 border border-border rounded-xl">
            <div className="flex items-center justify-center mb-4">
              <Spinner />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-foreground mb-2">
                🎨 Generating Icons...
              </h3>
              <p className="text-muted-foreground">
                Crafting beautiful SVG icons for your project...
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

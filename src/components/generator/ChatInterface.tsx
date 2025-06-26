import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGenerationStore } from '@/stores/generationStore';
import { generateAPI } from '@/api/generate';
import { generateIconsWithAI, generateUIWithAI } from '@/lib/aiService';
import { processGeneratedHTML } from '@/lib/processors';
import { generateIntelligentIconPack } from '@/lib/iconGeneration';
import toast from 'react-hot-toast';

interface ChatInterfaceProps {
  generationType: 'icons' | 'ui';
  setGenerationType: (type: 'icons' | 'ui') => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ generationType, setGenerationType }) => {
  const { setLoading, setError, setGeneratedCode } = useGenerationStore();
  const [input, setInput] = useState('');

  const handleGenerate = async () => {
    if (!input.trim()) {
      toast.error('Please enter a description.');
      return;
    }

    // IMMEDIATELY trigger loading state
    console.log('🔄 Setting loading state to TRUE');
    setLoading(true);
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
          provider: 'openrouter' // Use OpenRouter with DeepSeek V3
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
          provider: 'openrouter' // Use OpenRouter with DeepSeek V3
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
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerate();
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-2xl border border-gray-200 mb-6">
      <div className="p-6">
        {/* Type selector */}
        <div className="mb-4">
          <label className="text-sm font-medium text-gray-700 mb-2 block">
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
              <SelectItem value="icons">🎨 Icon Pack</SelectItem>
              <SelectItem value="ui">🖼️ UI Component</SelectItem>
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
            className="w-full p-4 pr-16 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px] text-base"
            rows={4}
          />
          <Button
            onClick={handleGenerate}
            disabled={!input.trim()}
            className="absolute bottom-3 right-3 h-10 w-10 p-0 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </Button>
        </div>
        
        <div className="text-xs text-gray-500 mt-2">
          Press Enter to send, Shift+Enter for new line
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;

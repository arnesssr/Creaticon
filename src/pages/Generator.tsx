import React, { useState } from 'react';
import { useGenerationStore } from '@/stores/generationStore';
import ChatInterface from '@/components/generator/ChatInterface';
import ResultsDisplay from '@/components/generator/ResultsDisplay';
import { Toaster } from 'react-hot-toast';

const Generator = () => {
  const { generatedCode, error, isLoading } = useGenerationStore();
  const [generationType, setGenerationType] = useState<'icons' | 'ui'>('icons');
  
  // Debug loading state
  console.log('🔍 Generator render - isLoading:', isLoading, 'generatedCode:', !!generatedCode, 'error:', error);

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#fff',
            border: '1px solid #374151',
          },
        }}
      />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            AI Generator
          </h1>
          <p className="text-gray-600">
            Generate beautiful UI components and icon packs with AI
          </p>
        </div>

        {/* Chat Interface */}
        <ChatInterface 
          generationType={generationType}
          setGenerationType={setGenerationType}
        />

        {/* Results Display */}
        {(generatedCode || isLoading || error) && (
          <ResultsDisplay 
            generationType={generationType}
            isLoading={isLoading}
            generatedCode={generatedCode}
            error={error}
          />
        )}
      </div>
    </div>
  );
};

export default Generator;

import React, { useState } from 'react';
import ChatInterface from '@/components/generator/ChatInterface';
import ResultsDisplay from '@/components/generator/ResultsDisplay';
import { SimpleThemeToggle } from '@/components/ui/theme-toggle';
import { Toaster } from 'react-hot-toast';
import { ProcessedCode } from '@/types';

const Generator = () => {
  const [generationType, setGenerationType] = useState<'icons' | 'ui'>('icons');
  const [generatedCode, setGeneratedCode] = useState<ProcessedCode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  

  return (
    <div className="min-h-screen bg-background">
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--card-foreground))',
            border: '1px solid hsl(var(--border))',
          },
        }}
      />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header with Theme Toggle */}
        <div className="flex justify-between items-start mb-8">
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Creaticon
            </h1>
            <p className="text-muted-foreground">
              Generate beautiful UI components and icon packs with AI
            </p>
          </div>
          <div className="ml-4">
            <SimpleThemeToggle />
          </div>
        </div>

        {/* Chat Interface */}
        <ChatInterface 
          generationType={generationType}
          setGenerationType={setGenerationType}
          setGeneratedCode={setGeneratedCode}
          setError={setError}
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

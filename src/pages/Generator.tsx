import React, { useState } from 'react';
import ChatInterface from '@/components/generator/ChatInterface';
import ResultsDisplay from '@/components/generator/ResultsDisplay';
import Sidebar from '@/components/ui/Sidebar';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import { ProcessedCode, ReactComponent } from '@/types';

const Generator = () => {
  const [generationType, setGenerationType] = useState<'icons' | 'react-component'>('icons');
  const [generatedCode, setGeneratedCode] = useState<ProcessedCode | null>(null);
  const [reactComponent, setReactComponent] = useState<ReactComponent | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  

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
      
      {/* Top Menu Bar */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsSidebarOpen(true)}
            className="flex items-center gap-2"
          >
            <Menu className="w-4 h-4" />
            Menu
          </Button>
          
          {/* Generation Type Selector */}
          <div className="flex items-center gap-4">
            <Button
              variant={generationType === 'icons' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setGenerationType('icons')}
              className="flex items-center gap-2"
            >
              <div className="text-lg">🎨</div>
              Icons
            </Button>
            <Button
              variant={generationType === 'react-component' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setGenerationType('react-component')}
              className="flex items-center gap-2"
            >
              <div className="text-lg">⚛️</div>
              Components
            </Button>
          </div>
          
          <h1 className="text-lg font-semibold text-foreground">
            Creaticon
          </h1>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 pt-20 pb-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            AI-Powered Design Studio
          </h1>
          <p className="text-muted-foreground">
            Generate beautiful UI components and icon packs with AI
          </p>
        </div>

        {/* Chat Interface */}
        <ChatInterface 
          generationType={generationType}
          setGenerationType={setGenerationType}
          setGeneratedCode={setGeneratedCode}
          setReactComponent={setReactComponent}
          setError={setError}
          setIsLoading={setIsLoading}
        />

        {/* Results Display */}
        {(generatedCode || reactComponent || isLoading || error) && (
          <ResultsDisplay 
            generationType={generationType}
            isLoading={isLoading}
            generatedCode={generatedCode}
            reactComponent={reactComponent}
            error={error}
          />
        )}
      </div>
      
      {/* Sidebar */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
    </div>
  );
};

export default Generator;

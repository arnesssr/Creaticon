import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Monitor, 
  Code2, 
  Eye, 
  SplitSquareHorizontal,
  Maximize2,
  PanelRightOpen,
  PanelLeftOpen,
  Settings
} from 'lucide-react';
import RealTimeCodeEditor from './RealTimeCodeEditor';

export type LayoutMode = 'split' | 'editor-only' | 'preview-only';

interface EditorLayoutProps {
  initialPrompt: string;
  onModeChange?: (mode: LayoutMode) => void;
  className?: string;
}

const EditorLayout: React.FC<EditorLayoutProps> = ({
  initialPrompt,
  onModeChange,
  className = ''
}) => {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('split');
  const [isResizing, setIsResizing] = useState(false);
  const [leftPanelWidth, setLeftPanelWidth] = useState(50); // percentage

  const handleModeChange = (mode: LayoutMode) => {
    setLayoutMode(mode);
    if (onModeChange) {
      onModeChange(mode);
    }
  };

  const modeButtons = [
    {
      mode: 'split' as LayoutMode,
      icon: SplitSquareHorizontal,
      label: 'Split View',
      shortcut: 'Ctrl+1'
    },
    {
      mode: 'editor-only' as LayoutMode,
      icon: Code2,
      label: 'Editor Only',
      shortcut: 'Ctrl+2'
    },
    {
      mode: 'preview-only' as LayoutMode,
      icon: Eye,
      label: 'Preview Only',
      shortcut: 'Ctrl+3'
    }
  ];

  // Keyboard shortcuts
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case '1':
            e.preventDefault();
            handleModeChange('split');
            break;
          case '2':
            e.preventDefault();
            handleModeChange('editor-only');
            break;
          case '3':
            e.preventDefault();
            handleModeChange('preview-only');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Toolbar */}
      <Card className="mb-4">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              AI Code Editor Workspace
            </CardTitle>
            
            {/* Layout Mode Controls */}
            <div className="flex items-center gap-2">
              {modeButtons.map(({ mode, icon: Icon, label, shortcut }) => (
                <Button
                  key={mode}
                  variant={layoutMode === mode ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleModeChange(mode)}
                  className="flex items-center gap-2"
                  title={`${label} (${shortcut})`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden md:inline">{label}</span>
                </Button>
              ))}
            </div>
          </div>
          
          {/* Info bar */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              💡 Use <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Ctrl+1/2/3</kbd> to switch between modes
            </span>
            <span>
              Current mode: <strong className="capitalize">{layoutMode.replace('-', ' ')}</strong>
            </span>
          </div>
        </CardHeader>
      </Card>

      {/* Editor Content */}
      <div className="flex-1 overflow-hidden">
        {layoutMode === 'split' && (
          <SplitView 
            initialPrompt={initialPrompt}
            leftPanelWidth={leftPanelWidth}
            setLeftPanelWidth={setLeftPanelWidth}
            isResizing={isResizing}
            setIsResizing={setIsResizing}
          />
        )}
        
        {layoutMode === 'editor-only' && (
          <EditorOnlyView initialPrompt={initialPrompt} />
        )}
        
        {layoutMode === 'preview-only' && (
          <PreviewOnlyView initialPrompt={initialPrompt} />
        )}
      </div>
    </div>
  );
};

// Split view with resizable panels
interface SplitViewProps {
  initialPrompt: string;
  leftPanelWidth: number;
  setLeftPanelWidth: (width: number) => void;
  isResizing: boolean;
  setIsResizing: (resizing: boolean) => void;
}

const SplitView: React.FC<SplitViewProps> = ({
  initialPrompt,
  leftPanelWidth,
  setLeftPanelWidth,
  isResizing,
  setIsResizing
}) => {
  const handleMouseDown = () => {
    setIsResizing(true);
  };

  const handleMouseMove = React.useCallback((e: MouseEvent) => {
    if (!isResizing) return;
    
    const container = document.getElementById('split-container');
    if (!container) return;
    
    const rect = container.getBoundingClientRect();
    const newWidth = ((e.clientX - rect.left) / rect.width) * 100;
    
    // Constrain between 20% and 80%
    if (newWidth >= 20 && newWidth <= 80) {
      setLeftPanelWidth(newWidth);
    }
  }, [isResizing, setLeftPanelWidth]);

  const handleMouseUp = React.useCallback(() => {
    setIsResizing(false);
  }, [setIsResizing]);

  React.useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  return (
    <div id="split-container" className="flex h-full relative">
      {/* Left Panel - Editor */}
      <div 
        style={{ width: `${leftPanelWidth}%` }}
        className="flex flex-col overflow-hidden"
      >
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Code2 className="w-5 h-5" />
              AI Code Editor
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <RealTimeCodeEditor 
              initialPrompt={initialPrompt}
              theme="dark"
            />
          </CardContent>
        </Card>
      </div>

      {/* Resizer */}
      <div
        className={`w-1 bg-border hover:bg-primary cursor-col-resize transition-colors ${
          isResizing ? 'bg-primary' : ''
        }`}
        onMouseDown={handleMouseDown}
      />

      {/* Right Panel - Preview */}
      <div 
        style={{ width: `${100 - leftPanelWidth}%` }}
        className="flex flex-col overflow-hidden"
      >
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Live Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-hidden">
            <div className="w-full h-full bg-white border rounded">
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Monitor className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Preview will update as AI generates code</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// Editor-only view
const EditorOnlyView: React.FC<{ initialPrompt: string }> = ({ initialPrompt }) => (
  <Card className="h-full flex flex-col">
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-2">
        <Code2 className="w-5 h-5" />
        Full Screen Code Editor
      </CardTitle>
    </CardHeader>
    <CardContent className="flex-1 p-0 overflow-hidden">
      <RealTimeCodeEditor 
        initialPrompt={initialPrompt}
        theme="dark"
      />
    </CardContent>
  </Card>
);

// Preview-only view
const PreviewOnlyView: React.FC<{ initialPrompt: string }> = ({ initialPrompt }) => (
  <Card className="h-full flex flex-col">
    <CardHeader className="pb-3">
      <CardTitle className="flex items-center gap-2">
        <Eye className="w-5 h-5" />
        Full Screen Preview
      </CardTitle>
    </CardHeader>
    <CardContent className="flex-1 p-0 overflow-hidden">
      <div className="w-full h-full bg-white border rounded">
        <div className="flex items-center justify-center h-full text-muted-foreground">
          <div className="text-center">
            <Monitor className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Component preview will appear here</p>
            <p className="text-sm mt-2">Switch to Split View or Editor Only to generate code</p>
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default EditorLayout;

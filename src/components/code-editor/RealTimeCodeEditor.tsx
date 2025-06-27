import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Pause, 
  Square, 
  RotateCcw, 
  Copy, 
  Download,
  Zap,
  Eye,
  EyeOff,
  Settings,
  Code2
} from 'lucide-react';
import { streamComponentToEditor } from '@/lib/aiStreamingService';
import { renderReactComponent } from '@/lib/browserReactRenderer';
import toast from 'react-hot-toast';

interface RealTimeCodeEditorProps {
  initialPrompt: string;
  onCodeChange?: (code: string) => void;
  theme?: 'light' | 'dark';
}

export interface StreamingState {
  isStreaming: boolean;
  isPaused: boolean;
  currentCode: string;
  generatedLines: string[];
  currentLineIndex: number;
  totalLines: number;
  previewHtml: string;
}

const RealTimeCodeEditor: React.FC<RealTimeCodeEditorProps> = ({
  initialPrompt,
  onCodeChange,
  theme = 'dark'
}) => {
  const [streamingState, setStreamingState] = useState<StreamingState>({
    isStreaming: false,
    isPaused: false,
    currentCode: '',
    generatedLines: [],
    currentLineIndex: 0,
    totalLines: 0,
    previewHtml: ''
  });

  const [showPreview, setShowPreview] = useState(true);
  const [editorTheme, setEditorTheme] = useState(theme === 'dark' ? 'vs-dark' : 'light');
  const [streamSpeed, setStreamSpeed] = useState(150); // ms per line
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'generating' | 'streaming' | 'complete'>('idle');

  const editorRef = useRef<any>(null);
  const streamingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const previewRef = useRef<HTMLIFrameElement>(null);

  // Monaco editor configuration
  const editorOptions = {
    minimap: { enabled: true },
    fontSize: 14,
    lineNumbers: 'on' as const,
    roundedSelection: false,
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
    insertSpaces: true,
    wordWrap: 'on' as const,
    contextmenu: true,
    selectOnLineNumbers: true,
    glyphMargin: true,
    folding: true,
    lineDecorationsWidth: 10,
    lineNumbersMinChars: 3,
    renderLineHighlight: 'line' as const,
    scrollbar: {
      vertical: 'visible' as const,
      horizontal: 'visible' as const,
      verticalScrollbarSize: 12,
      horizontalScrollbarSize: 12
    }
  };

  // Generate code with AI streaming
  const generateCode = async () => {
    if (!initialPrompt.trim()) {
      toast.error('Please provide a prompt for code generation');
      return;
    }

    setGenerationStatus('generating');
    toast.loading('🤖 AI is analyzing your request and will start writing code...', { id: 'generation' });

    try {
      // Reset state
      setStreamingState(prev => ({
        ...prev,
        currentCode: '',
        currentLineIndex: 0,
        totalLines: 0,
        isStreaming: true,
        isPaused: false
      }));

      setGenerationStatus('streaming');
      toast.success('✍️ AI is now writing code in real-time...', { id: 'generation' });

      // Use streaming service for real-time code generation
      const result = await streamComponentToEditor(
        initialPrompt,
        (code: string, progress: number) => {
          // Update Monaco editor in real-time
          if (editorRef.current) {
            editorRef.current.setValue(code);
            
            // Auto-scroll to bottom
            const lineCount = editorRef.current.getModel()?.getLineCount() || 1;
            editorRef.current.revealLine(lineCount);
            
            // Position cursor at end
            const lastLine = editorRef.current.getModel()?.getLineContent(lineCount) || '';
            editorRef.current.setPosition({ lineNumber: lineCount, column: lastLine.length + 1 });
          }

          // Update state
          setStreamingState(prev => ({
            ...prev,
            currentCode: code,
            currentLineIndex: progress,
            totalLines: result.totalLines || 100 // Will be updated when complete
          }));

          // Update preview as code grows (debounced)
          debouncedPreviewUpdate(code);

          // Call external onChange handler
          if (onCodeChange) {
            onCodeChange(code);
          }
        }
      );

      if (result.success) {
        setGenerationStatus('complete');
        setStreamingState(prev => ({
          ...prev,
          isStreaming: false,
          totalLines: result.totalLines
        }));
        
        const timeText = result.timeElapsed ? ` in ${(result.timeElapsed / 1000).toFixed(1)}s` : '';
        toast.success(`✅ Code generation completed${timeText}! ${result.totalLines} lines written.`, { id: 'generation' });
      } else {
        throw new Error(result.error || 'Failed to generate code');
      }
    } catch (error) {
      console.error('Code generation error:', error);
      toast.error(error instanceof Error ? error.message : 'Code generation failed', { id: 'generation' });
      setGenerationStatus('idle');
      setStreamingState(prev => ({ ...prev, isStreaming: false }));
    }
  };

  // Start streaming code line by line
  const startStreaming = useCallback(() => {
    if (streamingIntervalRef.current) {
      clearInterval(streamingIntervalRef.current);
    }

    setStreamingState(prev => ({ ...prev, isStreaming: true, isPaused: false }));

    streamingIntervalRef.current = setInterval(() => {
      setStreamingState(prev => {
        if (prev.currentLineIndex >= prev.totalLines) {
          setGenerationStatus('complete');
          toast.success('✅ Code generation completed!');
          return { ...prev, isStreaming: false };
        }

        const currentLine = prev.generatedLines[prev.currentLineIndex];
        const newCode = prev.currentCode + (prev.currentCode ? '\n' : '') + currentLine;

        // Update Monaco editor
        if (editorRef.current) {
          editorRef.current.setValue(newCode);
          
          // Auto-scroll to bottom
          const lineCount = editorRef.current.getModel()?.getLineCount() || 1;
          editorRef.current.revealLine(lineCount);
          
          // Add typing animation effect
          editorRef.current.setPosition({ lineNumber: lineCount, column: currentLine.length + 1 });
        }

        // Trigger preview update (debounced)
        debouncedPreviewUpdate(newCode);

        // Call external onChange handler
        if (onCodeChange) {
          onCodeChange(newCode);
        }

        return {
          ...prev,
          currentCode: newCode,
          currentLineIndex: prev.currentLineIndex + 1
        };
      });
    }, streamSpeed);
  }, [streamSpeed, onCodeChange]);

  // Pause streaming
  const pauseStreaming = () => {
    if (streamingIntervalRef.current) {
      clearInterval(streamingIntervalRef.current);
      streamingIntervalRef.current = null;
    }
    setStreamingState(prev => ({ ...prev, isStreaming: false, isPaused: true }));
    toast.info('⏸️ Code streaming paused');
  };

  // Resume streaming
  const resumeStreaming = () => {
    if (!streamingState.isPaused) return;
    startStreaming();
    toast.info('▶️ Code streaming resumed');
  };

  // Stop streaming and reset
  const stopStreaming = () => {
    if (streamingIntervalRef.current) {
      clearInterval(streamingIntervalRef.current);
      streamingIntervalRef.current = null;
    }
    
    setStreamingState({
      isStreaming: false,
      isPaused: false,
      currentCode: '',
      generatedLines: [],
      currentLineIndex: 0,
      totalLines: 0,
      previewHtml: ''
    });
    
    setGenerationStatus('idle');
    
    if (editorRef.current) {
      editorRef.current.setValue('');
    }
    
    toast.info('⏹️ Code streaming stopped');
  };

  // Debounced preview update to prevent excessive iframe recreations
  const debouncedPreviewUpdate = useMemo(() => {
    let timeoutId: NodeJS.Timeout;
    return (code: string) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => updatePreview(code), 500); // 500ms debounce
    };
  }, []);

  // Update preview with debouncing to prevent excessive updates
  const updatePreview = useCallback(async (code: string) => {
    if (!showPreview || !code.trim()) return;

    try {
      const renderResult = await renderReactComponent(code);
      
      if (renderResult.success && renderResult.compiledCode) {
        // Only update if the content actually changed
        setStreamingState(prev => {
          if (prev.previewHtml !== renderResult.compiledCode) {
            return { ...prev, previewHtml: renderResult.compiledCode };
          }
          return prev;
        });
      }
    } catch (error) {
      console.error('Preview update error:', error);
    }
  }, [showPreview]);

  // Copy code to clipboard
  const copyCode = () => {
    navigator.clipboard.writeText(streamingState.currentCode);
    toast.success('📋 Code copied to clipboard!');
  };

  // Download code as file
  const downloadCode = () => {
    const blob = new Blob([streamingState.currentCode], { type: 'text/typescript' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-component.tsx';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('📁 Code downloaded!');
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamingIntervalRef.current) {
        clearInterval(streamingIntervalRef.current);
      }
    };
  }, []);

  // Progress calculation
  const progress = streamingState.totalLines > 0 
    ? Math.round((streamingState.currentLineIndex / streamingState.totalLines) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[80vh]">
      {/* Code Editor Panel */}
      <Card className="flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Code2 className="w-5 h-5" />
              Real-time AI Code Editor
            </CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant={generationStatus === 'idle' ? 'secondary' : generationStatus === 'complete' ? 'default' : 'destructive'}>
                {generationStatus === 'idle' && '⚪ Ready'}
                {generationStatus === 'generating' && '🔄 Generating'}
                {generationStatus === 'streaming' && '✍️ Writing'}
                {generationStatus === 'complete' && '✅ Complete'}
              </Badge>
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex items-center gap-2 pt-2">
            <Button
              onClick={generateCode}
              disabled={generationStatus === 'generating' || streamingState.isStreaming}
              size="sm"
              className="flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Generate Code
            </Button>
            
            {streamingState.isStreaming ? (
              <Button onClick={pauseStreaming} size="sm" variant="outline">
                <Pause className="w-4 h-4" />
              </Button>
            ) : streamingState.isPaused ? (
              <Button onClick={resumeStreaming} size="sm" variant="outline">
                <Play className="w-4 h-4" />
              </Button>
            ) : null}
            
            <Button onClick={stopStreaming} size="sm" variant="outline">
              <Square className="w-4 h-4" />
            </Button>
            
            <Button onClick={copyCode} size="sm" variant="outline" disabled={!streamingState.currentCode}>
              <Copy className="w-4 h-4" />
            </Button>
            
            <Button onClick={downloadCode} size="sm" variant="outline" disabled={!streamingState.currentCode}>
              <Download className="w-4 h-4" />
            </Button>

            <Button
              onClick={() => setShowPreview(!showPreview)}
              size="sm"
              variant="outline"
            >
              {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
          </div>

          {/* Progress Bar */}
          {streamingState.totalLines > 0 && (
            <div className="mt-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Progress: {streamingState.currentLineIndex}/{streamingState.totalLines} lines</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </CardHeader>

        <CardContent className="flex-1 p-0">
          <Editor
            height="100%"
            defaultLanguage="typescript"
            value={streamingState.currentCode}
            theme={editorTheme}
            options={editorOptions}
            onMount={(editor, monaco) => {
              editorRef.current = editor;
              
              // Configure TypeScript compiler options
              monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
                target: monaco.languages.typescript.ScriptTarget.Latest,
                allowNonTsExtensions: true,
                moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
                module: monaco.languages.typescript.ModuleKind.CommonJS,
                noEmit: true,
                esModuleInterop: true,
                jsx: monaco.languages.typescript.JsxEmit.React,
                allowJs: true,
                typeRoots: ['node_modules/@types']
              });
            }}
          />
        </CardContent>
      </Card>

      {/* Preview Panel */}
      {showPreview && (
        <Card className="flex flex-col">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Live Preview
            </CardTitle>
          </CardHeader>
          
          <CardContent className="flex-1 p-0">
            {streamingState.previewHtml ? (
              <iframe
                ref={previewRef}
                srcDoc={streamingState.previewHtml}
                className="w-full h-full border-0 bg-white"
                title="Component Preview"
                sandbox="allow-scripts allow-same-origin"
                onLoad={() => {
                  // Ensure only one instance renders in iframe
                  console.log('Preview iframe loaded');
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                <div className="text-center">
                  <Code2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Preview will appear here as code is generated</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RealTimeCodeEditor;

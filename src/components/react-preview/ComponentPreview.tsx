import React, { useState, useEffect } from 'react';
import { ReactComponent, PreviewState } from '@/types/react-components';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Monitor, 
  Tablet, 
  Smartphone, 
  Sun, 
  Moon, 
  RefreshCw, 
  Maximize2,
  Code2,
  Eye,
  Settings,
  Zap
} from 'lucide-react';
import { createIframePreview } from '@/lib/dynamicRenderer';

interface ComponentPreviewProps {
  component: ReactComponent;
  currentProps: Record<string, any>;
  onPropsChange: (props: Record<string, any>) => void;
}

const ComponentPreview: React.FC<ComponentPreviewProps> = ({
  component,
  currentProps,
  onPropsChange
}) => {
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'code'>('preview');
  const [previewHtml, setPreviewHtml] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Generate preview HTML when component or props change
  useEffect(() => {
    const html = createIframePreview(component.code, currentProps, component.styling);
    setPreviewHtml(html);
  }, [component.code, currentProps, component.styling]);

  const refreshPreview = async () => {
    setIsRefreshing(true);
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 500));
    const html = createIframePreview(component.code, currentProps, component.styling);
    setPreviewHtml(html);
    setIsRefreshing(false);
  };

  const getDeviceFrame = () => {
    switch (deviceMode) {
      case 'mobile':
        return {
          width: '375px',
          height: '667px',
          className: 'border-8 border-gray-800 rounded-[2.5rem] shadow-xl bg-gray-800'
        };
      case 'tablet':
        return {
          width: '768px',
          height: '1024px',
          className: 'border-4 border-gray-600 rounded-2xl shadow-lg bg-gray-600'
        };
      default:
        return {
          width: '100%',
          height: '600px',
          className: 'border border-border rounded-lg shadow-sm bg-background'
        };
    }
  };

  const deviceFrame = getDeviceFrame();

  return (
    <div className={`space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 bg-background p-6' : ''}`}>
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5 text-primary" />
                Live Preview
              </CardTitle>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {component.framework}
              </Badge>
              <Badge variant="outline">
                {component.styling}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              {/* Device Mode Selector */}
              <div className="flex items-center border rounded-lg p-1">
                <Button
                  variant={deviceMode === 'desktop' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setDeviceMode('desktop')}
                  className="px-2"
                >
                  <Monitor className="w-4 h-4" />
                </Button>
                <Button
                  variant={deviceMode === 'tablet' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setDeviceMode('tablet')}
                  className="px-2"
                >
                  <Tablet className="w-4 h-4" />
                </Button>
                <Button
                  variant={deviceMode === 'mobile' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setDeviceMode('mobile')}
                  className="px-2"
                >
                  <Smartphone className="w-4 h-4" />
                </Button>
              </div>

              {/* Theme Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              >
                {theme === 'light' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
              </Button>

              {/* Refresh */}
              <Button
                variant="outline"
                size="sm"
                onClick={refreshPreview}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>

              {/* Fullscreen */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab as any}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preview" className="flex items-center gap-2">
                <Eye className="w-4 h-4" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="code" className="flex items-center gap-2">
                <Code2 className="w-4 h-4" />
                Code
              </TabsTrigger>
            </TabsList>

            <TabsContent value="preview" className="mt-6">
              {/* Device Frame Info */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>Viewing on:</span>
                  <Badge variant="outline" className="capitalize">
                    {deviceMode}
                  </Badge>
                  {deviceMode !== 'desktop' && (
                    <span className="text-xs">
                      {deviceFrame.width} × {deviceFrame.height}
                    </span>
                  )}
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  <span>Theme:</span>
                  <Badge variant="outline" className="capitalize">
                    {theme}
                  </Badge>
                </div>
              </div>

              {/* Preview Container */}
              <div className="flex justify-center">
                <div 
                  className={deviceFrame.className}
                  style={{ 
                    width: deviceFrame.width,
                    maxWidth: '100%',
                    height: deviceFrame.height
                  }}
                >
                  <iframe
                    srcDoc={previewHtml}
                    className="w-full h-full rounded-lg bg-white"
                    title="Component Preview"
                    sandbox="allow-scripts allow-same-origin"
                    style={{
                      border: 'none',
                      borderRadius: deviceMode === 'mobile' ? '2rem' : 
                                  deviceMode === 'tablet' ? '1rem' : '0.5rem'
                    }}
                  />
                </div>
              </div>

              {/* Preview Info */}
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-4">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Live
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-muted-foreground">Responsive:</span>
                    <Badge variant={component.responsive ? "default" : "secondary"}>
                      {component.responsive ? "Yes" : "No"}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-muted-foreground">Accessibility:</span>
                    <Badge variant={component.accessibility.ariaLabels ? "default" : "secondary"}>
                      {component.accessibility.ariaLabels ? "WCAG" : "Basic"}
                    </Badge>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="code" className="mt-6">
              <div className="space-y-4">
                {/* Code Display */}
                <div className="relative">
                  <pre className="bg-slate-950 text-slate-50 p-4 rounded-lg overflow-x-auto text-sm">
                    <code>{component.code}</code>
                  </pre>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => navigator.clipboard.writeText(component.code)}
                  >
                    Copy
                  </Button>
                </div>

                {/* Usage Example */}
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-foreground">Usage Example:</h4>
                  <pre className="bg-muted p-3 rounded text-sm">
                    <code>{component.preview.usage}</code>
                  </pre>
                </div>

                {/* Dependencies */}
                {component.dependencies.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-foreground">Dependencies:</h4>
                    <div className="flex flex-wrap gap-2">
                      {component.dependencies.map((dep, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {dep}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Component Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            Component Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Name</h4>
              <p className="text-sm font-mono">{component.name}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Category</h4>
              <Badge variant="secondary" className="capitalize">
                {component.category}
              </Badge>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Created</h4>
              <p className="text-sm text-muted-foreground">
                {new Date(component.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="mt-4">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Description</h4>
            <p className="text-sm">{component.description}</p>
          </div>

          {component.props.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Props</h4>
              <div className="space-y-2">
                {component.props.map((prop, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                    <div className="flex items-center space-x-2">
                      <code className="text-xs bg-muted px-1 rounded">{prop.name}</code>
                      <Badge variant="outline" className="text-xs">
                        {prop.type}
                      </Badge>
                      {prop.required && (
                        <Badge variant="destructive" className="text-xs">
                          Required
                        </Badge>
                      )}
                    </div>
                    {prop.description && (
                      <span className="text-xs text-muted-foreground">
                        {prop.description}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fullscreen Exit */}
      {isFullscreen && (
        <Button
          variant="outline"
          className="fixed top-4 right-4 z-50"
          onClick={() => setIsFullscreen(false)}
        >
          Exit Fullscreen
        </Button>
      )}
    </div>
  );
};

export default ComponentPreview;

import React, { useState } from 'react';
import { ReactComponent } from '@/types/react-components';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import toast from 'react-hot-toast';
import { 
  Download, 
  Package, 
  Share, 
  Eye, 
  Code2, 
  Settings, 
  Sparkles,
  FileText,
  Layers,
  Palette,
  Zap
} from 'lucide-react';

// Import our preview components
import ComponentPreview from '../react-preview/ComponentPreview';
import PropsEditor from '../react-preview/PropsEditor';
import { exportComponent, ExportOptions } from '@/lib/componentProcessor';
import { componentLibraryService } from '@/lib/componentLibrary';
import { componentVariantsService } from '@/lib/componentVariants';

interface ReactComponentResultsProps {
  component: ReactComponent;
}

const ReactComponentResults: React.FC<ReactComponentResultsProps> = ({ component }) => {
  const [currentProps, setCurrentProps] = useState<Record<string, any>>(() => {
    // Initialize with default prop values
    const defaultProps: Record<string, any> = {};
    component.props.forEach(prop => {
      if (prop.defaultValue !== undefined) {
        defaultProps[prop.name] = prop.defaultValue;
      } else {
        defaultProps[prop.name] = getDefaultValueForType(prop.type);
      }
    });
    return defaultProps;
  });

  const [activeTab, setActiveTab] = useState<'preview' | 'code' | 'export'>('preview');
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'tsx',
    includePropTypes: false,
    includeStyles: true,
    includeStorybook: false,
    includeTests: false,
    packageManager: 'npm',
    bundleType: 'single-file'
  });

  // Export single component file
  const downloadComponent = () => {
    const extension = exportOptions.format;
    const blob = new Blob([component.code], { 
      type: extension.includes('ts') ? 'text/typescript' : 'text/javascript'
    });
    saveAs(blob, `${component.name}.${extension}`);
    toast.success(`${component.name}.${extension} downloaded!`);
  };

  // Export complete package
  const downloadCompletePackage = async () => {
    try {
      const result = exportComponent(component, exportOptions);
      const zip = new JSZip();

      // Add all generated files
      result.files.forEach(file => {
        zip.file(file.name, file.content);
      });

      // Add instructions
      zip.file('INSTRUCTIONS.md', result.instructions);

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, `${component.name}-package.zip`);
      toast.success('Complete package downloaded!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export package');
    }
  };

  // Share component (copy link)
  const shareComponent = () => {
    // In a real app, you'd generate a shareable link
    const shareData = {
      name: component.name,
      description: component.description,
      code: component.code,
      props: currentProps
    };
    
    navigator.clipboard.writeText(JSON.stringify(shareData, null, 2));
    toast.success('Component data copied to clipboard!');
  };

  // Copy component code
  const copyCode = () => {
    navigator.clipboard.writeText(component.code);
    toast.success('Component code copied!');
  };

  // Save component to library
  const saveToLibrary = async () => {
    try {
      await componentLibraryService.saveComponent(component);
      toast.success(`Component "${component.name}" saved to library!`);
    } catch (error) {
      console.error('Failed to save component:', error);
      toast.error('Failed to save component to library');
    }
  };

  // Generate variants with real functionality
  const generateVariant = async (variantType: string) => {
    try {
      toast.loading(`Generating ${variantType} variant...`, { id: 'variant-generation' });
      
      const result = await componentVariantsService.generateVariant(component, variantType);
      
      if (result.success && result.variant) {
        // Save the variant to library automatically
        await componentLibraryService.saveComponent(result.variant);
        toast.success(`${variantType} variant generated and saved!`, { id: 'variant-generation' });
      } else {
        toast.error(result.error || `Failed to generate ${variantType} variant`, { id: 'variant-generation' });
      }
    } catch (error) {
      console.error('Variant generation error:', error);
      toast.error('Failed to generate variant', { id: 'variant-generation' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                {component.displayName}
              </CardTitle>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {component.framework}
              </Badge>
              <Badge variant="outline">
                {component.styling}
              </Badge>
              <Badge variant={component.responsive ? "default" : "secondary"}>
                {component.responsive ? "Responsive" : "Fixed"}
              </Badge>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" onClick={shareComponent}>
                <Share className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={downloadComponent}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button onClick={downloadCompletePackage}>
                <Package className="w-4 h-4 mr-2" />
                Export Package
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            {component.description}
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Preview Panel */}
        <div className="lg:col-span-2">
          <ComponentPreview
            component={component}
            currentProps={currentProps}
            onPropsChange={setCurrentProps}
          />
        </div>

        {/* Props Editor Panel */}
        <div className="space-y-6">
          <PropsEditor
            props={component.props}
            currentValues={currentProps}
            onChange={setCurrentProps}
          />

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start" onClick={copyCode}>
                <Code2 className="w-4 h-4 mr-2" />
                Copy Component Code
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => generateVariant('Dark Theme')}
              >
                <Palette className="w-4 h-4 mr-2" />
                Generate Dark Variant
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => generateVariant('Mobile-First')}
              >
                <Layers className="w-4 h-4 mr-2" />
                Generate Mobile Variant
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={saveToLibrary}
              >
                <Package className="w-4 h-4 mr-2" />
                Save to Library
              </Button>
            </CardContent>
          </Card>

          {/* Export Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Export Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Format Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Format</label>
                <Select 
                  value={exportOptions.format} 
                  onValueChange={(value: any) => setExportOptions(prev => ({ ...prev, format: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="jsx">JSX (.jsx)</SelectItem>
                    <SelectItem value="tsx">TypeScript (.tsx)</SelectItem>
                    <SelectItem value="js">JavaScript (.js)</SelectItem>
                    <SelectItem value="ts">TypeScript (.ts)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Package Manager */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Package Manager</label>
                <Select 
                  value={exportOptions.packageManager} 
                  onValueChange={(value: any) => setExportOptions(prev => ({ ...prev, packageManager: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="npm">npm</SelectItem>
                    <SelectItem value="yarn">yarn</SelectItem>
                    <SelectItem value="pnpm">pnpm</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bundle Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Bundle Type</label>
                <Select 
                  value={exportOptions.bundleType} 
                  onValueChange={(value: any) => setExportOptions(prev => ({ ...prev, bundleType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single-file">Single File</SelectItem>
                    <SelectItem value="multi-file">Multi File</SelectItem>
                    <SelectItem value="package">Full Package</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Additional Options */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Include Styles</span>
                  <input
                    type="checkbox"
                    checked={exportOptions.includeStyles}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeStyles: e.target.checked }))}
                    className="rounded"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Include Storybook</span>
                  <input
                    type="checkbox"
                    checked={exportOptions.includeStorybook}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeStorybook: e.target.checked }))}
                    className="rounded"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm">Include Tests</span>
                  <input
                    type="checkbox"
                    checked={exportOptions.includeTests}
                    onChange={(e) => setExportOptions(prev => ({ ...prev, includeTests: e.target.checked }))}
                    className="rounded"
                  />
                </div>
                
                {component.framework === 'react' && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Include PropTypes</span>
                    <input
                      type="checkbox"
                      checked={exportOptions.includePropTypes}
                      onChange={(e) => setExportOptions(prev => ({ ...prev, includePropTypes: e.target.checked }))}
                      className="rounded"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Component Details */}
      <Card>
        <CardHeader>
          <CardTitle>Component Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Category</h4>
              <Badge variant="secondary" className="capitalize mt-1">
                {component.category}
              </Badge>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Dependencies</h4>
              <p className="text-sm mt-1">{component.dependencies.length} packages</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Props</h4>
              <p className="text-sm mt-1">{component.props.length} properties</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">Accessibility</h4>
              <Badge 
                variant={component.accessibility.ariaLabels ? "default" : "secondary"}
                className="mt-1"
              >
                {component.accessibility.ariaLabels ? "WCAG" : "Basic"}
              </Badge>
            </div>
          </div>
          
          {component.dependencies.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-muted-foreground mb-2">Dependencies</h4>
              <div className="flex flex-wrap gap-2">
                {component.dependencies.map((dep, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {dep}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

function getDefaultValueForType(type: string): any {
  switch (type) {
    case 'string': return '';
    case 'number': return 0;
    case 'boolean': return false;
    case 'array': return [];
    case 'object': return {};
    case 'function': return () => {};
    case 'node': return '';
    default: return '';
  }
}

export default ReactComponentResults;

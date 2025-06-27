import React, { useState, useEffect } from 'react';
import { ReactComponent } from '@/types/react-components';
import { componentCompositionService } from '@/lib/componentComposition';
import { componentLibraryService } from '@/lib/componentLibrary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Minus, 
  Layers, 
  Sparkles, 
  AlertCircle, 
  CheckCircle,
  Lightbulb,
  Zap,
  Grid,
  FileText,
  Palette,
  Monitor
} from 'lucide-react';
import toast from 'react-hot-toast';

/**
 * Component Composer - Clean separation of concerns
 * Presentation layer for component composition
 */

interface ComponentComposerProps {
  availableComponents?: ReactComponent[];
  onCompositionComplete?: (composition: ReactComponent) => void;
  className?: string;
}

const ComponentComposer: React.FC<ComponentComposerProps> = ({
  availableComponents = [],
  onCompositionComplete,
  className = ''
}) => {
  // State management (presentation layer)
  const [selectedComponents, setSelectedComponents] = useState<ReactComponent[]>([]);
  const [allComponents, setAllComponents] = useState<ReactComponent[]>(availableComponents);
  const [compositionStrategy, setCompositionStrategy] = useState<string>('Layout Composition');
  const [compositionType, setCompositionType] = useState<string>('dashboard');
  const [isComposing, setIsComposing] = useState(false);
  const [compatibility, setCompatibility] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'select' | 'analyze' | 'compose'>('select');

  // Business logic hooks
  const { strategies } = useCompositionStrategies();
  const { filteredComponents } = useComponentFiltering(allComponents, searchQuery);

  // Load components if not provided
  useEffect(() => {
    if (availableComponents.length === 0) {
      loadAllComponents();
    }
  }, [availableComponents.length]);

  // Analyze compatibility when components change
  useEffect(() => {
    if (selectedComponents.length > 0) {
      analyzeCompatibility();
    } else {
      setCompatibility(null);
    }
  }, [selectedComponents]);

  // Business logic methods
  const loadAllComponents = async () => {
    try {
      const components = await componentLibraryService.getAllComponents();
      setAllComponents(components);
    } catch (error) {
      console.error('Failed to load components:', error);
      toast.error('Failed to load components from library');
    }
  };

  const analyzeCompatibility = () => {
    const analysis = componentCompositionService.analyzeCompositionCompatibility(selectedComponents);
    setCompatibility(analysis);
  };

  const addComponent = (component: ReactComponent) => {
    if (!selectedComponents.find(c => c.id === component.id)) {
      setSelectedComponents(prev => [...prev, component]);
    }
  };

  const removeComponent = (componentId: string) => {
    setSelectedComponents(prev => prev.filter(c => c.id !== componentId));
  };

  const createComposition = async () => {
    if (selectedComponents.length === 0) {
      toast.error('Please select at least one component');
      return;
    }

    try {
      setIsComposing(true);
      toast.loading('Creating composition...', { id: 'composition' });

      const result = await componentCompositionService.composeComponents(
        selectedComponents,
        compositionStrategy,
        compositionType
      );

      if (result.success && result.composition) {
        // Save to library automatically
        await componentLibraryService.saveComponent(result.composition);
        
        toast.success('Composition created and saved!', { id: 'composition' });
        onCompositionComplete?.(result.composition);
        
        // Reset state
        setSelectedComponents([]);
        setActiveTab('select');
      } else {
        toast.error(result.error || 'Failed to create composition', { id: 'composition' });
      }
    } catch (error) {
      console.error('Composition error:', error);
      toast.error('Failed to create composition', { id: 'composition' });
    } finally {
      setIsComposing(false);
    }
  };

  const createQuickComposition = async (quickType: string) => {
    if (selectedComponents.length === 0) {
      toast.error('Please select components first');
      return;
    }

    try {
      setIsComposing(true);
      toast.loading(`Creating ${quickType}...`, { id: 'quick-composition' });

      const result = await componentCompositionService.createQuickComposition(
        selectedComponents,
        quickType as any
      );

      if (result.success && result.composition) {
        await componentLibraryService.saveComponent(result.composition);
        toast.success(`${quickType} created!`, { id: 'quick-composition' });
        onCompositionComplete?.(result.composition);
        setSelectedComponents([]);
      } else {
        toast.error(result.error || `Failed to create ${quickType}`, { id: 'quick-composition' });
      }
    } catch (error) {
      console.error('Quick composition error:', error);
      toast.error('Failed to create quick composition', { id: 'quick-composition' });
    } finally {
      setIsComposing(false);
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <CompositionHeader 
        selectedCount={selectedComponents.length}
        compatibility={compatibility}
      />

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab as any} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="select" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Select Components ({selectedComponents.length})
          </TabsTrigger>
          <TabsTrigger value="analyze" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Analyze Compatibility
          </TabsTrigger>
          <TabsTrigger value="compose" className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Create Composition
          </TabsTrigger>
        </TabsList>

        <TabsContent value="select" className="space-y-4">
          <ComponentSelector
            components={filteredComponents}
            selectedComponents={selectedComponents}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onAdd={addComponent}
            onRemove={removeComponent}
          />
        </TabsContent>

        <TabsContent value="analyze" className="space-y-4">
          <CompatibilityAnalyzer
            selectedComponents={selectedComponents}
            compatibility={compatibility}
            onAnalyze={analyzeCompatibility}
          />
        </TabsContent>

        <TabsContent value="compose" className="space-y-4">
          <CompositionBuilder
            selectedComponents={selectedComponents}
            strategies={strategies}
            compositionStrategy={compositionStrategy}
            compositionType={compositionType}
            isComposing={isComposing}
            onStrategyChange={setCompositionStrategy}
            onTypeChange={setCompositionType}
            onCreate={createComposition}
            onQuickCreate={createQuickComposition}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

/**
 * Reusable hooks with business logic separation
 */
function useCompositionStrategies() {
  const [strategies, setStrategies] = useState<any[]>([]);

  useEffect(() => {
    const availableStrategies = componentCompositionService.getAvailableStrategies();
    setStrategies(availableStrategies);
  }, []);

  return { strategies };
}

function useComponentFiltering(components: ReactComponent[], searchQuery: string) {
  const filteredComponents = React.useMemo(() => {
    if (!searchQuery.trim()) return components;
    
    const query = searchQuery.toLowerCase();
    return components.filter(component =>
      component.name.toLowerCase().includes(query) ||
      component.displayName.toLowerCase().includes(query) ||
      component.description.toLowerCase().includes(query) ||
      component.category.toLowerCase().includes(query)
    );
  }, [components, searchQuery]);

  return { filteredComponents };
}

/**
 * Pure presentation components
 */
interface CompositionHeaderProps {
  selectedCount: number;
  compatibility: any;
}

const CompositionHeader: React.FC<CompositionHeaderProps> = ({ selectedCount, compatibility }) => (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            Component Composer
          </CardTitle>
          <p className="text-muted-foreground mt-1">
            Combine multiple components into cohesive layouts and pages
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Grid className="w-3 h-3" />
            {selectedCount} Selected
          </Badge>
          
          {compatibility && (
            <Badge 
              variant={compatibility.compatible ? "default" : "destructive"}
              className="flex items-center gap-1"
            >
              {compatibility.compatible ? (
                <CheckCircle className="w-3 h-3" />
              ) : (
                <AlertCircle className="w-3 h-3" />
              )}
              {compatibility.score}% Compatible
            </Badge>
          )}
        </div>
      </div>
    </CardHeader>
  </Card>
);

/**
 * Component Selector
 */
interface ComponentSelectorProps {
  components: ReactComponent[];
  selectedComponents: ReactComponent[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAdd: (component: ReactComponent) => void;
  onRemove: (componentId: string) => void;
}

const ComponentSelector: React.FC<ComponentSelectorProps> = ({
  components,
  selectedComponents,
  searchQuery,
  onSearchChange,
  onAdd,
  onRemove
}) => (
  <div className="space-y-4">
    {/* Search */}
    <Input
      placeholder="Search components..."
      value={searchQuery}
      onChange={(e) => onSearchChange(e.target.value)}
      className="max-w-md"
    />

    {/* Selected Components */}
    {selectedComponents.length > 0 && (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Selected Components</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {selectedComponents.map(component => (
              <Badge key={component.id} variant="default" className="flex items-center gap-1">
                {component.displayName}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                  onClick={() => onRemove(component.id)}
                >
                  <Minus className="w-3 h-3" />
                </Button>
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    )}

    {/* Available Components */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {components.map(component => {
        const isSelected = selectedComponents.some(c => c.id === component.id);
        
        return (
          <Card key={component.id} className={`hover:shadow-md transition-shadow ${isSelected ? 'ring-2 ring-primary' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-sm">{component.displayName}</h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {component.description}
                  </p>
                </div>
                <Button
                  variant={isSelected ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => isSelected ? onRemove(component.id) : onAdd(component)}
                >
                  {isSelected ? <Minus className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-1">
                <Badge variant="secondary" className="text-xs">{component.framework}</Badge>
                <Badge variant="outline" className="text-xs">{component.category}</Badge>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>

    {components.length === 0 && (
      <Card>
        <CardContent className="p-8 text-center">
          <Grid className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No components found</h3>
          <p className="text-muted-foreground">
            Generate some components first to start composing
          </p>
        </CardContent>
      </Card>
    )}
  </div>
);

/**
 * Compatibility Analyzer
 */
interface CompatibilityAnalyzerProps {
  selectedComponents: ReactComponent[];
  compatibility: any;
  onAnalyze: () => void;
}

const CompatibilityAnalyzer: React.FC<CompatibilityAnalyzerProps> = ({
  selectedComponents,
  compatibility,
  onAnalyze
}) => {
  if (selectedComponents.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No components selected</h3>
          <p className="text-muted-foreground">
            Select components to analyze their compatibility
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Compatibility Score */}
      {compatibility && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {compatibility.compatible ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              Compatibility Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Compatibility Score</span>
                <span className="font-medium">{compatibility.score}%</span>
              </div>
              <Progress value={compatibility.score} className="h-2" />
            </div>

            {compatibility.issues.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-red-600">Issues</h4>
                {compatibility.issues.map((issue: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                    <span>{issue}</span>
                  </div>
                ))}
              </div>
            )}

            {compatibility.suggestions.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-blue-600">Suggestions</h4>
                {compatibility.suggestions.map((suggestion: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <Lightbulb className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <span>{suggestion}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Re-analyze button */}
      <Card>
        <CardContent className="p-4">
          <Button onClick={onAnalyze} variant="outline" className="w-full">
            <Sparkles className="w-4 h-4 mr-2" />
            Re-analyze Compatibility
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Composition Builder
 */
interface CompositionBuilderProps {
  selectedComponents: ReactComponent[];
  strategies: any[];
  compositionStrategy: string;
  compositionType: string;
  isComposing: boolean;
  onStrategyChange: (strategy: string) => void;
  onTypeChange: (type: string) => void;
  onCreate: () => void;
  onQuickCreate: (type: string) => void;
}

const CompositionBuilder: React.FC<CompositionBuilderProps> = ({
  selectedComponents,
  strategies,
  compositionStrategy,
  compositionType,
  isComposing,
  onStrategyChange,
  onTypeChange,
  onCreate,
  onQuickCreate
}) => {
  const quickTypes = [
    { id: 'dashboard', name: 'Dashboard', icon: Monitor },
    { id: 'landing-page', name: 'Landing Page', icon: FileText },
    { id: 'form-layout', name: 'Form Layout', icon: Grid },
    { id: 'card-gallery', name: 'Card Gallery', icon: Layers },
    { id: 'admin-panel', name: 'Admin Panel', icon: Palette }
  ];

  if (selectedComponents.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Layers className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No components selected</h3>
          <p className="text-muted-foreground">
            Select components to create a composition
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Compositions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Quick Compositions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {quickTypes.map(type => {
              const Icon = type.icon;
              return (
                <Button
                  key={type.id}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => onQuickCreate(type.id)}
                  disabled={isComposing}
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-xs">{type.name}</span>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Custom Composition */}
      <Card>
        <CardHeader>
          <CardTitle>Custom Composition</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Strategy Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Composition Strategy</label>
            <Select value={compositionStrategy} onValueChange={onStrategyChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {strategies.map(strategy => (
                  <SelectItem key={strategy.name} value={strategy.name}>
                    {strategy.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Type Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Composition Type</label>
            <Input
              value={compositionType}
              onChange={(e) => onTypeChange(e.target.value)}
              placeholder="e.g., dashboard, landing, form..."
            />
          </div>

          {/* Create Button */}
          <Button 
            onClick={onCreate} 
            disabled={isComposing || !compositionType.trim()}
            className="w-full"
          >
            {isComposing ? (
              <>
                <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                Creating Composition...
              </>
            ) : (
              <>
                <Layers className="w-4 h-4 mr-2" />
                Create Custom Composition
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComponentComposer;

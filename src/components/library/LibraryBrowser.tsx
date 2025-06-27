import React, { useState, useEffect, useMemo } from 'react';
import { ReactComponent } from '@/types/react-components';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { componentLibraryService } from '@/lib/componentLibrary';
import { componentVariantsService } from '@/lib/componentVariants';
import { componentComposerService } from '@/lib/componentComposer';
import toast from 'react-hot-toast';
import {
  Search,
  Filter,
  Grid3X3,
  List,
  Package,
  Star,
  Download,
  Eye,
  Code2,
  Trash2,
  Edit,
  Copy,
  Layers,
  Palette,
  Zap,
  TrendingUp,
  Users,
  Calendar,
  BarChart3
} from 'lucide-react';

interface LibraryBrowserProps {
  onComponentSelect?: (component: ReactComponent) => void;
  onComponentEdit?: (component: ReactComponent) => void;
  showActions?: boolean;
}

type ViewMode = 'grid' | 'list';
type SortBy = 'name' | 'created' | 'updated' | 'downloads' | 'rating';
type FilterBy = 'all' | 'buttons' | 'forms' | 'navigation' | 'layout' | 'data-display' | 'feedback' | 'overlay';

const LibraryBrowser: React.FC<LibraryBrowserProps> = ({
  onComponentSelect,
  onComponentEdit,
  showActions = true
}) => {
  const [components, setComponents] = useState<ReactComponent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortBy>('name');
  const [filterBy, setFilterBy] = useState<FilterBy>('all');
  const [selectedComponent, setSelectedComponent] = useState<ReactComponent | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [stats, setStats] = useState({
    totalComponents: 0,
    categories: {} as Record<string, number>,
    frameworks: {} as Record<string, number>,
    stylingTypes: {} as Record<string, number>,
    recentActivity: 0
  });

  useEffect(() => {
    loadComponents();
  }, []);

  const loadComponents = async () => {
    try {
      setLoading(true);
      const result = await componentLibraryService.getComponents();
      if (result.success) {
        setComponents(result.components || []);
        calculateStats(result.components || []);
      } else {
        toast.error('Failed to load components');
      }
    } catch (error) {
      console.error('Failed to load components:', error);
      toast.error('Failed to load component library');
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (components: ReactComponent[]) => {
    const categories: Record<string, number> = {};
    const frameworks: Record<string, number> = {};
    const stylingTypes: Record<string, number> = {};
    
    components.forEach(component => {
      // Count categories
      categories[component.category] = (categories[component.category] || 0) + 1;
      
      // Count frameworks
      frameworks[component.framework] = (frameworks[component.framework] || 0) + 1;
      
      // Count styling types
      stylingTypes[component.styling] = (stylingTypes[component.styling] || 0) + 1;
    });

    // Calculate recent activity (components created in last 7 days)
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const recentActivity = components.filter(c => 
      new Date(c.metadata?.createdAt || 0).getTime() > weekAgo
    ).length;

    setStats({
      totalComponents: components.length,
      categories,
      frameworks,
      stylingTypes,
      recentActivity
    });
  };

  const filteredAndSortedComponents = useMemo(() => {
    let filtered = components;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(component => 
        component.name.toLowerCase().includes(query) ||
        component.displayName.toLowerCase().includes(query) ||
        component.description.toLowerCase().includes(query) ||
        component.category.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(component => 
        component.category === filterBy
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.displayName.localeCompare(b.displayName);
        case 'created':
          return new Date(b.metadata?.createdAt || 0).getTime() - new Date(a.metadata?.createdAt || 0).getTime();
        case 'updated':
          return new Date(b.metadata?.updatedAt || 0).getTime() - new Date(a.metadata?.updatedAt || 0).getTime();
        case 'downloads':
          return (b.metadata?.downloadCount || 0) - (a.metadata?.downloadCount || 0);
        case 'rating':
          return (b.metadata?.rating || 0) - (a.metadata?.rating || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [components, searchQuery, filterBy, sortBy]);

  const handleComponentAction = async (action: string, component: ReactComponent) => {
    switch (action) {
      case 'select':
        onComponentSelect?.(component);
        break;
      case 'edit':
        onComponentEdit?.(component);
        break;
      case 'preview':
        setSelectedComponent(component);
        setShowPreview(true);
        break;
      case 'duplicate':
        try {
          const duplicated = {
            ...component,
            id: `${component.id}_copy_${Date.now()}`,
            name: `${component.name}Copy`,
            displayName: `${component.displayName} Copy`,
            metadata: {
              ...component.metadata,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          };
          await componentLibraryService.saveComponent(duplicated);
          toast.success('Component duplicated successfully');
          loadComponents();
        } catch (error) {
          toast.error('Failed to duplicate component');
        }
        break;
      case 'delete':
        try {
          await componentLibraryService.deleteComponent(component.id);
          toast.success('Component deleted successfully');
          loadComponents();
        } catch (error) {
          toast.error('Failed to delete component');
        }
        break;
      case 'generate-variant':
        try {
          toast.loading('Generating variant...', { id: 'variant-gen' });
          const result = await componentVariantsService.generateVariant(component, 'Dark Theme');
          if (result.success && result.variant) {
            await componentLibraryService.saveComponent(result.variant);
            toast.success('Variant generated and saved!', { id: 'variant-gen' });
            loadComponents();
          } else {
            toast.error(result.error || 'Failed to generate variant', { id: 'variant-gen' });
          }
        } catch (error) {
          toast.error('Failed to generate variant', { id: 'variant-gen' });
        }
        break;
    }
  };

  const renderComponentCard = (component: ReactComponent) => {
    const isGridView = viewMode === 'grid';
    
    return (
      <Card 
        key={component.id} 
        className={`group hover:shadow-md transition-all duration-200 cursor-pointer ${
          isGridView ? 'h-full' : 'mb-3'
        }`}
        onClick={() => handleComponentAction('select', component)}
      >
        <CardHeader className={isGridView ? 'pb-3' : 'pb-2'}>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="w-4 h-4 text-primary" />
                {component.displayName}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {component.framework}
                </Badge>
                <Badge variant="outline" className="text-xs capitalize">
                  {component.category}
                </Badge>
                {component.responsive && (
                  <Badge variant="default" className="text-xs">
                    Responsive
                  </Badge>
                )}
              </div>
            </div>
            
            {showActions && (
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleComponentAction('preview', component);
                  }}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleComponentAction('duplicate', component);
                  }}
                >
                  <Copy className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleComponentAction('generate-variant', component);
                  }}
                >
                  <Palette className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        
        <CardContent className={isGridView ? 'pt-0' : 'pt-0 pb-3'}>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {component.description}
          </p>
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <Code2 className="w-3 h-3" />
                {component.props.length} props
              </span>
              <span className="flex items-center gap-1">
                <Package className="w-3 h-3" />
                {component.dependencies.length} deps
              </span>
            </div>
            
            {component.metadata && (
              <div className="flex items-center gap-2">
                {component.metadata.downloadCount && component.metadata.downloadCount > 0 && (
                  <span className="flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    {component.metadata.downloadCount}
                  </span>
                )}
                {component.metadata.rating && component.metadata.rating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    {component.metadata.rating.toFixed(1)}
                  </span>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderStatsPanel = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{stats.totalComponents}</p>
              <p className="text-sm text-muted-foreground">Total Components</p>
            </div>
            <Package className="w-8 h-8 text-primary" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{Object.keys(stats.categories).length}</p>
              <p className="text-sm text-muted-foreground">Categories</p>
            </div>
            <Grid3X3 className="w-8 h-8 text-primary" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{stats.recentActivity}</p>
              <p className="text-sm text-muted-foreground">Recent (7 days)</p>
            </div>
            <TrendingUp className="w-8 h-8 text-primary" />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold">{Object.keys(stats.frameworks).length}</p>
              <p className="text-sm text-muted-foreground">Frameworks</p>
            </div>
            <Zap className="w-8 h-8 text-primary" />
          </div>
        </CardContent>
      </Card>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Panel */}
      {renderStatsPanel()}
      
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 flex-1">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Filter */}
          <Select value={filterBy} onValueChange={(value: FilterBy) => setFilterBy(value)}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="buttons">Buttons</SelectItem>
              <SelectItem value="forms">Forms</SelectItem>
              <SelectItem value="navigation">Navigation</SelectItem>
              <SelectItem value="layout">Layout</SelectItem>
              <SelectItem value="data-display">Data Display</SelectItem>
              <SelectItem value="feedback">Feedback</SelectItem>
              <SelectItem value="overlay">Overlay</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Sort */}
          <Select value={sortBy} onValueChange={(value: SortBy) => setSortBy(value)}>
            <SelectTrigger className="w-48">
              <BarChart3 className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="created">Created Date</SelectItem>
              <SelectItem value="updated">Updated Date</SelectItem>
              <SelectItem value="downloads">Downloads</SelectItem>
              <SelectItem value="rating">Rating</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* View Mode */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className="w-4 h-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      {/* Results Info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Showing {filteredAndSortedComponents.length} of {components.length} components
          {searchQuery && ` for "${searchQuery}"`}
          {filterBy !== 'all' && ` in ${filterBy}`}
        </span>
      </div>
      
      {/* Components Grid/List */}
      {filteredAndSortedComponents.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No components found</h3>
            <p className="text-muted-foreground">
              {searchQuery || filterBy !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Start by generating your first component'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className={viewMode === 'grid' 
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
          : 'space-y-3'
        }>
          {filteredAndSortedComponents.map(renderComponentCard)}
        </div>
      )}
      
      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              {selectedComponent?.displayName}
            </DialogTitle>
            <DialogDescription>
              {selectedComponent?.description}
            </DialogDescription>
          </DialogHeader>
          
          {selectedComponent && (
            <div className="space-y-4">
              {/* Component preview would go here */}
              <div className="bg-muted/50 rounded-lg p-4 border-2 border-dashed">
                <div className="text-center text-muted-foreground">
                  <Code2 className="w-8 h-8 mx-auto mb-2" />
                  <p>Component Preview</p>
                  <p className="text-sm">Real-time preview would render here</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{selectedComponent.framework}</Badge>
                  <Badge variant="outline">{selectedComponent.styling}</Badge>
                  <Badge variant="default" className="capitalize">
                    {selectedComponent.category}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => selectedComponent && handleComponentAction('duplicate', selectedComponent)}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Duplicate
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => selectedComponent && handleComponentAction('select', selectedComponent)}
                  >
                    Use Component
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LibraryBrowser;

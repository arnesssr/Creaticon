import React, { useState, useEffect } from 'react';
import { ReactComponent, ComponentLibrary } from '@/types/react-components';
import { componentLibraryService } from '@/lib/componentLibrary';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Plus, 
  Save, 
  Trash2, 
  Eye, 
  Copy,
  Package,
  Sparkles,
  Calendar,
  Tag,
  Code,
  Layers
} from 'lucide-react';
import toast from 'react-hot-toast';

// Presentation layer - pure components with no business logic
interface ComponentLibraryManagerProps {
  onComponentSelect?: (component: ReactComponent) => void;
  onComponentSave?: (component: ReactComponent) => void;
  className?: string;
}

/**
 * Main Component Library Manager
 * Handles the orchestration between UI and business logic
 */
const ComponentLibraryManager: React.FC<ComponentLibraryManagerProps> = ({
  onComponentSelect,
  onComponentSave,
  className = ''
}) => {
  // State management (presentation state)
  const [components, setComponents] = useState<ReactComponent[]>([]);
  const [libraries, setLibraries] = useState<ComponentLibrary[]>([]);
  const [filteredComponents, setFilteredComponents] = useState<ReactComponent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedFramework, setSelectedFramework] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState<'components' | 'libraries' | 'stats'>('components');

  // Business logic hooks (separated for reusability)
  const { stats, refreshStats } = useLibraryStats();
  const { categories, frameworks } = useFilterOptions(components);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  // Filter components when search/filter criteria change
  useEffect(() => {
    applyFilters();
  }, [components, searchQuery, selectedCategory, selectedFramework]);

  // Business logic methods
  const loadData = async () => {
    try {
      setIsLoading(true);
      const [componentsData, librariesData] = await Promise.all([
        componentLibraryService.getAllComponents(),
        componentLibraryService.getAllLibraries()
      ]);
      
      setComponents(componentsData);
      setLibraries(librariesData);
      await refreshStats();
    } catch (error) {
      console.error('Failed to load library data:', error);
      toast.error('Failed to load component library');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...components];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(component =>
        component.name.toLowerCase().includes(query) ||
        component.displayName.toLowerCase().includes(query) ||
        component.description.toLowerCase().includes(query) ||
        component.category.toLowerCase().includes(query)
      );
    }

    // Apply category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(component => component.category === selectedCategory);
    }

    // Apply framework filter
    if (selectedFramework !== 'all') {
      filtered = filtered.filter(component => component.framework === selectedFramework);
    }

    setFilteredComponents(filtered);
  };

  const handleSaveComponent = async (component: ReactComponent) => {
    try {
      await componentLibraryService.saveComponent(component);
      await loadData(); // Refresh data
      toast.success(`Component "${component.name}" saved to library`);
      onComponentSave?.(component);
    } catch (error) {
      console.error('Failed to save component:', error);
      toast.error('Failed to save component');
    }
  };

  const handleDeleteComponent = async (id: string) => {
    try {
      await componentLibraryService.deleteComponent(id);
      await loadData(); // Refresh data
      toast.success('Component deleted from library');
    } catch (error) {
      console.error('Failed to delete component:', error);
      toast.error('Failed to delete component');
    }
  };

  const handleComponentSelect = (component: ReactComponent) => {
    onComponentSelect?.(component);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <ComponentLibraryHeader 
        stats={stats}
        onRefresh={loadData}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab as any} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="components" className="flex items-center gap-2">
            <Package className="w-4 h-4" />
            Components ({components.length})
          </TabsTrigger>
          <TabsTrigger value="libraries" className="flex items-center gap-2">
            <Layers className="w-4 h-4" />
            Libraries ({libraries.length})
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="components" className="space-y-4">
          <ComponentsFilterBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            selectedFramework={selectedFramework}
            onFrameworkChange={setSelectedFramework}
            categories={categories}
            frameworks={frameworks}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />

          <ComponentsGrid
            components={filteredComponents}
            viewMode={viewMode}
            onSelect={handleComponentSelect}
            onDelete={handleDeleteComponent}
          />
        </TabsContent>

        <TabsContent value="libraries" className="space-y-4">
          <LibrariesView
            libraries={libraries}
            onRefresh={loadData}
          />
        </TabsContent>

        <TabsContent value="stats" className="space-y-4">
          <LibraryStatsView
            stats={stats}
            onRefresh={refreshStats}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

/**
 * Reusable hook for library statistics
 */
function useLibraryStats() {
  const [stats, setStats] = useState<any>(null);

  const refreshStats = async () => {
    try {
      const newStats = await componentLibraryService.getLibraryStats();
      setStats(newStats);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  return { stats, refreshStats };
}

/**
 * Reusable hook for filter options
 */
function useFilterOptions(components: ReactComponent[]) {
  const categories = React.useMemo(() => {
    const uniqueCategories = [...new Set(components.map(c => c.category))];
    return uniqueCategories.sort();
  }, [components]);

  const frameworks = React.useMemo(() => {
    const uniqueFrameworks = [...new Set(components.map(c => c.framework))];
    return uniqueFrameworks.sort();
  }, [components]);

  return { categories, frameworks };
}

/**
 * Pure component - Loading state
 */
const LoadingState: React.FC = () => (
  <Card>
    <CardContent className="p-8 text-center">
      <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
      <p className="text-muted-foreground">Loading component library...</p>
    </CardContent>
  </Card>
);

/**
 * Pure component - Library header
 */
interface ComponentLibraryHeaderProps {
  stats: any;
  onRefresh: () => void;
}

const ComponentLibraryHeader: React.FC<ComponentLibraryHeaderProps> = ({ stats, onRefresh }) => (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-primary" />
            Component Library
          </CardTitle>
          <p className="text-muted-foreground mt-1">
            Manage and organize your generated components
          </p>
        </div>
        <Button variant="outline" onClick={onRefresh}>
          <Sparkles className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
      
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.totalComponents}</div>
            <div className="text-sm text-muted-foreground">Components</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">{stats.totalLibraries}</div>
            <div className="text-sm text-muted-foreground">Libraries</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {Object.keys(stats.componentsByCategory).length}
            </div>
            <div className="text-sm text-muted-foreground">Categories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-primary">
              {Object.keys(stats.componentsByFramework).length}
            </div>
            <div className="text-sm text-muted-foreground">Frameworks</div>
          </div>
        </div>
      )}
    </CardHeader>
  </Card>
);

/**
 * Pure component - Filter bar
 */
interface ComponentsFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedFramework: string;
  onFrameworkChange: (framework: string) => void;
  categories: string[];
  frameworks: string[];
  viewMode: 'grid' | 'list';
  onViewModeChange: (mode: 'grid' | 'list') => void;
}

const ComponentsFilterBar: React.FC<ComponentsFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  selectedFramework,
  onFrameworkChange,
  categories,
  frameworks,
  viewMode,
  onViewModeChange
}) => (
  <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/50 rounded-lg">
    {/* Search */}
    <div className="relative flex-1 min-w-[200px]">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
      <Input
        placeholder="Search components..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-9"
      />
    </div>

    {/* Category Filter */}
    <Select value={selectedCategory} onValueChange={onCategoryChange}>
      <SelectTrigger className="w-[150px]">
        <SelectValue placeholder="Category" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Categories</SelectItem>
        {categories.map(category => (
          <SelectItem key={category} value={category}>
            {category.charAt(0).toUpperCase() + category.slice(1)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

    {/* Framework Filter */}
    <Select value={selectedFramework} onValueChange={onFrameworkChange}>
      <SelectTrigger className="w-[150px]">
        <SelectValue placeholder="Framework" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Frameworks</SelectItem>
        {frameworks.map(framework => (
          <SelectItem key={framework} value={framework}>
            {framework}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>

    {/* View Mode Toggle */}
    <div className="flex items-center border rounded-lg p-1">
      <Button
        variant={viewMode === 'grid' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('grid')}
        className="px-2"
      >
        <Grid className="w-4 h-4" />
      </Button>
      <Button
        variant={viewMode === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('list')}
        className="px-2"
      >
        <List className="w-4 h-4" />
      </Button>
    </div>
  </div>
);

/**
 * Pure component - Components grid/list
 */
interface ComponentsGridProps {
  components: ReactComponent[];
  viewMode: 'grid' | 'list';
  onSelect: (component: ReactComponent) => void;
  onDelete: (id: string) => void;
}

const ComponentsGrid: React.FC<ComponentsGridProps> = ({
  components,
  viewMode,
  onSelect,
  onDelete
}) => {
  if (components.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No components found</h3>
          <p className="text-muted-foreground">
            Generate some components to start building your library
          </p>
        </CardContent>
      </Card>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-3">
        {components.map(component => (
          <ComponentListItem
            key={component.id}
            component={component}
            onSelect={onSelect}
            onDelete={onDelete}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {components.map(component => (
        <ComponentGridItem
          key={component.id}
          component={component}
          onSelect={onSelect}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

/**
 * Pure component - Component grid item
 */
interface ComponentItemProps {
  component: ReactComponent;
  onSelect: (component: ReactComponent) => void;
  onDelete: (id: string) => void;
}

const ComponentGridItem: React.FC<ComponentItemProps> = ({ component, onSelect, onDelete }) => (
  <Card className="hover:shadow-md transition-shadow cursor-pointer">
    <CardHeader className="pb-3">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-sm">{component.displayName}</h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {component.description}
          </p>
        </div>
        <div className="flex space-x-1">
          <Button variant="ghost" size="sm" onClick={() => onSelect(component)}>
            <Eye className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(component.id)}>
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </CardHeader>
    <CardContent className="pt-0">
      <div className="flex flex-wrap gap-1 mb-3">
        <Badge variant="secondary" className="text-xs">{component.framework}</Badge>
        <Badge variant="outline" className="text-xs">{component.category}</Badge>
        {component.responsive && (
          <Badge variant="default" className="text-xs">Responsive</Badge>
        )}
      </div>
      <div className="text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          {new Date(component.createdAt).toLocaleDateString()}
        </div>
      </div>
    </CardContent>
  </Card>
);

const ComponentListItem: React.FC<ComponentItemProps> = ({ component, onSelect, onDelete }) => (
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <div>
              <h3 className="font-medium">{component.displayName}</h3>
              <p className="text-sm text-muted-foreground">{component.description}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">{component.framework}</Badge>
          <Badge variant="outline">{component.category}</Badge>
          <Button variant="ghost" size="sm" onClick={() => onSelect(component)}>
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onDelete(component.id)}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
);

/**
 * Placeholder components for other tabs
 */
const LibrariesView: React.FC<{ libraries: ComponentLibrary[]; onRefresh: () => void }> = () => (
  <Card>
    <CardContent className="p-8 text-center">
      <Layers className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-2">Libraries Feature</h3>
      <p className="text-muted-foreground">Coming soon - organize components into themed libraries</p>
    </CardContent>
  </Card>
);

const LibraryStatsView: React.FC<{ stats: any; onRefresh: () => void }> = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <Card>
      <CardHeader>
        <CardTitle>Components by Category</CardTitle>
      </CardHeader>
      <CardContent>
        {stats?.componentsByCategory ? (
          <div className="space-y-3">
            {Object.entries(stats.componentsByCategory).map(([category, count]) => (
              <div key={category} className="flex justify-between items-center">
                <span className="capitalize">{category}</span>
                <Badge variant="secondary">{count as number}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No data available</p>
        )}
      </CardContent>
    </Card>

    <Card>
      <CardHeader>
        <CardTitle>Components by Framework</CardTitle>
      </CardHeader>
      <CardContent>
        {stats?.componentsByFramework ? (
          <div className="space-y-3">
            {Object.entries(stats.componentsByFramework).map(([framework, count]) => (
              <div key={framework} className="flex justify-between items-center">
                <span>{framework}</span>
                <Badge variant="secondary">{count as number}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">No data available</p>
        )}
      </CardContent>
    </Card>
  </div>
);

export default ComponentLibraryManager;

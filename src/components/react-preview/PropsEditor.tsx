import React, { useState, useEffect } from 'react';
import { ComponentProp } from '@/types/react-components';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Settings2, 
  RotateCcw, 
  Save, 
  Upload,
  Copy,
  Trash2,
  Plus,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface PropsEditorProps {
  props: ComponentProp[];
  currentValues: Record<string, any>;
  onChange: (values: Record<string, any>) => void;
  onSavePreset?: (name: string, values: Record<string, any>) => void;
  presets?: Array<{ name: string; values: Record<string, any> }>;
}

const PropsEditor: React.FC<PropsEditorProps> = ({
  props,
  currentValues,
  onChange,
  onSavePreset,
  presets = []
}) => {
  const [values, setValues] = useState<Record<string, any>>(currentValues);
  const [presetName, setPresetName] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Update local state when external values change
  useEffect(() => {
    setValues(currentValues);
  }, [currentValues]);

  // Update parent when local values change
  const updateValue = (propName: string, value: any) => {
    const newValues = { ...values, [propName]: value };
    setValues(newValues);
    onChange(newValues);
  };

  // Reset to default values
  const resetToDefaults = () => {
    const defaultValues: Record<string, any> = {};
    props.forEach(prop => {
      if (prop.defaultValue !== undefined) {
        defaultValues[prop.name] = prop.defaultValue;
      } else {
        defaultValues[prop.name] = getDefaultValueForType(prop.type);
      }
    });
    setValues(defaultValues);
    onChange(defaultValues);
  };

  // Apply preset
  const applyPreset = (presetValues: Record<string, any>) => {
    setValues(presetValues);
    onChange(presetValues);
  };

  // Save current values as preset
  const saveCurrentAsPreset = () => {
    if (presetName.trim() && onSavePreset) {
      onSavePreset(presetName.trim(), values);
      setPresetName('');
    }
  };

  // Export current configuration
  const exportConfig = () => {
    const config = {
      props: values,
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'component-props.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Copy props as code
  const copyAsCode = () => {
    const propsCode = Object.entries(values)
      .map(([key, value]) => {
        if (typeof value === 'string') {
          return `${key}="${value}"`;
        } else if (typeof value === 'boolean') {
          return value ? key : '';
        } else {
          return `${key}={${JSON.stringify(value)}}`;
        }
      })
      .filter(Boolean)
      .join(' ');
    
    navigator.clipboard.writeText(propsCode);
  };

  if (props.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-muted-foreground">
            <Settings2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No props available for this component</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const basicProps = props.filter(prop => prop.required || !showAdvanced);
  const advancedProps = props.filter(prop => !prop.required && showAdvanced);

  return (
    <Card>
      <Collapsible open={!isCollapsed} onOpenChange={setIsCollapsed}>
        <CardHeader>
          <CollapsibleTrigger className="flex items-center justify-between w-full text-left">
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="w-5 h-5 text-primary" />
              Props Editor ({props.length})
            </CardTitle>
            {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </CollapsibleTrigger>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="space-y-6">
            {/* Quick Actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" onClick={resetToDefaults}>
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button variant="outline" size="sm" onClick={copyAsCode}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Props
                </Button>
                <Button variant="outline" size="sm" onClick={exportConfig}>
                  <Upload className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>

              {props.some(p => !p.required) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowAdvanced(!showAdvanced)}
                >
                  {showAdvanced ? 'Hide' : 'Show'} Advanced
                </Button>
              )}
            </div>

            {/* Presets */}
            {presets.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Presets</Label>
                <div className="flex flex-wrap gap-2">
                  {presets.map((preset, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => applyPreset(preset.values)}
                      className="text-xs"
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Save Preset */}
            {onSavePreset && (
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Preset name"
                  value={presetName}
                  onChange={(e) => setPresetName(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={saveCurrentAsPreset}
                  disabled={!presetName.trim()}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            )}

            {/* Basic Props */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Required Props</h4>
                <Badge variant="secondary" className="text-xs">
                  {basicProps.length}
                </Badge>
              </div>
              
              {basicProps.map((prop) => (
                <PropInput
                  key={prop.name}
                  prop={prop}
                  value={values[prop.name]}
                  onChange={(value) => updateValue(prop.name, value)}
                />
              ))}
            </div>

            {/* Advanced Props */}
            {showAdvanced && advancedProps.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium">Optional Props</h4>
                  <Badge variant="outline" className="text-xs">
                    {advancedProps.length}
                  </Badge>
                </div>
                
                {advancedProps.map((prop) => (
                  <PropInput
                    key={prop.name}
                    prop={prop}
                    value={values[prop.name]}
                    onChange={(value) => updateValue(prop.name, value)}
                  />
                ))}
              </div>
            )}

            {/* Current Values Preview */}
            <div className="mt-6 p-3 bg-muted/50 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Current Props Object</h4>
              <pre className="text-xs overflow-x-auto">
                <code>{JSON.stringify(values, null, 2)}</code>
              </pre>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

interface PropInputProps {
  prop: ComponentProp;
  value: any;
  onChange: (value: any) => void;
}

const PropInput: React.FC<PropInputProps> = ({ prop, value, onChange }) => {
  const renderInput = () => {
    switch (prop.type) {
      case 'boolean':
        return (
          <div className="flex items-center space-x-2">
            <Switch
              checked={Boolean(value)}
              onCheckedChange={onChange}
            />
            <span className="text-sm">{value ? 'true' : 'false'}</span>
          </div>
        );

      case 'number':
        // Check if prop has options for slider
        if (prop.options && prop.options.length > 0) {
          const min = Math.min(...prop.options.map(Number));
          const max = Math.max(...prop.options.map(Number));
          return (
            <div className="space-y-2">
              <Slider
                value={[Number(value) || 0]}
                onValueChange={([newValue]) => onChange(newValue)}
                min={min}
                max={max}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{min}</span>
                <span className="font-medium">{value}</span>
                <span>{max}</span>
              </div>
            </div>
          );
        }
        return (
          <Input
            type="number"
            value={value || ''}
            onChange={(e) => onChange(Number(e.target.value))}
            placeholder={`Enter ${prop.name}`}
          />
        );

      case 'string':
        // Check if prop has options for select
        if (prop.options && prop.options.length > 0) {
          return (
            <Select value={value || ''} onValueChange={onChange}>
              <SelectTrigger>
                <SelectValue placeholder={`Select ${prop.name}`} />
              </SelectTrigger>
              <SelectContent>
                {prop.options.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );
        }
        
        // Multi-line text
        if (prop.name.toLowerCase().includes('text') || 
            prop.name.toLowerCase().includes('content') ||
            prop.name.toLowerCase().includes('description')) {
          return (
            <Textarea
              value={value || ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={`Enter ${prop.name}`}
              rows={3}
            />
          );
        }
        
        return (
          <Input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${prop.name}`}
          />
        );

      case 'array':
        return (
          <div className="space-y-2">
            <Textarea
              value={Array.isArray(value) ? JSON.stringify(value, null, 2) : '[]'}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  if (Array.isArray(parsed)) {
                    onChange(parsed);
                  }
                } catch {
                  // Invalid JSON, ignore
                }
              }}
              placeholder="Enter JSON array"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Enter a valid JSON array (e.g., ["item1", "item2"])
            </p>
          </div>
        );

      case 'object':
        return (
          <div className="space-y-2">
            <Textarea
              value={typeof value === 'object' ? JSON.stringify(value, null, 2) : '{}'}
              onChange={(e) => {
                try {
                  const parsed = JSON.parse(e.target.value);
                  onChange(parsed);
                } catch {
                  // Invalid JSON, ignore
                }
              }}
              placeholder="Enter JSON object"
              rows={4}
            />
              <p className="text-xs text-muted-foreground">
                Enter a valid JSON object (e.g., {'{"key": "value"}'})
              </p>
          </div>
        );

      case 'function':
        return (
          <div className="space-y-2">
            <Input
              value="() => {}"
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">
              Function props are set to default handlers
            </p>
          </div>
        );

      case 'node':
        return (
          <Input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Enter JSX content"
          />
        );

      default:
        return (
          <Input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Enter ${prop.name}`}
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label htmlFor={prop.name} className="text-sm font-medium">
          {prop.name}
        </Label>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            {prop.type}
          </Badge>
          {prop.required && (
            <Badge variant="destructive" className="text-xs">
              Required
            </Badge>
          )}
        </div>
      </div>
      
      {renderInput()}
      
      {prop.description && (
        <p className="text-xs text-muted-foreground">
          {prop.description}
        </p>
      )}
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

export default PropsEditor;

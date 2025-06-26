import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SimpleThemeToggle } from '@/components/ui/theme-toggle';
import { 
  X, 
  Settings, 
  Key, 
  Eye, 
  EyeOff, 
  Save, 
  Trash2, 
  History,
  Sparkles,
  Palette,
  Layout,
  Moon
} from 'lucide-react';
import toast from 'react-hot-toast';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface APIKeys {
  openrouter: string;
  openai: string;
  anthropic: string;
  gemini: string;
}

type SidebarSection = 'main' | 'settings' | 'history';

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const [currentSection, setCurrentSection] = useState<SidebarSection>('main');
  const [apiKeys, setApiKeys] = useState<APIKeys>({
    openrouter: '',
    openai: '',
    anthropic: '',
    gemini: ''
  });
  
  const [showKeys, setShowKeys] = useState({
    openrouter: false,
    openai: false,
    anthropic: false,
    gemini: false
  });

  // Load API keys from localStorage on component mount
  useEffect(() => {
    const savedKeys = localStorage.getItem('creaticon_api_keys');
    if (savedKeys) {
      try {
        const parsed = JSON.parse(savedKeys);
        setApiKeys(parsed);
      } catch (error) {
        console.error('Failed to parse saved API keys:', error);
      }
    }
  }, []);

  const handleKeyChange = (provider: keyof APIKeys, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: value
    }));
  };

  const toggleKeyVisibility = (provider: keyof APIKeys) => {
    setShowKeys(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  const saveKeys = () => {
    localStorage.setItem('creaticon_api_keys', JSON.stringify(apiKeys));
    toast.success('API keys saved successfully!');
  };

  const clearKey = (provider: keyof APIKeys) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: ''
    }));
    toast.success(`${provider} API key cleared`);
  };

  const clearAllKeys = () => {
    setApiKeys({
      openrouter: '',
      openai: '',
      anthropic: '',
      gemini: ''
    });
    localStorage.removeItem('creaticon_api_keys');
    toast.success('All API keys cleared');
  };

  const testAPI = async () => {
    toast.loading('Testing API connection...', { id: 'api-test' });
    
    try {
      // Test with a simple request
      const testKey = apiKeys.openrouter || apiKeys.gemini;
      if (!testKey) {
        throw new Error('No API key available for testing');
      }

      if (apiKeys.openrouter) {
        // Test OpenRouter
        const response = await fetch('https://openrouter.ai/api/v1/models', {
          headers: {
            'Authorization': `Bearer ${apiKeys.openrouter}`,
            'HTTP-Referer': 'https://creaticon.app',
            'X-Title': 'Creaticon - API Test'
          }
        });
        
        if (response.ok) {
          toast.success('OpenRouter API connected successfully!', { id: 'api-test' });
        } else {
          throw new Error(`OpenRouter API error: ${response.status}`);
        }
      } else if (apiKeys.gemini) {
        // Test Gemini (just check if key format is valid)
        if (apiKeys.gemini.startsWith('AI')) {
          toast.success('Gemini API key format looks valid!', { id: 'api-test' });
        } else {
          throw new Error('Invalid Gemini API key format');
        }
      }
    } catch (error) {
      console.error('API test error:', error);
      toast.error(
        error instanceof Error ? error.message : 'API test failed', 
        { id: 'api-test' }
      );
    }
  };

  const providers = [
    {
      key: 'openrouter' as keyof APIKeys,
      name: 'OpenRouter',
      description: 'Access to Claude 3.5 Sonnet, GPT-4o, DeepSeek V3, and more',
      placeholder: 'sk-or-v1-...',
      recommended: true
    },
    {
      key: 'openai' as keyof APIKeys,
      name: 'OpenAI',
      description: 'GPT-4o, GPT-4 Turbo for advanced UI generation',
      placeholder: 'sk-...',
      recommended: true
    },
    {
      key: 'anthropic' as keyof APIKeys,
      name: 'Anthropic',
      description: 'Claude 3.5 Sonnet for high-quality code generation',
      placeholder: 'sk-ant-...',
      recommended: true
    },
    {
      key: 'gemini' as keyof APIKeys,
      name: 'Google Gemini',
      description: 'Gemini Pro for creative icon and UI generation',
      placeholder: 'AI...',
      recommended: true
    }
  ];

  const menuItems = [
    {
      id: 'main' as SidebarSection,
      label: 'Home',
      icon: Sparkles
    },
    {
      id: 'history' as SidebarSection,
      label: 'History',
      icon: History
    },
    {
      id: 'settings' as SidebarSection,
      label: 'Settings',
      icon: Settings
    }
  ];


  if (!isOpen) return null;

  const renderMainContent = () => {
    switch (currentSection) {
      case 'main':
        return (
          <div className="space-y-4">
            <div className="text-center py-8">
              <Sparkles className="w-16 h-16 text-primary mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Welcome to Creaticon</h3>
              <p className="text-sm text-muted-foreground">
                Generate beautiful icons and UI components with AI
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Card className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                <Palette className="w-8 h-8 text-blue-500 mb-2" />
                <h4 className="font-medium text-sm mb-1">Icon Packs</h4>
                <p className="text-xs text-muted-foreground">Generate custom SVG icons</p>
              </Card>
              
              <Card className="p-4 cursor-pointer hover:bg-muted/50 transition-colors">
                <Layout className="w-8 h-8 text-green-500 mb-2" />
                <h4 className="font-medium text-sm mb-1">UI Components</h4>
                <p className="text-xs text-muted-foreground">Create complete interfaces</p>
              </Card>
            </div>
          </div>
        );

      case 'history':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Generation History</h3>
            <div className="text-center py-12 text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-sm">No generations yet</p>
              <p className="text-xs mt-1">Your recent creations will appear here</p>
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Settings</h3>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Key className="w-4 h-4" />
                  API Keys
                </CardTitle>
                <CardDescription className="text-xs">
                  Add your own API keys for unlimited access and better performance.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {providers.map((provider) => (
                  <div key={provider.key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor={provider.key} className="text-xs font-medium">
                        {provider.name}
                        {provider.recommended && (
                          <span className="ml-1 px-1.5 py-0.5 text-xs bg-primary/10 text-primary rounded">
                            ⭐
                          </span>
                        )}
                      </Label>
                      {apiKeys[provider.key] && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => clearKey(provider.key)}
                          className="h-5 w-5 p-0 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                    
                    <p className="text-xs text-muted-foreground">
                      {provider.description}
                    </p>
                    
                    <div className="relative">
                      <Input
                        id={provider.key}
                        type={showKeys[provider.key] ? "text" : "password"}
                        placeholder={provider.placeholder}
                        value={apiKeys[provider.key]}
                        onChange={(e) => handleKeyChange(provider.key, e.target.value)}
                        className="pr-8 text-xs"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-1 top-1/2 -translate-y-1/2 h-5 w-5 p-0"
                        onClick={() => toggleKeyVisibility(provider.key)}
                      >
                        {showKeys[provider.key] ? (
                          <EyeOff className="w-3 h-3" />
                        ) : (
                          <Eye className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}

              <div className="flex gap-2 pt-3">
                <Button onClick={saveKeys} size="sm" className="flex-1 text-xs">
                  <Save className="w-3 h-3 mr-1" />
                  Save
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={clearAllKeys}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
              
              <div className="pt-3 border-t border-border">
                <Button 
                  onClick={testAPI}
                  variant="outline" 
                  size="sm" 
                  className="w-full text-xs"
                  disabled={!apiKeys.openrouter && !apiKeys.gemini}
                >
                  🧪 Test API Connection
                </Button>
              </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Moon className="w-4 h-4" />
                  Appearance
                </CardTitle>
                <CardDescription className="text-xs">
                  Switch between light and dark themes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">Theme</Label>
                  <SimpleThemeToggle />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-80 bg-background border-r border-border shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold text-foreground">Creaticon</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Navigation */}
        <div>
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentSection(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-muted/30 transition-colors text-sm ${
                currentSection === item.id ? 'bg-muted/50 text-primary font-medium' : 'text-muted-foreground'
              }`}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {renderMainContent()}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border text-xs text-muted-foreground">
          <p>🔒 Data stored locally • Privacy first</p>
        </div>
      </div>
    </>
  );
};

export default Sidebar;

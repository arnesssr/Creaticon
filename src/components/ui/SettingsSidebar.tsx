import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Settings, Key, Eye, EyeOff, Save, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface SettingsSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface APIKeys {
  openrouter: string;
  openai: string;
  anthropic: string;
  gemini: string;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ isOpen, onClose }) => {
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

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-80 bg-background border-r border-border shadow-xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold text-foreground">Settings</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* API Keys Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="w-4 h-4" />
                API Keys
              </CardTitle>
              <CardDescription>
                Add your own API keys for unlimited access and better performance. Keys are stored locally in your browser.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {providers.map((provider) => (
                <div key={provider.key} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={provider.key} className="text-sm font-medium">
                      {provider.name}
                      {provider.recommended && (
                        <span className="ml-2 px-2 py-1 text-xs bg-primary/10 text-primary rounded-full">
                          Recommended
                        </span>
                      )}
                    </Label>
                    {apiKeys[provider.key] && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => clearKey(provider.key)}
                        className="h-6 w-6 p-0 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-2">
                    {provider.description}
                  </p>
                  
                  <div className="relative">
                    <Input
                      id={provider.key}
                      type={showKeys[provider.key] ? "text" : "password"}
                      placeholder={provider.placeholder}
                      value={apiKeys[provider.key]}
                      onChange={(e) => handleKeyChange(provider.key, e.target.value)}
                      className="pr-10"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
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

              {/* Save and Clear buttons */}
              <div className="flex gap-2 pt-4">
                <Button onClick={saveKeys} className="flex-1">
                  <Save className="w-4 h-4 mr-2" />
                  Save Keys
                </Button>
                <Button 
                  variant="outline" 
                  onClick={clearAllKeys}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* How to get API keys */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">How to get API keys</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-xs">
              <div>
                <p className="font-medium">OpenRouter (Recommended)</p>
                <p className="text-muted-foreground">Visit openrouter.ai → Sign up → Create API key</p>
                <p className="text-blue-600">Access all models with one key</p>
              </div>
              <div>
                <p className="font-medium">OpenAI</p>
                <p className="text-muted-foreground">Visit platform.openai.com → API keys → Create new</p>
              </div>
              <div>
                <p className="font-medium">Anthropic</p>
                <p className="text-muted-foreground">Visit console.anthropic.com → API keys → Create key</p>
              </div>
              <div>
                <p className="font-medium">Google Gemini</p>
                <p className="text-muted-foreground">Visit aistudio.google.com → Get API key</p>
              </div>
            </CardContent>
          </Card>

          {/* Usage note */}
          <div className="p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
            <p className="font-medium mb-1">🔒 Privacy & Security</p>
            <p>Your API keys are stored locally in your browser and never sent to our servers. They are only used to make direct requests to AI providers.</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default SettingsSidebar;

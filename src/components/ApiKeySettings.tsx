import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  KeyIcon, 
  CheckCircleIcon, 
  XCircleIcon, 
  EyeIcon, 
  EyeSlashIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { AI_PROVIDERS, type AIProvider } from '@/lib/aiServices';

interface ApiKeyData {
  provider: AIProvider;
  key: string;
  isValid: boolean;
  isConfigured: boolean;
}

const ApiKeySettings: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<Record<AIProvider, ApiKeyData>>({} as Record<AIProvider, ApiKeyData>);
  const [showKeys, setShowKeys] = useState<Record<AIProvider, boolean>>({} as Record<AIProvider, boolean>);
  const [isLoading, setIsLoading] = useState<Record<AIProvider, boolean>>({} as Record<AIProvider, boolean>);

  useEffect(() => {
    // Initialize API keys from environment variables
    const initialKeys: Record<AIProvider, ApiKeyData> = {} as Record<AIProvider, ApiKeyData>;
    
    Object.keys(AI_PROVIDERS).forEach((provider) => {
      const envKey = getEnvKeyName(provider as AIProvider);
      const storedKey = localStorage.getItem(`api_key_${provider}`) || '';
      
      initialKeys[provider as AIProvider] = {
        provider: provider as AIProvider,
        key: storedKey,
        isValid: false,
        isConfigured: storedKey.length > 0
      };
    });

    setApiKeys(initialKeys);
  }, []);

  const getEnvKeyName = (provider: AIProvider): string => {
    const envMap = {
      openrouter: 'VITE_OPENROUTER_API_KEY',
      openai: 'VITE_OPENAI_API_KEY',
      anthropic: 'VITE_ANTHROPIC_API_KEY',
      gemini: 'VITE_GEMINI_API_KEY',
      huggingface: 'VITE_HUGGINGFACE_API_KEY'
    };
    return envMap[provider];
  };

  const validateApiKey = async (provider: AIProvider, key: string): Promise<boolean> => {
    if (!key.trim()) return false;

    setIsLoading(prev => ({ ...prev, [provider]: true }));

    try {
      // Simple validation based on key format
      const validationRules = {
        openrouter: /^sk-or-v1-[a-zA-Z0-9_-]+$/,
        openai: /^sk-[a-zA-Z0-9_-]+$/,
        anthropic: /^sk-ant-[a-zA-Z0-9_-]+$/,
        gemini: /^[a-zA-Z0-9_-]+$/,
        huggingface: /^hf_[a-zA-Z0-9_-]+$/
      };

      const isFormatValid = validationRules[provider]?.test(key) || false;
      
      // For now, we'll just validate format. In production, you might want to make actual API calls
      setIsLoading(prev => ({ ...prev, [provider]: false }));
      return isFormatValid;
    } catch (error) {
      setIsLoading(prev => ({ ...prev, [provider]: false }));
      return false;
    }
  };

  const handleKeyChange = async (provider: AIProvider, newKey: string) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        key: newKey,
        isConfigured: newKey.length > 0
      }
    }));

    if (newKey.trim()) {
      const isValid = await validateApiKey(provider, newKey);
      setApiKeys(prev => ({
        ...prev,
        [provider]: {
          ...prev[provider],
          isValid
        }
      }));
    }
  };

  const saveApiKey = (provider: AIProvider) => {
    const key = apiKeys[provider]?.key || '';
    if (key.trim()) {
      localStorage.setItem(`api_key_${provider}`, key);
      // Also set it as environment variable for immediate use
      (window as any).__CREATICON_API_KEYS = {
        ...(window as any).__CREATICON_API_KEYS,
        [getEnvKeyName(provider)]: key
      };
    } else {
      localStorage.removeItem(`api_key_${provider}`);
    }
  };

  const toggleKeyVisibility = (provider: AIProvider) => {
    setShowKeys(prev => ({
      ...prev,
      [provider]: !prev[provider]
    }));
  };

  const getProviderIcon = (provider: AIProvider) => {
    return AI_PROVIDERS[provider]?.icon || '🔗';
  };

  const getProviderStatus = (provider: AIProvider) => {
    const data = apiKeys[provider];
    if (!data?.isConfigured) return { status: 'not-configured', label: 'Not Configured', color: 'secondary' };
    if (isLoading[provider]) return { status: 'validating', label: 'Validating...', color: 'secondary' };
    if (data.isValid) return { status: 'valid', label: 'Valid', color: 'success' };
    return { status: 'invalid', label: 'Invalid Format', color: 'destructive' };
  };

  const configuredCount = Object.values(apiKeys).filter(key => key.isConfigured).length;
  const validCount = Object.values(apiKeys).filter(key => key.isValid).length;

  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center space-x-3">
        <KeyIcon className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Key Management</h1>
          <p className="text-gray-600">Configure your AI provider API keys to unlock generation features</p>
        </div>
      </div>

      {/* Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <InformationCircleIcon className="h-5 w-5" />
            <span>Configuration Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{Object.keys(AI_PROVIDERS).length}</div>
              <div className="text-sm text-gray-600">Available Providers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{configuredCount}</div>
              <div className="text-sm text-gray-600">Configured</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-600">{validCount}</div>
              <div className="text-sm text-gray-600">Valid</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Provider Configuration */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md">
          <TabsTrigger value="all">All Providers</TabsTrigger>
          <TabsTrigger value="configured">Configured Only</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {Object.entries(AI_PROVIDERS).map(([providerId, provider]) => {
            const providerKey = providerId as AIProvider;
            const keyData = apiKeys[providerKey];
            const status = getProviderStatus(providerKey);
            
            return (
              <Card key={providerId} className="transition-all hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getProviderIcon(providerKey)}</span>
                      <div>
                        <CardTitle className="text-lg">{provider.name}</CardTitle>
                        <CardDescription>{provider.description}</CardDescription>
                      </div>
                    </div>
                    <Badge 
                      variant={
                        status.status === 'valid' ? 'default' : 
                        status.status === 'invalid' ? 'destructive' : 
                        'secondary'
                      }
                      className="flex items-center space-x-1"
                    >
                      {status.status === 'valid' && <CheckCircleIcon className="h-3 w-3" />}
                      {status.status === 'invalid' && <XCircleIcon className="h-3 w-3" />}
                      {status.status === 'validating' && <div className="h-3 w-3 animate-spin border border-current border-t-transparent rounded-full" />}
                      <span>{status.label}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex space-x-2">
                      <div className="relative flex-1">
                        <Input
                          type={showKeys[providerKey] ? 'text' : 'password'}
                          placeholder={`Enter your ${provider.name} API key`}
                          value={keyData?.key || ''}
                          onChange={(e) => handleKeyChange(providerKey, e.target.value)}
                          className="pr-20"
                        />
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleKeyVisibility(providerKey)}
                            className="h-6 w-6 p-0"
                          >
                            {showKeys[providerKey] ? 
                              <EyeSlashIcon className="h-4 w-4" /> : 
                              <EyeIcon className="h-4 w-4" />
                            }
                          </Button>
                        </div>
                      </div>
                      <Button
                        onClick={() => saveApiKey(providerKey)}
                        disabled={!keyData?.key?.trim()}
                        className="shrink-0"
                      >
                        Save
                      </Button>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      <strong>Models:</strong> {provider.models.join(', ')}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </TabsContent>

        <TabsContent value="configured" className="space-y-4">
          {Object.entries(AI_PROVIDERS)
            .filter(([providerId]) => apiKeys[providerId as AIProvider]?.isConfigured)
            .map(([providerId, provider]) => {
              const providerKey = providerId as AIProvider;
              const keyData = apiKeys[providerKey];
              const status = getProviderStatus(providerKey);
              
              return (
                <Card key={providerId} className="transition-all hover:shadow-md">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{getProviderIcon(providerKey)}</span>
                        <div>
                          <CardTitle className="text-lg">{provider.name}</CardTitle>
                          <CardDescription>{provider.description}</CardDescription>
                        </div>
                      </div>
                      <Badge 
                        variant={status.status === 'valid' ? 'default' : 'destructive'}
                        className="flex items-center space-x-1"
                      >
                        {status.status === 'valid' ? 
                          <CheckCircleIcon className="h-3 w-3" /> : 
                          <XCircleIcon className="h-3 w-3" />
                        }
                        <span>{status.label}</span>
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-gray-500">
                      <strong>Models:</strong> {provider.models.join(', ')}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          
          {configuredCount === 0 && (
            <Alert>
              <ExclamationTriangleIcon className="h-4 w-4" />
              <AlertDescription>
                No API keys configured yet. Configure at least one provider to start generating.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
      </Tabs>

      {/* Help Section */}
      <Alert>
        <InformationCircleIcon className="h-4 w-4" />
        <AlertDescription>
          <strong>Getting API Keys:</strong> Click on the provider links in the documentation above to get your API keys. 
          You only need to configure the providers you want to use. OpenRouter is recommended as it provides access to multiple models with a single key.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ApiKeySettings;

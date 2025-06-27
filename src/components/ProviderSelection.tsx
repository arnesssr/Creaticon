import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AI_PROVIDERS, type AIProvider } from '@/lib/aiServices';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface ProviderSelectionProps {
  selectedProvider: AIProvider;
  onProviderChange: (provider: AIProvider) => void;
  className?: string;
}

const ProviderSelection: React.FC<ProviderSelectionProps> = ({
  selectedProvider,
  onProviderChange,
  className = ''
}) => {
  const [availableProviders, setAvailableProviders] = useState<AIProvider[]>([]);

  useEffect(() => {
    // Check which providers have API keys configured
    const configured: AIProvider[] = [];
    
    Object.keys(AI_PROVIDERS).forEach((provider) => {
      const envKey = getEnvKeyName(provider as AIProvider);
      const storedKey = localStorage.getItem(`api_key_${provider}`) || '';
      const envValue = import.meta.env[envKey] || '';
      
      if (storedKey || envValue) {
        configured.push(provider as AIProvider);
      }
    });

    // Always include openrouter as default if no providers configured
    if (configured.length === 0) {
      configured.push('openrouter');
    }

    setAvailableProviders(configured);
    
    // Set default provider if current selection is not available
    if (!configured.includes(selectedProvider)) {
      onProviderChange(configured[0] || 'openrouter');
    }
  }, [selectedProvider, onProviderChange]);

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

  const isProviderConfigured = (provider: AIProvider): boolean => {
    const envKey = getEnvKeyName(provider);
    const storedKey = localStorage.getItem(`api_key_${provider}`) || '';
    const envValue = import.meta.env[envKey] || '';
    return !!(storedKey || envValue);
  };

  const getProviderStatus = (provider: AIProvider) => {
    if (isProviderConfigured(provider)) {
      return { configured: true, icon: CheckCircleIcon, color: 'text-green-600' };
    }
    return { configured: false, icon: ExclamationTriangleIcon, color: 'text-yellow-600' };
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-gray-900">AI Provider</h3>
          <p className="text-xs text-gray-500">Choose which AI model to use for generation</p>
        </div>
        
        <Select value={selectedProvider} onValueChange={onProviderChange}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(AI_PROVIDERS).map(([providerId, provider]) => {
              const status = getProviderStatus(providerId as AIProvider);
              const StatusIcon = status.icon;
              
              return (
                <SelectItem 
                  key={providerId} 
                  value={providerId}
                  disabled={!status.configured}
                >
                  <div className="flex items-center space-x-2 w-full">
                    <span className="text-lg">{provider.icon}</span>
                    <div className="flex-1">
                      <div className="font-medium">{provider.name}</div>
                      <div className="text-xs text-gray-500">{provider.models[0]}</div>
                    </div>
                    <StatusIcon className={`h-4 w-4 ${status.color}`} />
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Selected Provider Info */}
      {selectedProvider && (
        <Card className="bg-gray-50/50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">{AI_PROVIDERS[selectedProvider]?.icon}</span>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-sm">{AI_PROVIDERS[selectedProvider]?.name}</h4>
                  {isProviderConfigured(selectedProvider) ? (
                    <Badge variant="default" className="text-xs">
                      <CheckCircleIcon className="h-3 w-3 mr-1" />
                      Ready
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="text-xs">
                      <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                      Configure API Key
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {AI_PROVIDERS[selectedProvider]?.description}
                </p>
                <div className="mt-2">
                  <span className="text-xs text-gray-500">
                    Models: {AI_PROVIDERS[selectedProvider]?.models.join(', ')}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Warning for unconfigured providers */}
      {availableProviders.length === 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-start space-x-2">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-yellow-800">No AI Providers Configured</h4>
                <p className="text-xs text-yellow-700 mt-1">
                  Please configure at least one AI provider in the settings to start generating.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProviderSelection;

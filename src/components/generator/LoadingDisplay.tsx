import React, { useState, useEffect } from 'react';
import { 
  AnimatedSearch, 
  AnimatedPalette, 
  AnimatedLightning, 
  AnimatedMagicWand, 
  AnimatedPackage,
  AnimatedGear
} from '../ui/animated-icons';

interface LoadingDisplayProps {
  generationType: 'icons' | 'ui';
}

const LoadingDisplay: React.FC<LoadingDisplayProps> = ({ generationType }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const loadingSteps = generationType === 'icons' 
    ? [
        { text: 'Analyzing your creative vision...', component: AnimatedSearch, color: 'from-cyan-500 to-blue-500' },
        { text: 'Crafting stunning icon concepts...', component: AnimatedPalette, color: 'from-purple-500 to-pink-500' },
        { text: 'Generating beautiful SVG assets...', component: AnimatedLightning, color: 'from-yellow-500 to-orange-500' },
        { text: 'Adding magical touches...', component: AnimatedMagicWand, color: 'from-indigo-500 to-purple-500' },
        { text: 'Bundling your icon masterpiece...', component: AnimatedPackage, color: 'from-blue-500 to-indigo-500' }
      ]
    : [
        { text: 'Understanding your UI vision...', component: AnimatedSearch, color: 'from-cyan-500 to-blue-500' },
        { text: 'Building component architecture...', component: AnimatedGear, color: 'from-green-500 to-emerald-500' },
        { text: 'Applying beautiful styles...', component: AnimatedPalette, color: 'from-purple-500 to-pink-500' },
        { text: 'Adding smooth interactions...', component: AnimatedLightning, color: 'from-yellow-500 to-orange-500' },
        { text: 'Finalizing your UI creation...', component: AnimatedPackage, color: 'from-blue-500 to-indigo-500' }
      ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const next = prev + 1;
        // Loop through steps continuously to show ongoing process
        return next >= loadingSteps.length ? 0 : next;
      });
    }, 2000); // Slower transition for better visibility

    return () => clearInterval(interval);
  }, [loadingSteps.length]);

  const CurrentIcon = loadingSteps[currentStep].component;
  const currentColor = loadingSteps[currentStep].color;

  return (
    <div className="relative bg-gradient-to-br from-slate-50 to-white border border-gray-200 rounded-2xl shadow-2xl p-12 text-center overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 right-10 w-16 h-16 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-400 rounded-full blur-lg"></div>
      </div>
      
      <div className="relative z-10">
        {/* Creaticon branding */}
        <div className="mb-8">
          <div className={`inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br ${currentColor} shadow-xl mb-4 transform transition-all duration-500 hover:scale-110`}>
            <CurrentIcon className="w-12 h-12 text-white" />
          </div>
          
          <div className="mb-6">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Creaticon AI Studio
            </h2>
            <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${currentColor} text-white font-semibold text-sm shadow-lg`}>
              {generationType === 'icons' ? 'Icon Generation' : 'UI Creation'}
            </div>
          </div>
        </div>

        {/* Current step */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-3 animate-pulse">
            {loadingSteps[currentStep].text}
          </h3>
          <p className="text-gray-600 text-lg">
            Creating something amazing for you...
          </p>
        </div>

        {/* Enhanced progress bar */}
        <div className="mb-8">
          <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
            <div 
              className={`h-3 bg-gradient-to-r ${currentColor} rounded-full transition-all duration-1000 ease-out shadow-lg`}
              style={{ width: `${((currentStep + 1) / loadingSteps.length) * 100}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2 text-sm font-medium text-gray-500">
            <span>Step {currentStep + 1} of {loadingSteps.length}</span>
            <span>{Math.round(((currentStep + 1) / loadingSteps.length) * 100)}%</span>
          </div>
        </div>

        {/* Step indicators */}
        <div className="flex justify-center space-x-3">
          {loadingSteps.map((step, index) => {
            const StepIcon = step.component;
            return (
              <div
                key={index}
                className={`relative w-12 h-12 rounded-xl transition-all duration-300 ${
                  index <= currentStep 
                    ? `bg-gradient-to-br ${step.color} shadow-lg scale-110` 
                    : 'bg-gray-100 scale-100'
                }`}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <StepIcon 
                    className={`w-6 h-6 transition-colors duration-300 ${
                      index <= currentStep ? 'text-white' : 'text-gray-400'
                    }`} 
                  />
                </div>
                {index === currentStep && (
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl blur opacity-30 animate-pulse"></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Time estimate */}
        <div className="mt-8 text-sm text-gray-500">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Estimated time: 30-60 seconds</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadingDisplay;

import { create } from 'zustand';
import { GenerationState, ProcessedCode, UserInput } from '@/types';

export const useGenerationStore = create<GenerationState>((set) => ({
  isLoading: false,
  generatedCode: null,
  error: null,
  userInput: null,
  
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  
  setGeneratedCode: (code: ProcessedCode | null) => set({ 
    generatedCode: code, 
    error: null,
    isLoading: false 
  }),
  
  setError: (error: string | null) => set({ 
    error, 
    isLoading: false 
  }),
  
  setUserInput: (input: UserInput) => set({ userInput: input }),
  
  reset: () => set({
    isLoading: false,
    generatedCode: null,
    error: null,
    userInput: null
  })
}));

import { UserInput } from '@/types';

// DeepSeek R1 Analysis Response
export interface DeepSeekAnalysis {
  appArchitecture: AppArchitecture;
  iconRequirements: IconRequirements;
  designGuidelines: DesignGuidelines;
  contextualInsights: ContextualInsights;
  success: boolean;
  error?: string;
}

// App Architecture Analysis
export interface AppArchitecture {
  appType: string;
  userPersonas: UserPersona[];
  coreFeatures: Feature[];
  userJourneys: UserJourney[];
  informationArchitecture: InformationArchitecture;
}

export interface UserPersona {
  name: string;
  description: string;
  goals: string[];
  painPoints: string[];
}

export interface Feature {
  name: string;
  description: string;
  priority: 'critical' | 'important' | 'nice-to-have';
  userActions: string[];
  requiredIcons: string[];
}

export interface UserJourney {
  name: string;
  steps: JourneyStep[];
}

export interface JourneyStep {
  action: string;
  touchpoint: string;
  iconNeeded: string;
  emotionalState: string;
}

export interface InformationArchitecture {
  navigationStructure: NavigationItem[];
  contentCategories: ContentCategory[];
}

export interface NavigationItem {
  label: string;
  iconType: string;
  children?: NavigationItem[];
  priority: number;
}

export interface ContentCategory {
  name: string;
  iconFamily: string;
  subCategories: string[];
}

// Icon Requirements Analysis
export interface IconRequirements {
  totalIconsNeeded: number;
  iconCategories: IconCategory[];
  semanticRelationships: SemanticRelationship[];
  stylisticGuidelines: StylisticGuideline[];
}

export interface IconCategory {
  name: string;
  count: number;
  purpose: string;
  examples: string[];
  designPriority: 'high' | 'medium' | 'low';
  contextualMeaning: string;
}

export interface SemanticRelationship {
  primaryIcon: string;
  relatedIcons: string[];
  relationship: 'hierarchy' | 'workflow' | 'category' | 'state';
  visualConnection: string;
}

export interface StylisticGuideline {
  category: string;
  visualStyle: string;
  colorRecommendation: string;
  animationSuggestion: string;
  reasoning: string;
}

// Design Guidelines
export interface DesignGuidelines {
  visualTheme: VisualTheme;
  colorPalette: ColorPalette;
  iconStyle: IconStyleGuide;
  interactionPatterns: InteractionPattern[];
}

export interface VisualTheme {
  primary: string;
  mood: string;
  personality: string[];
  visualCues: string[];
}

export interface ColorPalette {
  primary: string[];
  secondary: string[];
  accent: string[];
  semantic: SemanticColors;
  reasoning: string;
}

export interface SemanticColors {
  success: string;
  warning: string;
  error: string;
  info: string;
  neutral: string;
}

export interface IconStyleGuide {
  styleFamily: 'outlined' | 'filled' | 'rounded' | 'sharp' | 'two-tone';
  strokeWidth: number;
  cornerRadius: number;
  visualWeight: 'light' | 'regular' | 'medium' | 'bold';
  proportions: string;
}

export interface InteractionPattern {
  trigger: string;
  animation: string;
  feedback: string;
  purpose: string;
}

// Contextual Insights
export interface ContextualInsights {
  domainExpertise: DomainInsight[];
  competitorAnalysis: CompetitorInsight[];
  bestPractices: BestPractice[];
  innovationOpportunities: Innovation[];
}

export interface DomainInsight {
  domain: string;
  conventions: string[];
  userExpectations: string[];
  commonPatterns: string[];
}

export interface CompetitorInsight {
  competitor: string;
  strengths: string[];
  weaknesses: string[];
  opportunityGaps: string[];
}

export interface BestPractice {
  practice: string;
  reasoning: string;
  implementation: string;
}

export interface Innovation {
  area: string;
  opportunity: string;
  implementation: string;
  risk: 'low' | 'medium' | 'high';
}

/**
 * DeepSeek R1 Service - Context Analyst & Icon Architect
 * Provides deep reasoning and analysis for intelligent icon generation
 */
export class DeepSeekAnalystService {
  private apiKey: string;
  private apiUrl = 'https://api-inference.huggingface.co/models/deepseek-ai/deepseek-r1-distill-llama-70b';

  constructor() {
    this.apiKey = import.meta.env.VITE_HUGGINGFACE_API_KEY;
    if (!this.apiKey) {
      throw new Error('DeepSeek R1 API key not configured');
    }
  }

  /**
   * Deep Context Analysis - The main intelligence function
   * Uses DeepSeek R1's reasoning capabilities to thoroughly understand the app
   */
  async analyzeAppContext(userInput: UserInput): Promise<DeepSeekAnalysis> {
    console.log('🧠 DeepSeek R1: Starting deep contextual analysis...');

    const analysisPrompt = this.createAnalysisPrompt(userInput);

    try {
      const response = await this.callDeepSeekAPI(analysisPrompt);
      const analysis = await this.parseAnalysisResponse(response);
      
      console.log('🎯 DeepSeek R1: Analysis complete -', {
        appType: analysis.appArchitecture.appType,
        totalIcons: analysis.iconRequirements.totalIconsNeeded,
        categories: analysis.iconRequirements.iconCategories.length
      });

      return analysis;
    } catch (error) {
      console.error('❌ DeepSeek R1 Analysis Error:', error);
      return this.getFallbackAnalysis(userInput);
    }
  }

  /**
   * Create comprehensive analysis prompt for DeepSeek R1
   */
  private createAnalysisPrompt(userInput: UserInput): string {
    return `
As an expert UX researcher, app architect, and icon designer, perform a comprehensive analysis of this application concept:

PROJECT: "${userInput.projectDescription}"
TYPE: ${userInput.projectType}
STYLE: ${userInput.stylePreference}
TARGET: ${userInput.targetAudience || 'general users'}
COLORS: ${userInput.colorScheme || 'not specified'}

DEEP ANALYSIS REQUIRED:

1. APP ARCHITECTURE ANALYSIS:
   - What is the core purpose and value proposition?
   - Who are the primary user personas and their goals?
   - What are the critical user journeys and touchpoints?
   - How should the information architecture be structured?
   - What are the essential features vs nice-to-have features?

2. ICON REQUIREMENTS PLANNING:
   - Systematically identify EVERY icon needed across all user flows
   - Categorize icons by function: navigation, actions, features, status, content
   - Determine semantic relationships between icons
   - Calculate total icons needed (be comprehensive, typically 15-30+ for full apps)
   - Prioritize icons by user impact and frequency of use

3. CONTEXTUAL DESIGN GUIDELINES:
   - What visual theme best serves the user goals and brand?
   - What color psychology applies to this domain?
   - What icon style (outlined/filled/rounded) fits the app personality?
   - What interaction patterns enhance the user experience?
   - How should icons communicate hierarchy and relationships?

4. DOMAIN EXPERTISE:
   - What are the conventions and expectations in this app domain?
   - What do users expect from similar applications?
   - What are the opportunities for innovation vs following standards?
   - What accessibility considerations are critical?

5. STRATEGIC RECOMMENDATIONS:
   - How can the icon system scale as the app grows?
   - What are the most critical icons for MVP vs future features?
   - How can icons support the business goals?
   - What technical constraints should influence the design?

RESPOND WITH STRUCTURED JSON:
{
  "appArchitecture": {
    "appType": "detailed classification",
    "coreValueProposition": "what problem does this solve",
    "userPersonas": [
      {
        "name": "Primary User Type",
        "description": "detailed description",
        "goals": ["goal1", "goal2"],
        "painPoints": ["pain1", "pain2"]
      }
    ],
    "coreFeatures": [
      {
        "name": "feature name",
        "description": "what it does",
        "priority": "critical|important|nice-to-have",
        "userActions": ["action1", "action2"],
        "requiredIcons": ["icon1", "icon2"]
      }
    ],
    "informationArchitecture": {
      "navigationStructure": [
        {
          "label": "section name",
          "iconType": "what kind of icon",
          "priority": 1,
          "children": []
        }
      ]
    }
  },
  "iconRequirements": {
    "totalIconsNeeded": 25,
    "iconCategories": [
      {
        "name": "Navigation",
        "count": 6,
        "purpose": "main app navigation",
        "examples": ["home", "search", "profile"],
        "designPriority": "high",
        "contextualMeaning": "why these specific icons"
      }
    ],
    "semanticRelationships": [
      {
        "primaryIcon": "create",
        "relatedIcons": ["edit", "save", "delete"],
        "relationship": "workflow",
        "visualConnection": "how they should look related"
      }
    ]
  },
  "designGuidelines": {
    "visualTheme": {
      "primary": "theme name",
      "mood": "professional/playful/minimal/etc",
      "personality": ["trait1", "trait2"]
    },
    "colorPalette": {
      "primary": ["#color1", "#color2"],
      "reasoning": "why these colors for this domain"
    },
    "iconStyle": {
      "styleFamily": "outlined|filled|rounded",
      "strokeWidth": 2,
      "visualWeight": "regular",
      "reasoning": "why this style serves the users"
    }
  },
  "contextualInsights": {
    "domainExpertise": [
      {
        "domain": "app category",
        "conventions": ["convention1", "convention2"],
        "userExpectations": ["expectation1", "expectation2"]
      }
    ],
    "bestPractices": [
      {
        "practice": "specific practice",
        "reasoning": "why it matters",
        "implementation": "how to apply"
      }
    ]
  }
}

IMPORTANT: Be comprehensive and specific. This analysis will guide the AI icon generation system.
`;
  }

  /**
   * Call DeepSeek R1 API through Hugging Face
   */
  private async callDeepSeekAPI(prompt: string): Promise<string> {
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 4000,
          temperature: 0.3, // Lower temperature for more focused analysis
          top_p: 0.9,
          repetition_penalty: 1.1,
          return_full_text: false
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API error: ${response.status} - ${response.statusText}`);
    }

    const result = await response.json();
    
    if (Array.isArray(result) && result[0]?.generated_text) {
      return result[0].generated_text;
    } else if (result.generated_text) {
      return result.generated_text;
    } else {
      throw new Error('Invalid response format from DeepSeek API');
    }
  }

  /**
   * Parse and validate the analysis response
   */
  private async parseAnalysisResponse(response: string): Promise<DeepSeekAnalysis> {
    try {
      // Extract JSON from response (DeepSeek might include reasoning before JSON)
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsedResponse = JSON.parse(jsonMatch[0]);
      
      // Validate and structure the response
      return {
        appArchitecture: this.validateAppArchitecture(parsedResponse.appArchitecture),
        iconRequirements: this.validateIconRequirements(parsedResponse.iconRequirements),
        designGuidelines: this.validateDesignGuidelines(parsedResponse.designGuidelines),
        contextualInsights: this.validateContextualInsights(parsedResponse.contextualInsights),
        success: true
      };
    } catch (error) {
      console.error('Response parsing error:', error);
      throw new Error(`Failed to parse DeepSeek analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Validation methods for each section
   */
  private validateAppArchitecture(data: any): AppArchitecture {
    return {
      appType: data?.appType || 'general application',
      userPersonas: data?.userPersonas || [],
      coreFeatures: data?.coreFeatures || [],
      userJourneys: data?.userJourneys || [],
      informationArchitecture: data?.informationArchitecture || { navigationStructure: [], contentCategories: [] }
    };
  }

  private validateIconRequirements(data: any): IconRequirements {
    return {
      totalIconsNeeded: data?.totalIconsNeeded || 15,
      iconCategories: data?.iconCategories || [],
      semanticRelationships: data?.semanticRelationships || [],
      stylisticGuidelines: data?.stylisticGuidelines || []
    };
  }

  private validateDesignGuidelines(data: any): DesignGuidelines {
    return {
      visualTheme: data?.visualTheme || { primary: 'modern', mood: 'professional', personality: [], visualCues: [] },
      colorPalette: data?.colorPalette || { primary: ['#3B82F6'], secondary: [], accent: [], semantic: { success: '#10B981', warning: '#F59E0B', error: '#EF4444', info: '#3B82F6', neutral: '#6B7280' }, reasoning: '' },
      iconStyle: data?.iconStyle || { styleFamily: 'outlined', strokeWidth: 2, cornerRadius: 4, visualWeight: 'regular', proportions: '1:1' },
      interactionPatterns: data?.interactionPatterns || []
    };
  }

  private validateContextualInsights(data: any): ContextualInsights {
    return {
      domainExpertise: data?.domainExpertise || [],
      competitorAnalysis: data?.competitorAnalysis || [],
      bestPractices: data?.bestPractices || [],
      innovationOpportunities: data?.innovationOpportunities || []
    };
  }

  /**
   * Fallback analysis if DeepSeek fails
   */
  private getFallbackAnalysis(userInput: UserInput): DeepSeekAnalysis {
    console.log('🔄 Using fallback analysis...');
    
    return {
      appArchitecture: {
        appType: userInput.projectType,
        userPersonas: [{ name: 'Primary User', description: 'Main app user', goals: ['accomplish tasks'], painPoints: ['complexity'] }],
        coreFeatures: [{ name: 'Core Feature', description: 'Main functionality', priority: 'critical', userActions: ['view', 'interact'], requiredIcons: ['home', 'settings'] }],
        userJourneys: [{ name: 'Main Journey', steps: [{ action: 'navigate', touchpoint: 'interface', iconNeeded: 'navigation', emotionalState: 'focused' }] }],
        informationArchitecture: { navigationStructure: [{ label: 'Home', iconType: 'home', priority: 1 }], contentCategories: [{ name: 'Main', iconFamily: 'interface', subCategories: [] }] }
      },
      iconRequirements: {
        totalIconsNeeded: 15,
        iconCategories: [{ name: 'Navigation', count: 5, purpose: 'main navigation', examples: ['home', 'search'], designPriority: 'high', contextualMeaning: 'essential for navigation' }],
        semanticRelationships: [{ primaryIcon: 'home', relatedIcons: ['menu'], relationship: 'hierarchy', visualConnection: 'consistent style' }],
        stylisticGuidelines: [{ category: 'navigation', visualStyle: userInput.stylePreference, colorRecommendation: userInput.colorScheme || 'blue', animationSuggestion: 'subtle hover', reasoning: 'user-specified preferences' }]
      },
      designGuidelines: {
        visualTheme: { primary: userInput.stylePreference, mood: 'professional', personality: ['clean', 'modern'], visualCues: ['minimal', 'clear'] },
        colorPalette: { primary: ['#3B82F6'], secondary: ['#8B5CF6'], accent: ['#10B981'], semantic: { success: '#10B981', warning: '#F59E0B', error: '#EF4444', info: '#3B82F6', neutral: '#6B7280' }, reasoning: 'balanced and accessible' },
        iconStyle: { styleFamily: 'outlined', strokeWidth: 2, cornerRadius: 4, visualWeight: 'regular', proportions: '1:1' },
        interactionPatterns: [{ trigger: 'hover', animation: 'subtle scale', feedback: 'visual', purpose: 'feedback' }]
      },
      contextualInsights: {
        domainExpertise: [{ domain: userInput.projectType, conventions: ['standard patterns'], userExpectations: ['familiar interactions'], commonPatterns: ['conventional layouts'] }],
        competitorAnalysis: [],
        bestPractices: [{ practice: 'consistent iconography', reasoning: 'user recognition', implementation: 'unified style system' }],
        innovationOpportunities: [{ area: 'interaction', opportunity: 'enhanced feedback', implementation: 'micro-animations', risk: 'low' }]
      },
      success: true
    };
  }
}

// Export the service instance
export const deepSeekAnalyst = new DeepSeekAnalystService();

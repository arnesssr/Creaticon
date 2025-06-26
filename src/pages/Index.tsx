import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Upload, Eye, Cpu } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PreviewPanel } from "@/components/generator/PreviewPanel";
import { IconGallery } from "@/components/generator/IconGallery";
import { LogoGallery } from "@/components/generator/LogoGallery";
import { PageGallery } from "@/components/generator/PageGallery";
import { CodeDisplay } from "@/components/generator/CodeDisplay";
import { DownloadPanel } from "@/components/generator/DownloadPanel";
import { useGeneration } from "@/hooks/useGeneration";
import { useProjectGeneration } from "@/hooks/useProjectGeneration";
import { getAvailableProviders, AIProvider } from "@/lib/aiService";

const Index = () => {
  const [projectDescription, setProjectDescription] = useState("");
  const [projectType, setProjectType] = useState("");
  const [stylePreference, setStylePreference] = useState("");
  const [colorScheme, setColorScheme] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('auto');

  const { generateUI, isGenerating, progress, result } = useGeneration();
  const { generateProject, isGenerating: isGeneratingProject, progress: projectProgress, result: projectResult } = useProjectGeneration();
  const availableProviders = getAvailableProviders();
  const [generationMode, setGenerationMode] = useState<'single' | 'complete'>('single');

  const handleGenerate = () => {
    if (generationMode === 'complete') {
      generateProject({
        projectDescription,
        projectType,
        stylePreference,
        colorScheme
      });
    } else {
      generateUI({
        projectDescription,
        projectType,
        stylePreference,
        colorScheme,
        provider: selectedProvider
      });
    }
  };

  const currentIsGenerating = generationMode === 'complete' ? isGeneratingProject : isGenerating;
  const currentProgress = generationMode === 'complete' ? projectProgress : progress;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            AI UI & Icon Generator
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Transform your ideas into beautiful, functional user interfaces with custom icons. 
            Powered by advanced AI to create stunning designs in seconds.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Input Panel */}
          <Card className="backdrop-blur-lg bg-white/10 border-white/20 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Project Configuration
              </CardTitle>
              <CardDescription className="text-gray-300">
                Describe your project and customize the generation settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Project Description</label>
                <Textarea
                  placeholder="Describe your project in detail... (e.g., 'A modern e-commerce dashboard with product management, analytics, and user profiles')"
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400 min-h-[100px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Project Type</label>
                <Select value={projectType} onValueChange={setProjectType}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select project type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="web-app">Web Application</SelectItem>
                    <SelectItem value="dashboard">Dashboard</SelectItem>
                    <SelectItem value="landing-page">Landing Page</SelectItem>
                    <SelectItem value="mobile-app">Mobile App UI</SelectItem>
                    <SelectItem value="e-commerce">E-commerce</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Style Preference</label>
                <Select value={stylePreference} onValueChange={setStylePreference}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Choose style" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="modern">Modern & Clean</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="corporate">Corporate</SelectItem>
                    <SelectItem value="creative">Creative & Bold</SelectItem>
                    <SelectItem value="glassmorphism">Glassmorphism</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Color Scheme</label>
                <Input
                  placeholder="e.g., blue and purple gradient"
                  value={colorScheme}
                  onChange={(e) => setColorScheme(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Generation Mode</label>
                <Select value={generationMode} onValueChange={(value: 'single' | 'complete') => setGenerationMode(value)}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select generation mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single Page UI</SelectItem>
                    <SelectItem value="complete">Complete Project (Multi-page + Logos)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">AI Provider</label>
                <Select value={selectedProvider} onValueChange={(value: AIProvider) => setSelectedProvider(value)}>
                  <SelectTrigger className="bg-white/10 border-white/20 text-white">
                    <SelectValue placeholder="Select AI provider" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProviders.map((provider) => (
                      <SelectItem key={provider.provider} value={provider.provider} disabled={!provider.available}>
                        <div className="flex items-center gap-2">
                          <Cpu className="h-4 w-4" />
                          {provider.name}
                          {!provider.available && (
                            <Badge variant="secondary" className="text-xs">
                              API Key Required
                            </Badge>
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {currentIsGenerating && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Generating {generationMode === 'complete' ? 'Complete Project' : 'UI'}...</span>
                    <span>{currentProgress}%</span>
                  </div>
                  <Progress value={currentProgress} className="h-2" />
                </div>
              )}

              <Button
                onClick={handleGenerate}
                disabled={currentIsGenerating || !projectDescription.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3"
              >
                {currentIsGenerating ? "Generating..." : (generationMode === 'complete' ? "Generate Complete Project" : "Generate UI & Icons")}
              </Button>
            </CardContent>
          </Card>

          {/* Preview Panel */}
          <Card className="backdrop-blur-lg bg-white/10 border-white/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Eye className="h-5 w-5" />
                Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PreviewPanel generatedHTML={result?.html || ""} />
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        {result && generationMode === 'single' && (
          <div className="mt-12 space-y-8">
            <Tabs defaultValue="icons" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-lg">
                <TabsTrigger value="icons" className="text-white data-[state=active]:bg-white/20">
                  Icons ({result.icons.length})
                </TabsTrigger>
                <TabsTrigger value="html" className="text-white data-[state=active]:bg-white/20">
                  HTML
                </TabsTrigger>
                <TabsTrigger value="css" className="text-white data-[state=active]:bg-white/20">
                  CSS
                </TabsTrigger>
                <TabsTrigger value="download" className="text-white data-[state=active]:bg-white/20">
                  Download
                </TabsTrigger>
              </TabsList>

              <TabsContent value="icons">
                <IconGallery icons={result.icons} />
              </TabsContent>

              <TabsContent value="html">
                <CodeDisplay code={result.html} language="html" />
              </TabsContent>

              <TabsContent value="css">
                <CodeDisplay code={result.css} language="css" />
              </TabsContent>

              <TabsContent value="download">
                <DownloadPanel generatedResult={result} />
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* Complete Project Results Section */}
        {projectResult && generationMode === 'complete' && (
          <div className="mt-12 space-y-8">
            <Tabs defaultValue="pages" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-lg">
                <TabsTrigger value="pages" className="text-white data-[state=active]:bg-white/20">
                  Pages ({projectResult.pages.length})
                </TabsTrigger>
                <TabsTrigger value="logos" className="text-white data-[state=active]:bg-white/20">
                  Logos ({projectResult.logos.length})
                </TabsTrigger>
                <TabsTrigger value="styles" className="text-white data-[state=active]:bg-white/20">
                  Global Styles
                </TabsTrigger>
                <TabsTrigger value="download" className="text-white data-[state=active]:bg-white/20">
                  Download Project
                </TabsTrigger>
              </TabsList>

              <TabsContent value="pages">
                <PageGallery pages={projectResult.pages} />
              </TabsContent>

              <TabsContent value="logos">
                <LogoGallery logos={projectResult.logos} />
              </TabsContent>

              <TabsContent value="styles">
                <CodeDisplay code={projectResult.globalCSS} language="css" />
              </TabsContent>

              <TabsContent value="download">
                <Card className="backdrop-blur-lg bg-white/10 border-white/20">
                  <CardHeader>
                    <CardTitle className="text-white">Download Complete Project</CardTitle>
                    <CardDescription className="text-gray-300">
                      Download all pages, logos, and assets as a complete project
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button 
                        onClick={() => {
                          // Download all pages
                          projectResult.pages.forEach(page => {
                            const fileName = `${page.name.toLowerCase().replace(/\s+/g, '-')}.html`;
                            const blob = new Blob([page.html], { type: 'text/html' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = fileName;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            URL.revokeObjectURL(url);
                          });
                        }}
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                      >
                        Download All Pages
                      </Button>
                      <Button 
                        onClick={() => {
                          // Download all logos
                          projectResult.logos.forEach(logo => {
                            const fileName = `${logo.name.toLowerCase().replace(/\s+/g, '-')}.svg`;
                            const blob = new Blob([logo.svg], { type: 'image/svg+xml' });
                            const url = URL.createObjectURL(blob);
                            const link = document.createElement('a');
                            link.href = url;
                            link.download = fileName;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);
                            URL.revokeObjectURL(url);
                          });
                        }}
                        className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white"
                      >
                        Download All Logos
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Index;

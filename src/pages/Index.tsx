
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Upload, Eye } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PreviewPanel } from "@/components/generator/PreviewPanel";
import { IconGallery } from "@/components/generator/IconGallery";
import { CodeDisplay } from "@/components/generator/CodeDisplay";
import { DownloadPanel } from "@/components/generator/DownloadPanel";
import { useGeneration } from "@/hooks/useGeneration";

const Index = () => {
  const [projectDescription, setProjectDescription] = useState("");
  const [projectType, setProjectType] = useState("");
  const [stylePreference, setStylePreference] = useState("");
  const [colorScheme, setColorScheme] = useState("");

  const { generateUI, isGenerating, progress, result } = useGeneration();

  const handleGenerate = () => {
    generateUI({
      projectDescription,
      projectType,
      stylePreference,
      colorScheme
    });
  };

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

              {isGenerating && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Generating...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !projectDescription.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3"
              >
                {isGenerating ? "Generating..." : "Generate UI & Icons"}
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
        {result && (
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
      </main>

      <Footer />
    </div>
  );
};

export default Index;

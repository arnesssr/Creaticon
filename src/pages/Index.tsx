
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { Download, Eye, Search, Upload } from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { PreviewPanel } from "@/components/generator/PreviewPanel";
import { IconGallery } from "@/components/generator/IconGallery";
import { CodeDisplay } from "@/components/generator/CodeDisplay";
import { DownloadPanel } from "@/components/generator/DownloadPanel";

interface GeneratedResult {
  html: string;
  css: string;
  javascript: string;
  icons: Array<{
    id: string;
    name: string;
    svg: string;
    category: string;
  }>;
}

const Index = () => {
  const [projectDescription, setProjectDescription] = useState("");
  const [projectType, setProjectType] = useState("");
  const [stylePreference, setStylePreference] = useState("");
  const [colorScheme, setColorScheme] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedResult, setGeneratedResult] = useState<GeneratedResult | null>(null);

  const handleGenerate = async () => {
    if (!projectDescription.trim()) {
      toast.error("Please enter a project description");
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    // Simulate generation process
    const steps = [
      "Analyzing project requirements...",
      "Generating UI components...",
      "Creating custom icons...",
      "Optimizing code structure...",
      "Finalizing output..."
    ];

    for (let i = 0; i < steps.length; i++) {
      toast.info(steps[i]);
      setProgress((i + 1) * 20);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Mock generated result
    const mockResult: GeneratedResult = {
      html: generateMockHTML(),
      css: generateMockCSS(),
      javascript: generateMockJS(),
      icons: generateMockIcons()
    };

    setGeneratedResult(mockResult);
    setIsGenerating(false);
    setProgress(100);
    toast.success("UI generated successfully!");
  };

  const generateMockHTML = () => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectDescription}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); padding: 20px; border-radius: 15px; margin-bottom: 30px; }
        .card { background: rgba(255,255,255,0.9); padding: 30px; border-radius: 15px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); margin-bottom: 20px; }
        .btn { background: linear-gradient(45deg, #667eea, #764ba2); color: white; padding: 12px 24px; border: none; border-radius: 8px; cursor: pointer; }
    </style>
</head>
<body>
    <div class="container">
        <header class="header">
            <h1>${projectDescription}</h1>
            <nav>
                <a href="#home">Home</a>
                <a href="#about">About</a>
                <a href="#contact">Contact</a>
            </nav>
        </header>
        <main class="card">
            <h2>Welcome to Your Generated UI</h2>
            <p>This is a beautiful, responsive interface generated specifically for your project.</p>
            <button class="btn">Get Started</button>
        </main>
    </div>
</body>
</html>`;

  const generateMockCSS = () => `/* Generated CSS for ${projectDescription} */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  background: rgba(255,255,255,0.1);
  backdrop-filter: blur(10px);
  padding: 20px;
  border-radius: 15px;
  margin-bottom: 30px;
}

.card {
  background: rgba(255,255,255,0.9);
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  margin-bottom: 20px;
}`;

  const generateMockJS = () => `// Generated JavaScript for ${projectDescription}
document.addEventListener('DOMContentLoaded', function() {
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
});`;

  const generateMockIcons = () => [
    {
      id: "icon-1",
      name: "Home",
      category: "Navigation",
      svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>`
    },
    {
      id: "icon-2",
      name: "User",
      category: "Profile",
      svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
    },
    {
      id: "icon-3",
      name: "Settings",
      category: "Control",
      svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m17-4a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM8 21a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/></svg>`
    },
    {
      id: "icon-4",
      name: "Search",
      category: "Action",
      svg: `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>`
    }
  ];

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
                disabled={isGenerating}
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
              <PreviewPanel generatedHTML={generatedResult?.html || ""} />
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        {generatedResult && (
          <div className="mt-12 space-y-8">
            <Tabs defaultValue="icons" className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-lg">
                <TabsTrigger value="icons" className="text-white data-[state=active]:bg-white/20">
                  Icons ({generatedResult.icons.length})
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
                <IconGallery icons={generatedResult.icons} />
              </TabsContent>

              <TabsContent value="html">
                <CodeDisplay code={generatedResult.html} language="html" />
              </TabsContent>

              <TabsContent value="css">
                <CodeDisplay code={generatedResult.css} language="css" />
              </TabsContent>

              <TabsContent value="download">
                <DownloadPanel generatedResult={generatedResult} />
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

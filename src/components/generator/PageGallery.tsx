import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Download, Eye, Globe, Code } from 'lucide-react';
import { toast } from 'sonner';
import { CodeDisplay } from './CodeDisplay';

interface PageDefinition {
  name: string;
  path: string;
  html: string;
  description: string;
}

interface PageGalleryProps {
  pages: PageDefinition[];
}

export const PageGallery: React.FC<PageGalleryProps> = ({ pages }) => {
  const [selectedPage, setSelectedPage] = useState<PageDefinition | null>(pages[0] || null);

  const copyToClipboard = async (html: string, pageName: string) => {
    try {
      await navigator.clipboard.writeText(html);
      toast.success(`${pageName} HTML copied to clipboard!`);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const downloadPage = (html: string, pageName: string) => {
    const fileName = `${pageName.toLowerCase().replace(/\s+/g, '-')}.html`;
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success(`${pageName} downloaded as HTML!`);
  };

  const downloadAllPages = () => {
    pages.forEach(page => {
      setTimeout(() => downloadPage(page.html, page.name), 100);
    });
    toast.success('All pages downloaded!');
  };

  if (pages.length === 0) {
    return (
      <Card className="backdrop-blur-lg bg-white/10 border-white/20">
        <CardContent className="text-center py-12">
          <Globe className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-300">No pages generated yet. Generate a complete project to see multiple pages.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Navigation */}
      <Card className="backdrop-blur-lg bg-white/10 border-white/20">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Project Pages ({pages.length})
          </CardTitle>
          <CardDescription className="text-gray-300">
            Navigate through all generated pages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {pages.map((page, index) => (
              <Button
                key={index}
                variant={selectedPage?.name === page.name ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedPage(page)}
                className={`${
                  selectedPage?.name === page.name 
                    ? "bg-blue-600 hover:bg-blue-700" 
                    : "bg-white/10 border-white/20 text-white hover:bg-white/20"
                }`}
              >
                {page.name}
                <Badge variant="secondary" className="ml-2 text-xs">
                  {page.path}
                </Badge>
              </Button>
            ))}
          </div>
          <Button
            onClick={downloadAllPages}
            className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white"
          >
            <Download className="h-4 w-4 mr-2" />
            Download All Pages
          </Button>
        </CardContent>
      </Card>

      {/* Selected Page Display */}
      {selectedPage && (
        <Card className="backdrop-blur-lg bg-white/10 border-white/20">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Eye className="h-5 w-5" />
              {selectedPage.name}
            </CardTitle>
            <CardDescription className="text-gray-300">
              {selectedPage.description} • Path: {selectedPage.path}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="preview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-lg">
                <TabsTrigger value="preview" className="text-white data-[state=active]:bg-white/20">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </TabsTrigger>
                <TabsTrigger value="code" className="text-white data-[state=active]:bg-white/20">
                  <Code className="h-4 w-4 mr-2" />
                  HTML Code
                </TabsTrigger>
                <TabsTrigger value="actions" className="text-white data-[state=active]:bg-white/20">
                  <Download className="h-4 w-4 mr-2" />
                  Actions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="preview" className="mt-6">
                <div className="bg-white rounded-lg p-4">
                  <iframe
                    srcDoc={selectedPage.html}
                    className="w-full h-96 border-0 rounded"
                    title={`${selectedPage.name} Preview`}
                    sandbox="allow-scripts allow-same-origin"
                  />
                </div>
              </TabsContent>

              <TabsContent value="code" className="mt-6">
                <CodeDisplay code={selectedPage.html} language="html" />
              </TabsContent>

              <TabsContent value="actions" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => copyToClipboard(selectedPage.html, selectedPage.name)}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 border"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy HTML Code
                  </Button>
                  <Button
                    onClick={() => downloadPage(selectedPage.html, selectedPage.name)}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 border"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download HTML File
                  </Button>
                  <Button
                    onClick={() => {
                      const newWindow = window.open('', '_blank');
                      if (newWindow) {
                        newWindow.document.write(selectedPage.html);
                        newWindow.document.close();
                      }
                    }}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20 border"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Open in New Tab
                  </Button>
                  <Button
                    onClick={() => {
                      toast.info('Website deployment feature coming soon!');
                    }}
                    className="bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Deploy Website
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

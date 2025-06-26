
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";

interface CodeDisplayProps {
  code: string;
  language: string;
}

export const CodeDisplay = ({ code, language }: CodeDisplayProps) => {
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success(`${language.toUpperCase()} code copied to clipboard`);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCode = () => {
    const extension = language === 'javascript' ? 'js' : language;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generated.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${language.toUpperCase()} file`);
  };

  return (
    <Card className="backdrop-blur-lg bg-white/10 border-white/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white capitalize">{language} Code</CardTitle>
          <div className="flex gap-2">
            <Button
              onClick={copyCode}
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
            >
              {copied ? "Copied!" : "Copy"}
            </Button>
            <Button
              onClick={downloadCode}
              size="sm"
              className="bg-blue-500 hover:bg-blue-600"
            >
              Download
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="relative">
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
            <code className={`language-${language}`}>
              {code}
            </code>
          </pre>
          
          <div className="absolute top-2 right-2">
            <span className="bg-gray-700 text-gray-300 px-2 py-1 rounded text-xs">
              {language.toUpperCase()}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

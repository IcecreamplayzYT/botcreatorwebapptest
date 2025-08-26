import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Code, Copy, Download, Play } from "lucide-react";
import { toast } from "sonner";

interface CodeEditorProps {
  initialCode?: string;
  onCodeChange?: (code: string) => void;
  readOnly?: boolean;
}

const CodeEditor = ({ initialCode = "", onCodeChange, readOnly = false }: CodeEditorProps) => {
  const [code, setCode] = useState(initialCode);

  const handleCodeChange = (newCode: string) => {
    setCode(newCode);
    onCodeChange?.(newCode);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    toast.success("Code copied to clipboard!");
  };

  const generateBoilerplate = () => {
    const boilerplate = `const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('example')
    .setDescription('Example command description'),
  async execute(interaction) {
    // Add your command logic here
    await interaction.reply({ content: 'Hello from ServerSpark!', ephemeral: true });
  }
};`;
    
    handleCodeChange(boilerplate);
    toast.success("Boilerplate code generated!");
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              Code Editor
            </CardTitle>
            <CardDescription>
              {readOnly ? "Preview the generated command code" : "Edit your command code manually"}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {!readOnly && (
              <Button variant="outline" size="sm" onClick={generateBoilerplate}>
                <Play className="w-4 h-4 mr-2" />
                Boilerplate
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={copyCode}>
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Badge variant="secondary" className="text-xs">
            Discord.js v14+
          </Badge>
          <Badge variant="secondary" className="text-xs">
            JavaScript
          </Badge>
          {readOnly && (
            <Badge variant="secondary" className="text-xs">
              Read Only
            </Badge>
          )}
        </div>
        
        <Textarea
          value={code}
          onChange={(e) => handleCodeChange(e.target.value)}
          readOnly={readOnly}
          className="font-mono text-sm min-h-[400px] resize-none"
          placeholder={readOnly ? "Generated code will appear here..." : "Enter your Discord.js command code here..."}
        />
        
        <div className="text-xs text-muted-foreground">
          {code.split('\n').length} lines • {code.length} characters
        </div>
      </CardContent>
    </Card>
  );
};

export default CodeEditor;
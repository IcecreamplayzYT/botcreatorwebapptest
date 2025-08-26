import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Loader2, Wand2, CheckCircle, AlertCircle, Copy, Code } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AIHelperProps {
  onCommandGenerated?: (command: any) => void;
  onCodeValidated?: (result: any) => void;
  currentCode?: string;
}

const AIHelper = ({ onCommandGenerated, onCodeValidated, currentCode }: AIHelperProps) => {
  const [description, setDescription] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState("");
  const [validationResult, setValidationResult] = useState<any>(null);

  const generateCommand = async () => {
    if (!description.trim()) {
      toast.error("Please describe what you want your command to do");
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-generate-command', {
        body: { description: description.trim() }
      });

      if (error) {
        console.error('Generation error:', error);
        toast.error("Failed to generate command. Please try again.");
        return;
      }

      if (data?.code && data?.command) {
        setGeneratedCode(data.code);
        onCommandGenerated?.(data.command);
        toast.success("Command generated successfully!");
      } else {
        toast.error("Invalid response from AI service");
      }
    } catch (error) {
      console.error('Error generating command:', error);
      toast.error("An error occurred while generating the command");
    } finally {
      setIsGenerating(false);
    }
  };

  const validateCode = async () => {
    const codeToValidate = currentCode || generatedCode;
    if (!codeToValidate.trim()) {
      toast.error("No code to validate");
      return;
    }

    setIsValidating(true);
    try {
      const { data, error } = await supabase.functions.invoke('ai-validate-command', {
        body: { code: codeToValidate }
      });

      if (error) {
        console.error('Validation error:', error);
        toast.error("Failed to validate code. Please try again.");
        return;
      }

      if (data) {
        setValidationResult(data);
        onCodeValidated?.(data);
        
        if (data.isValid) {
          toast.success("Code validation passed!");
        } else {
          toast.error(`Found ${data.errors?.length || 0} issues in the code`);
        }
      }
    } catch (error) {
      console.error('Error validating code:', error);
      toast.error("An error occurred while validating the code");
    } finally {
      setIsValidating(false);
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(generatedCode);
    toast.success("Code copied to clipboard!");
  };

  return (
    <div className="space-y-4">
      {/* Command Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5" />
            AI Command Generator
          </CardTitle>
          <CardDescription>
            Describe your command and let AI generate the Discord.js code structure
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Example: Create a mute command with user and duration options..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-[80px]"
          />
          <Button 
            onClick={generateCommand} 
            disabled={isGenerating || !description.trim()}
            className="w-full gap-2"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                Generate Command
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Code Preview */}
      {generatedCode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              Generated Code
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copyCode}>
                <Copy className="w-4 h-4 mr-2" />
                Copy
              </Button>
              <Button variant="outline" size="sm" onClick={validateCode} disabled={isValidating}>
                {isValidating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4 mr-2" />
                )}
                Validate
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
              <code>{generatedCode}</code>
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Code Validator */}
      {(currentCode || generatedCode) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Code Validator
            </CardTitle>
            <CardDescription>
              Check your command code for errors and get improvement suggestions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={validateCode} 
              disabled={isValidating}
              variant="outline"
              className="w-full gap-2"
            >
              {isValidating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Validating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Validate Current Code
                </>
              )}
            </Button>

            {/* Validation Results */}
            {validationResult && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {validationResult.isValid ? (
                    <Badge className="bg-action text-action-foreground">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Valid
                    </Badge>
                  ) : (
                    <Badge className="bg-error text-error-foreground">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Issues Found
                    </Badge>
                  )}
                </div>

                {validationResult.errors && validationResult.errors.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Errors:</h4>
                    <ul className="space-y-1 text-sm">
                      {validationResult.errors.map((error: string, index: number) => (
                        <li key={index} className="text-destructive flex items-start gap-2">
                          <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {validationResult.suggestions && validationResult.suggestions.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Suggestions:</h4>
                    <ul className="space-y-1 text-sm">
                      {validationResult.suggestions.map((suggestion: string, index: number) => (
                        <li key={index} className="text-muted-foreground flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AIHelper;
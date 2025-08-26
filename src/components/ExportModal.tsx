import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Download, FileCode, Loader2, Package, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  botId: string;
  botName: string;
}

const ExportModal = ({ isOpen, onClose, botId, botName }: ExportModalProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportedFiles, setExportedFiles] = useState<{ [key: string]: string } | null>(null);

  const handleExport = async () => {
    setIsExporting(true);
    setExportProgress(10);

    try {
      // Call the export function
      setExportProgress(30);
      const { data, error } = await supabase.functions.invoke('export-bot-zip', {
        body: { botId }
      });

      if (error) {
        console.error('Export error:', error);
        toast.error("Failed to export bot. Please try again.");
        return;
      }

      setExportProgress(70);
      
      if (data?.files) {
        setExportedFiles(data.files);
        setExportProgress(100);
        
        // Create and download ZIP
        await createAndDownloadZip(data.files, data.botName || botName);
        toast.success("Bot exported successfully!");
      } else {
        throw new Error("Invalid export response");
      }
    } catch (error) {
      console.error('Export error:', error);
      toast.error("An error occurred during export");
    } finally {
      setIsExporting(false);
      setTimeout(() => setExportProgress(0), 1000);
    }
  };

  const createAndDownloadZip = async (files: { [key: string]: string }, fileName: string) => {
    // Dynamic import JSZip for client-side zip creation
    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    // Add all files to zip
    Object.entries(files).forEach(([filePath, content]) => {
      zip.file(filePath, content);
    });

    // Generate zip and download
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${fileName.toLowerCase().replace(/[^a-z0-9-]/g, '-')}-bot.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getFileCount = () => {
    return exportedFiles ? Object.keys(exportedFiles).length : 0;
  };

  const getFilesByType = (extension: string) => {
    if (!exportedFiles) return [];
    return Object.keys(exportedFiles).filter(path => path.endsWith(extension));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Export Discord Bot
          </DialogTitle>
          <DialogDescription>
            Generate and download a complete Discord.js project ready to run locally or on a VPS.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Options */}
          <div className="space-y-4">
            <h3 className="font-semibold">What's Included:</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <FileCode className="w-4 h-4 text-primary" />
                <span className="text-sm">Discord.js v14 Code</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Package className="w-4 h-4 text-primary" />
                <span className="text-sm">Package.json</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <CheckCircle className="w-4 h-4 text-primary" />
                <span className="text-sm">Deploy Scripts</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <FileCode className="w-4 h-4 text-primary" />
                <span className="text-sm">Environment Setup</span>
              </div>
            </div>
          </div>

          {/* Progress */}
          {isExporting && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Generating files...</span>
                <span className="text-sm text-muted-foreground">{exportProgress}%</span>
              </div>
              <Progress value={exportProgress} className="w-full" />
            </div>
          )}

          {/* Export Results */}
          {exportedFiles && !isExporting && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="w-5 h-5" />
                <span className="font-semibold">Export Complete!</span>
              </div>
              
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <h4 className="font-medium">Generated Files ({getFileCount()}):</h4>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <Badge variant="secondary">
                    {getFilesByType('.js').length} JavaScript files
                  </Badge>
                  <Badge variant="secondary">
                    {getFilesByType('.json').length} Config files
                  </Badge>
                  <Badge variant="secondary">
                    {getFilesByType('.md').length} Documentation
                  </Badge>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Next Steps:</p>
                    <ol className="text-blue-800 dark:text-blue-200 space-y-1 list-decimal list-inside">
                      <li>Extract the ZIP file</li>
                      <li>Run <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">npm install</code></li>
                      <li>Copy <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">.env.example</code> to <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">.env</code></li>
                      <li>Add your Discord bot token to <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">.env</code></li>
                      <li>Run <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">npm run deploy</code> to register commands</li>
                      <li>Run <code className="bg-blue-100 dark:bg-blue-900 px-1 rounded">npm start</code> to launch your bot</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button 
            onClick={handleExport} 
            disabled={isExporting}
            className="gap-2"
          >
            {isExporting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Exporting...
              </>
            ) : exportedFiles ? (
              <>
                <Download className="w-4 h-4" />
                Download Again
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                Export Bot
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExportModal;
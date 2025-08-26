import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  Save, 
  Play, 
  Code, 
  Download,
  Search,
  Zap,
  MessageSquare,
  Shield,
  Settings,
  Plus,
  ArrowLeft
} from "lucide-react";
import Header from "@/components/Header";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const CommandBuilder = () => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const navigate = useNavigate();

  const nodeCategories = [
    {
      title: "Triggers",
      color: "bg-trigger",
      items: [
        { name: "Slash Command", icon: Zap },
        { name: "User Context Menu", icon: MessageSquare },
        { name: "Message Context Menu", icon: MessageSquare }
      ]
    },
    {
      title: "Options", 
      color: "bg-option",
      items: [
        { name: "String", icon: MessageSquare },
        { name: "Integer", icon: MessageSquare },
        { name: "Boolean", icon: MessageSquare },
        { name: "User", icon: MessageSquare },
        { name: "Channel", icon: MessageSquare },
        { name: "Role", icon: MessageSquare }
      ]
    },
    {
      title: "Conditions",
      color: "bg-condition", 
      items: [
        { name: "Permission Check", icon: Shield },
        { name: "Role Check", icon: Shield },
        { name: "Channel Type Check", icon: Shield }
      ]
    },
    {
      title: "Actions",
      color: "bg-action",
      items: [
        { name: "Reply", icon: MessageSquare },
        { name: "Embed Reply", icon: MessageSquare },
        { name: "Add Role", icon: Settings },
        { name: "Remove Role", icon: Settings }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex h-[calc(100vh-4rem)]">
        {/* Left Sidebar - Node Library */}
        <div className="w-80 border-r border-border bg-surface p-4 overflow-y-auto custom-scrollbar">
          <div className="space-y-1 mb-4">
            <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </Button>
            <h2 className="font-semibold text-lg">Command Builder</h2>
            <p className="text-sm text-muted-foreground">Drag blocks to build your command</p>
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input placeholder="Search blocks..." className="pl-9" />
          </div>

          <div className="space-y-4">
            {nodeCategories.map((category) => (
              <div key={category.title}>
                <h3 className="text-sm font-medium mb-2 text-muted-foreground uppercase tracking-wide">
                  {category.title}
                </h3>
                <div className="space-y-1">
                  {category.items.map((item) => (
                    <Card 
                      key={item.name}
                      className="p-3 cursor-grab hover:shadow-md transition-all border-l-4"
                      style={{ borderLeftColor: `hsl(var(--${category.color.replace('bg-', '')}))` }}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded ${category.color} flex items-center justify-center`}>
                          <item.icon className="w-3 h-3 text-white" />
                        </div>
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Main Canvas */}
        <div className="flex-1 relative bg-surface">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          
          {/* Canvas Toolbar */}
          <div className="absolute top-4 left-4 right-4 z-10">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Save className="w-4 h-4" />
                  Save
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Play className="w-4 h-4" />
                  Preview
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Code className="w-4 h-4" />
                  Generate Code
                </Button>
              </div>
              <Button className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Canvas Content */}
          <div className="absolute inset-0 pt-20 p-4">
            <div className="w-full h-full flex items-center justify-center">
              <Card className="p-8 text-center max-w-md">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-semibold mb-2">Start Building</h3>
                <p className="text-muted-foreground mb-4">
                  Drag a Trigger block from the sidebar to begin creating your command.
                </p>
                <Button variant="outline" className="gap-2">
                  <Zap className="w-4 h-4" />
                  Add Slash Command
                </Button>
              </Card>
            </div>
          </div>

          {/* Minimap */}
          <div className="absolute bottom-4 right-4 w-48 h-32 bg-card border border-border rounded-lg p-2">
            <div className="text-xs text-muted-foreground mb-1">Minimap</div>
            <div className="w-full h-full bg-muted rounded"></div>
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-80 border-l border-border bg-surface p-4 overflow-y-auto custom-scrollbar">
          <h2 className="font-semibold text-lg mb-4">Properties</h2>
          
          {!selectedNode ? (
            <div className="text-center py-8">
              <Settings className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                Select a node to edit its properties
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <Label htmlFor="command-name">Command Name</Label>
                <Input id="command-name" placeholder="ping" />
              </div>
              <div>
                <Label htmlFor="command-description">Description</Label>
                <Input id="command-description" placeholder="Replies with pong!" />
              </div>
              <Separator />
              <div>
                <Label>Permissions</Label>
                <div className="mt-2 space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">DM Permission</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">NSFW Only</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandBuilder;
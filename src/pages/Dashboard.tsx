import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Settings, Download, Edit, Copy, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Header from "@/components/Header";
import ExportModal from "@/components/ExportModal";

const Dashboard = () => {
  const navigate = useNavigate();
  const [exportModal, setExportModal] = useState<{ isOpen: boolean; botId: string; botName: string }>({
    isOpen: false,
    botId: '',
    botName: ''
  });
  
  // Mock data for demonstration
  const bots = [
    {
      id: "bot-1",
      name: "ModBot Pro",
      avatar: "MB",
      description: "Advanced moderation bot with auto-ban and message filtering",
      lastEdited: "2 hours ago",
      commands: 12,
      events: 5
    },
    {
      id: "bot-2",
      name: "WelcomeHelper", 
      avatar: "WH",
      description: "Welcome messages and auto-role assignment for new members",
      lastEdited: "1 day ago",
      commands: 3,
      events: 2
    }
  ];

  const handleExportBot = (botId: string, botName: string) => {
    setExportModal({ isOpen: true, botId, botName });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">My Bots</h1>
            <p className="text-muted-foreground">Create and manage your Discord bots</p>
          </div>
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            Create New Bot
          </Button>
        </div>

        {/* Bots Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Create New Bot Card */}
          <Card className="border-dashed border-2 hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="flex flex-col items-center justify-center h-48 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Plus className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold mb-2">Create New Bot</h3>
              <p className="text-sm text-muted-foreground">Start building your Discord bot from scratch</p>
            </CardContent>
          </Card>

          {/* Existing Bots */}
          {bots.map((bot) => (
            <Card key={bot.id} className="hover:shadow-lg transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                      <span className="text-primary-foreground font-bold">{bot.avatar}</span>
                    </div>
                    <div>
                      <CardTitle className="text-lg">{bot.name}</CardTitle>
                      <CardDescription className="text-xs">Last edited: {bot.lastEdited}</CardDescription>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="w-8 h-8 p-0">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">{bot.description}</p>
                
                <div className="flex gap-4 text-sm">
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">{bot.commands}</strong> Commands
                  </span>
                  <span className="text-muted-foreground">
                    <strong className="text-foreground">{bot.events}</strong> Events
                  </span>
                </div>

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 gap-2"
                    onClick={() => navigate('/builder/commands')}
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="gap-2"
                    onClick={() => handleExportBot(bot.id, bot.name)}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2 text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Bots</CardDescription>
              <CardTitle className="text-2xl">2</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Commands Created</CardDescription>
              <CardTitle className="text-2xl">15</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Last Export</CardDescription>
              <CardTitle className="text-2xl">2d ago</CardTitle>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Export Modal */}
      <ExportModal
        isOpen={exportModal.isOpen}
        onClose={() => setExportModal({ isOpen: false, botId: '', botName: '' })}
        botId={exportModal.botId}
        botName={exportModal.botName}
      />
    </div>
  );
};

export default Dashboard;

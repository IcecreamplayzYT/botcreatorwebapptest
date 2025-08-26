import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Puzzle, 
  Slash, 
  Calendar, 
  Heart, 
  MessageSquare, 
  Download,
  Blocks,
  Bot,
  Settings,
  Zap
} from "lucide-react";

const features = [
  {
    icon: Blocks,
    title: "Drag & Drop Builder",
    description: "Visual flow editor with no-code command creation. Build complex bot logic with simple drag and drop.",
    color: "bg-trigger"
  },
  {
    icon: Slash,
    title: "Slash Commands",
    description: "Full Discord.js v14 support with slash commands, context menus, and advanced interaction handling.",
    color: "bg-option"
  },
  {
    icon: Calendar,
    title: "Event System", 
    description: "Handle Discord events like member joins, message reactions, and voice state changes with ease.",
    color: "bg-condition"
  },
  {
    icon: Heart,
    title: "Reaction Roles",
    description: "Automated role assignment with emoji reactions. Perfect for community management and engagement.",
    color: "bg-action"
  },
  {
    icon: MessageSquare,
    title: "Embed Builder",
    description: "Create rich, beautiful embeds with images, fields, and custom formatting using our WYSIWYG editor.",
    color: "bg-trigger"
  },
  {
    icon: Download,
    title: "Export to ZIP",
    description: "Download complete Discord.js projects ready to run. No hosting required - deploy anywhere you want.",
    color: "bg-option"
  },
  {
    icon: Bot,
    title: "AI Assistant",
    description: "Smart command generation from natural language. Describe what you want and let AI build it for you.",
    color: "bg-condition"
  },
  {
    icon: Settings,
    title: "Environment Manager",
    description: "Secure token and API key management with Supabase integration. Never expose secrets in your code.",
    color: "bg-action"
  },
  {
    icon: Zap,
    title: "Module System",
    description: "Pre-built packages for moderation, economy, leveling, and more. Enable features with one click.",
    color: "bg-trigger"
  }
];

const FeaturesPreview = () => {
  return (
    <section className="py-20 px-4 bg-surface" id="features">
      <div className="container mx-auto max-w-7xl">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-4xl font-bold">
            Everything You Need to Build Amazing Bots
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From simple commands to complex workflows, ServerSpark provides all the tools to create professional Discord bots without writing code.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-border hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
              <CardHeader className="pb-3">
                <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center mb-3`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesPreview;
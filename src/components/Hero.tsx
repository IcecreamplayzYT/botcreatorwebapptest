import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Code2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="relative py-20 px-4 bg-hero-gradient">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-accent/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto max-w-6xl relative z-10">
        <div className="text-center space-y-8">
          {/* Main heading */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              ServerSpark Test — Build Discord Bots{" "}
              <span className="text-primary">Without Code</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Drag, drop, and export your custom Discord bot in minutes. No coding, no hosting — just download and run.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 h-auto group"
              onClick={() => navigate('/dashboard')}
            >
              <Zap className="w-5 h-5 mr-2" />
              Login with Discord
              <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-6 h-auto"
              onClick={() => navigate('/builder/commands')}
            >
              <Code2 className="w-5 h-5 mr-2" />
              Try Demo
            </Button>
          </div>

          {/* Trust indicators */}
          <div className="pt-8 border-t border-border/50">
            <p className="text-sm text-muted-foreground">
              Used by creators worldwide • Millions of commands assembled
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
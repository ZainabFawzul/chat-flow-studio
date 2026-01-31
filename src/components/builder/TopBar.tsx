import { Download, Upload, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useScenario } from "@/context/ScenarioContext";
import { useRef } from "react";
import { ScenarioData } from "@/types/scenario";
import { useToast } from "@/hooks/use-toast";

export function TopBar() {
  const { scenario, importScenario } = useScenario();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(scenario, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${scenario.name.replace(/\s+/g, "-").toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Exported successfully",
      description: "Your scenario has been downloaded as JSON.",
    });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string) as ScenarioData;
        
        // Basic validation
        if (!data.id || !data.theme || !data.messages) {
          throw new Error("Invalid scenario file format");
        }
        
        importScenario(data);
        toast({
          title: "Imported successfully",
          description: `Loaded scenario: ${data.name}`,
        });
      } catch (error) {
        toast({
          title: "Import failed",
          description: "The file is not a valid scenario JSON.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    
    // Reset input so same file can be selected again
    e.target.value = "";
  };

  return (
    <header className="flex h-14 items-center justify-between border-b border-border bg-card px-lg" role="banner">
      <div className="flex items-center gap-sm">
        <MessageSquare className="h-6 w-6 text-primary" aria-hidden="true" />
        <h1 className="text-heading-md text-foreground">Chat Scenario Builder</h1>
      </div>
      
      <nav className="flex items-center gap-sm" aria-label="Main actions">
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="sr-only"
          onChange={handleFileChange}
          aria-label="Import scenario file"
        />
        
        <Button
          variant="outline"
          size="sm"
          onClick={handleImportClick}
          className="gap-xs"
        >
          <Upload className="h-4 w-4" aria-hidden="true" />
          <span>Import</span>
        </Button>
        
        <Button
          variant="default"
          size="sm"
          onClick={handleExportJSON}
          className="gap-xs"
        >
          <Download className="h-4 w-4" aria-hidden="true" />
          <span>Export</span>
        </Button>
      </nav>
    </header>
  );
}

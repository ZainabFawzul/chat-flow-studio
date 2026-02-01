/**
 * @file TopBar.tsx
 * @description Header bar with app branding, import/export JSON buttons, and finalize ZIP dialog
 * 
 * @dependencies ScenarioContext, exportZip, UI components
 * @usage Rendered in BuilderLayout header
 */

import { Download, Upload, Package } from "lucide-react";
import chatScenarioIcon from "@/assets/chatscenario.png";
import { Button } from "@/components/ui/button";
import { useScenario } from "@/context/ScenarioContext";
import { useRef, useState } from "react";
import { ScenarioData } from "@/types/scenario";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { generateExportZip } from "@/lib/exportZip";
export function TopBar() {
  const {
    scenario,
    importScenario
  } = useScenario();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    toast
  } = useToast();
  const [isFinalizeDialogOpen, setIsFinalizeDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const handleExportJSON = () => {
    const dataStr = JSON.stringify(scenario, null, 2);
    const blob = new Blob([dataStr], {
      type: "application/json"
    });
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
      description: "Your scenario has been downloaded as JSON."
    });
  };
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = event => {
      try {
        const data = JSON.parse(event.target?.result as string) as ScenarioData;

        // Basic validation
        if (!data.id || !data.theme || !data.messages) {
          throw new Error("Invalid scenario file format");
        }
        importScenario(data);
        toast({
          title: "Imported successfully",
          description: `Loaded scenario: ${data.name}`
        });
      } catch (error) {
        toast({
          title: "Import failed",
          description: "The file is not a valid scenario JSON.",
          variant: "destructive"
        });
      }
    };
    reader.readAsText(file);

    // Reset input so same file can be selected again
    e.target.value = "";
  };
  const handleFinalize = async () => {
    setIsExporting(true);
    try {
      const zipBlob = await generateExportZip(scenario);

      // Download the zip file
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${scenario.name.replace(/\s+/g, "-").toLowerCase()}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({
        title: "Export complete",
        description: "Your chat scenario has been downloaded as a ZIP file."
      });
      setIsFinalizeDialogOpen(false);
    } catch (error) {
      toast({
        title: "Export failed",
        description: "There was an error creating the ZIP file.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };
  return <>
      <header className="flex h-16 items-center justify-between border-b border-border/50 bg-card/80 backdrop-blur-xl px-6">
        <div className="flex items-center gap-3">
          <img src={chatScenarioIcon} alt="Chat Scenario" className="h-10 w-10 object-contain" />
          <div>
            <h1 className="text-lg font-semibold text-foreground tracking-tight">Branching Chat Builder</h1>
            <p className="text-xs text-muted-foreground">Design branching conversations and export as ZIP.</p>
          </div>
        </div>
        
        <nav className="flex items-center gap-3" aria-label="Main actions">
          <input ref={fileInputRef} type="file" accept=".json" className="sr-only" onChange={handleFileChange} aria-label="Import scenario file" />
          
          <Button variant="secondary" size="sm" onClick={handleImportClick} className="gap-2 rounded-xl">
            <Upload className="h-4 w-4" aria-hidden="true" />
            <span>Import</span>
          </Button>
          
          <Button variant="secondary" size="sm" onClick={handleExportJSON} className="gap-2 rounded-xl">
            <Download className="h-4 w-4" aria-hidden="true" />
            <span>Export</span>
          </Button>
          
          <Button variant="default" size="sm" onClick={() => setIsFinalizeDialogOpen(true)} className="gap-2 rounded-xl shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all">
            <Package className="h-4 w-4" aria-hidden="true" />
            <span>Finalize</span>
          </Button>
        </nav>
      </header>

      <Dialog open={isFinalizeDialogOpen} onOpenChange={setIsFinalizeDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>Finalize Chat Scenario</DialogTitle>
            <DialogDescription>
              Do you want to download your chat scenario as a zipped folder? This package can be uploaded to Articulate Rise and similar authoring tools with an embed code feature.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="secondary" onClick={() => setIsFinalizeDialogOpen(false)} className="rounded-xl" disabled={isExporting}>
              No, cancel
            </Button>
            <Button onClick={handleFinalize} className="rounded-xl" disabled={isExporting}>
              {isExporting ? "Creating..." : "Yes, download ZIP"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>;
}
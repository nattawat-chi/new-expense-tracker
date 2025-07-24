import { Button } from "@/components/ui";
import { Download } from "lucide-react";

export function ExportButton({ onExport }: { onExport: () => void }) {
  return (
    <Button variant="outline" onClick={onExport}>
      <Download className="h-4 w-4 mr-2" />
      ส่งออก
    </Button>
  );
}

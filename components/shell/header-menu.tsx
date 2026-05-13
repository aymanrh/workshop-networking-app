"use client";

import * as React from "react";
import { toast } from "sonner";
import { Database, Download, MoreHorizontal, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ImportConfirmDialog } from "@/components/io/import-confirm-dialog";
import { loadSeed } from "@/lib/seed/load-seed";
import {
  exportData,
  exportFilename,
  triggerDownload,
} from "@/lib/io/export";
import { currentCounts } from "@/lib/io/import";

export function HeaderMenu() {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [importBlob, setImportBlob] = React.useState<Blob | null>(null);
  const [importCounts, setImportCounts] = React.useState({
    people: 0,
    events: 0,
  });
  const [confirmOpen, setConfirmOpen] = React.useState(false);

  const handleLoadSeed = async () => {
    try {
      const { people, events } = await loadSeed();
      toast.success(`Loaded sample data (${people} people · ${events} events)`);
    } catch (err) {
      console.error("loadSeed failed", err);
      toast.error("Couldn't load sample data — try again");
    }
  };

  const handleExport = async () => {
    try {
      const { blob, counts } = await exportData();
      triggerDownload(blob, exportFilename());
      toast.success(`Exported ${counts.people} people · ${counts.events} events`);
    } catch (err) {
      console.error("export failed", err);
      toast.error("Couldn't export — try again");
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // reset so same file can be re-picked
    if (!file) return;
    const counts = await currentCounts();
    setImportBlob(file);
    setImportCounts(counts);
    setConfirmOpen(true);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label="App menu"
          >
            <MoreHorizontal className="size-5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={handleLoadSeed}>
            <Database className="mr-2 size-4" />
            Load sample data
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={handleExport}>
            <Download className="mr-2 size-4" />
            Export data
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={handleImportClick}>
            <Upload className="mr-2 size-4" />
            Import data
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={handleFile}
      />
      <ImportConfirmDialog
        blob={importBlob}
        currentCounts={importCounts}
        open={confirmOpen}
        onOpenChange={(o) => {
          setConfirmOpen(o);
          if (!o) setImportBlob(null);
        }}
      />
    </>
  );
}

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  pdf?: string;
}

export default function PIDViewer({
  open,
  onOpenChange,
  pdf,
}: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] bg-slate-950 border-slate-800 overflow-auto">
        {pdf && (
          <Document file={pdf}>
            <Page pageNumber={1} width={1200} />
          </Document>
        )}
      </DialogContent>
    </Dialog>
  );
}

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { getProcessInfo, type ProcessInfo } from "@/data/processData";
import { ArrowRightLeft, Droplets, BookOpen, FileText, Gauge, ArrowDown, ArrowUp } from "lucide-react";

interface ProcessInfoTabProps {
  tag: string;
}

export function ProcessInfoTab({ tag }: ProcessInfoTabProps) {
  const info = getProcessInfo(tag);

  if (!info) {
    return (
      <div className="border border-dashed border-border rounded-lg p-8 text-center text-muted-foreground">
        <FileText className="h-8 w-8 mx-auto mb-2 opacity-40" />
        <p className="text-sm">No process & P&ID information available for this equipment.</p>
        <p className="text-xs mt-1">Operational manual and P&ID data not yet mapped for {tag}.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header Card */}
      <Card className="border-border">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              <CardTitle className="text-lg font-display">Process & P&ID Engineering Data</CardTitle>
            </div>
            <Badge variant="outline" className="font-mono text-xs">{info.tag}</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Unit Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-secondary/30 rounded-lg p-3">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Process Unit</div>
              <div className="text-sm font-medium">{info.unit} — {info.unitName}</div>
            </div>
            <div className="bg-secondary/30 rounded-lg p-3">
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Equipment Type</div>
              <div className="text-sm font-medium">{info.equipmentType}</div>
            </div>
          </div>

          {/* Documentation */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">
              <BookOpen className="h-3 w-3 mr-1" />
              Manual: {info.manual}
            </Badge>
            {info.pids.map((pid, i) => (
              <Badge key={i} variant="outline" className="text-xs font-mono">
                <FileText className="h-3 w-3 mr-1" />
                P&ID: {pid}
              </Badge>
            ))}
          </div>

          <Separator />

          {/* Primary Fluid */}
          <div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 flex items-center gap-1">
              <Droplets className="h-3 w-3" />
              Primary Operating Fluid
            </div>
            <p className="text-sm text-foreground leading-relaxed">{info.primaryFluid}</p>
          </div>

          <Separator />

          {/* Suction / Discharge */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Suction */}
            <Card className="border-border/50">
              <CardHeader className="pb-2 pt-3">
                <div className="flex items-center gap-2">
                  <ArrowDown className="h-4 w-4 text-emerald-500" />
                  <CardTitle className="text-sm font-medium">Suction / Aspiration</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Description</div>
                  <p className="text-sm">{info.suction.description}</p>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Specification</div>
                  <p className="text-sm font-mono text-xs">{info.suction.spec}</p>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Conditions</div>
                  <Badge variant="outline" className="text-xs mt-1">
                    <Gauge className="h-3 w-3 mr-1" />
                    {info.suction.conditions}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Discharge */}
            <Card className="border-border/50">
              <CardHeader className="pb-2 pt-3">
                <div className="flex items-center gap-2">
                  <ArrowUp className="h-4 w-4 text-blue-500" />
                  <CardTitle className="text-sm font-medium">Discharge / Refoulement</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 pt-0">
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Description</div>
                  <p className="text-sm">{info.discharge.description}</p>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Specification</div>
                  <p className="text-sm font-mono text-xs">{info.discharge.spec}</p>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-muted-foreground">Conditions</div>
                  <Badge variant="outline" className="text-xs mt-1">
                    <Gauge className="h-3 w-3 mr-1" />
                    {info.discharge.conditions}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          <Separator />

          {/* Process Role */}
          <div className="bg-blue-950/20 border border-blue-800/30 rounded-lg p-4">
            <div className="text-[10px] uppercase tracking-widest text-blue-400 mb-1.5 flex items-center gap-1">
              <ArrowRightLeft className="h-3 w-3" />
              Process Role / Function
            </div>
            <p className="text-sm text-foreground leading-relaxed">{info.processRole}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
      }

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Check, RefreshCw } from "lucide-react";
import { Status } from "@/utils/types";

interface UndoableToastProps {
  message: string;
  duration: number;
  onUndo: () => void;
  status: Status;
}

const statusIcons = {
  paid: Check,
  rejected: AlertTriangle,
  review: RefreshCw,
  pending: AlertTriangle,
  in_reposition: RefreshCw,
};

const statusStyles = {
  paid: "text-emerald-600 bg-emerald-100",
  rejected: "text-red-600 bg-red-100",
  review: "text-indigo-600 bg-indigo-100",
  pending: "text-orange-600 bg-orange-100",
  in_reposition: "text-blue-600 bg-blue-100",
};

const UndoableToast = ({
  message,
  duration,
  onUndo,
  status,
}: UndoableToastProps) => {
  const [progress, setProgress] = useState(100);
  const Icon = statusIcons[status];

  useEffect(() => {
    const start = Date.now();
    const interval = setInterval(() => {
      setProgress(Math.max(0, 100 - ((Date.now() - start) / duration) * 100));
    }, 50);
    return () => clearInterval(interval);
  }, [duration]);

  return (
    <div className="w-96 bg-white rounded-lg p-4 shadow-md border border-slate-200">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-full ${statusStyles[status]}`}>
          <Icon className="h-4 w-4" />
        </div>
        <p className="font-medium text-slate-900">{message}</p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => {
          onUndo();
          toast.dismiss();
        }}
      >
        Deshacer
      </Button>
      <Progress value={progress} className="h-1 mt-2" />
    </div>
  );
};

export default UndoableToast;

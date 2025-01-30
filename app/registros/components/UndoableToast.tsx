import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Check, RefreshCw } from "lucide-react";
import { Status } from "@/utils/types";

interface UndoableToastProps {
  message: string;
  duration?: number;
  onUndo: () => void;
  status: Status;
}

const getStatusConfig = (status: Status) => {
  const configs = {
    [Status.approved]: {
      icon: Check,
      color: "text-emerald-600",
      bgColor: "bg-emerald-100",
    },
    [Status.rejected]: {
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
    [Status.review]: {
      icon: RefreshCw,
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
    },
    [Status.pending]: {
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    [Status.in_reposition]: {
      icon: RefreshCw,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
  };
  return configs[status];
};

const UndoableToast = ({
  message,
  duration = 5000,
  onUndo,
  status,
}: UndoableToastProps) => {
  const [progress, setProgress] = useState(100);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);
  const config = getStatusConfig(status);
  const StatusIcon = config.icon;

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 10);

    setIntervalId(interval);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [duration]);

  const handleUndo = () => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    onUndo();
    toast.dismiss();
  };

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-full ${config.bgColor}`}>
          <StatusIcon className={`h-4 w-4 ${config.color}`} />
        </div>
        <p className="font-medium text-slate-900">{message}</p>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleUndo}
          className="h-8 px-3 text-sm hover:bg-slate-100"
        >
          Deshacer
        </Button>
        <div className="flex-1">
          <Progress value={progress} className="h-1" />
        </div>
      </div>
    </div>
  );
};

export default UndoableToast;

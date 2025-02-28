import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function CustomSwitch(id?: string, label?: string) {
  return (
    <div className="inline-flex items-center gap-2">
      <Switch
        id={id}
        className="[&_span]:border-input h-3 w-9 border-none outline-offset-[6px] [&_span]:border"
      />
      <Label htmlFor={id} className="sr-only">
        {label}
      </Label>
    </div>
  );
}

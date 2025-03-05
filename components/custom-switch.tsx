import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

interface CustomSwitchProps extends React.ComponentProps<typeof Switch> {
  id?: string;
  label?: string;
  className?: string;
}

const CustomSwitch: React.FC<CustomSwitchProps> = ({
  id,
  label,
  className = "",
  ...props
}) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Switch
        id={id}
        {...props}
        className="data-[state=checked]:bg-red-500 data-[state=unchecked]:bg-slate-300 
                   border border-red-400 dark:border-red-600 
                   focus:ring-2 focus:ring-red-300 dark:focus:ring-red-900 
                   transition-all duration-300"
      />
      {label && (
        <Label
          htmlFor={id}
          className="text-sm font-medium text-slate-700 dark:text-slate-300"
        >
          {label}
        </Label>
      )}
    </div>
  );
};

export default CustomSwitch;

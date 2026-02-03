import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const KPICard = ({ title, value, unit, icon: Icon }: any) => (
  <Card className="glass-card">
    <CardContent className="p-6 flex justify-between items-center">
      <div>
        <p className="text-sm text-muted-foreground">{title}</p>
        <div className="text-2xl font-bold mt-1">
          {typeof value === 'number' ? value.toFixed(2) : value} <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
      </div>
      <div className="p-3 bg-primary/20 rounded-lg text-primary">
        <Icon size={24} />
      </div>
    </CardContent>
  </Card>
);
export default KPICard;

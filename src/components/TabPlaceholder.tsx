import { Construction } from "lucide-react";

interface TabPlaceholderProps {
  title: string;
}

export default function TabPlaceholder({ title }: TabPlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
      <Construction className="h-12 w-12 mb-4 text-gold" />
      <h3 className="text-lg font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-sm">תוכן זה יתווסף בקרוב</p>
    </div>
  );
}

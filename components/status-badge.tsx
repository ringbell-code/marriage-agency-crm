import { Badge } from "@/components/ui/badge"

interface StatusBadgeProps {
  status: string
}

const statusColors: Record<string, string> = {
  "公開前": "bg-slate-400 text-white hover:bg-slate-400 border-0",
  "お見合い": "bg-sky-500 text-white hover:bg-sky-500 border-0",
  "仮交際": "bg-cyan-500 text-white hover:bg-cyan-500 border-0",
  "真剣交際": "bg-blue-600 text-white hover:bg-blue-600 border-0",
  "成婚退会": "bg-emerald-500 text-white hover:bg-emerald-500 border-0",
  "休会": "bg-amber-500 text-white hover:bg-amber-500 border-0",
  "退会": "bg-gray-500 text-white hover:bg-gray-500 border-0",
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const colorClass = statusColors[status] || "bg-gray-400 text-white hover:bg-gray-400 border-0"
  
  return (
    <Badge variant="secondary" className={`${colorClass} rounded-md px-3 py-0.5 text-xs font-medium`}>
      {status}
    </Badge>
  )
}

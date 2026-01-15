import { ActivityLog } from "@/lib/supabase"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Calendar, FileText } from "lucide-react"

interface ActivityTimelineProps {
  logs: ActivityLog[]
}

const typeIcons = {
  meeting: Calendar,
  line: MessageSquare,
  note: FileText,
}

const typeLabels = {
  meeting: "面談",
  line: "LINE",
  note: "メモ",
}

const sentimentColors = {
  positive: "bg-emerald-50 text-emerald-600 border border-emerald-200",
  negative: "bg-rose-50 text-rose-600 border border-rose-200",
  neutral: "bg-gray-50 text-gray-600 border border-gray-200",
}

export function ActivityTimeline({ logs }: ActivityTimelineProps) {
  if (logs.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-700 text-base font-medium">
        アクティビティログがありません
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => {
        const Icon = typeIcons[log.type as keyof typeof typeIcons] || FileText
        const typeLabel = typeLabels[log.type as keyof typeof typeLabels] || log.type

        return (
          <Card key={log.id} className="border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-all duration-200">
            <CardContent className="p-4 bg-white">
              <div className="flex items-start gap-4">
                <div className="rounded-lg bg-gray-100 p-2.5">
                  <Icon className="h-4 w-4 text-gray-700" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="border-gray-400 text-gray-800 font-semibold">{typeLabel}</Badge>
                    {log.sentiment && (
                      <Badge
                        variant="secondary"
                        className={`${
                          sentimentColors[
                            log.sentiment as keyof typeof sentimentColors
                          ] || sentimentColors.neutral
                        } rounded-lg`}
                      >
                        {log.sentiment}
                      </Badge>
                    )}
                    <span className="text-sm text-gray-700 font-medium">
                      {new Date(log.created_at).toLocaleString('ja-JP', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <p className="text-base leading-relaxed text-gray-800 font-medium">{log.content}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

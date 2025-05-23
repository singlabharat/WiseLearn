import { Card, CardContent } from "@/components/ui/card"
import { ExternalLink } from "lucide-react"
import Link from "next/link"

interface HistoryItemProps {
  topic: string
  filename: string
}

export function HistoryItem({ topic, filename }: HistoryItemProps) {
  return (
    <Card className="transition-all hover:shadow-md">
      <CardContent className="p-4 flex justify-between items-center">
        <div>
          <h3 className="font-medium text-lg">{topic}</h3>
          <p className="text-sm text-muted-foreground">{new Date().toLocaleString()}</p>
        </div>
        <Link href={`/${filename}`} target="_blank" className="flex items-center gap-1 text-primary hover:underline">
          View Content
          <ExternalLink className="h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  )
}

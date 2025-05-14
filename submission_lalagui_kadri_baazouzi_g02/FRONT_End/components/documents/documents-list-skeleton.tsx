import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function DocumentsListSkeleton() {
  return (
    <Card>
      <CardHeader className="px-6 py-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="border-b px-6 py-3">
          <Skeleton className="h-10 w-full" />
        </div>
        <div className="divide-y">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-6">
              <div className="flex items-center space-x-4">
                <Skeleton className="h-10 w-10 rounded" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}


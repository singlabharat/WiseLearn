"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { generateLearningJourney } from "@/app/actions"
import { HistoryItem } from "@/components/history-item"

export default function Home() {
  const [topic, setTopic] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<Array<{ topic: string; filename: string }>>([])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!topic.trim()) {
      setError("Please enter a topic")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await generateLearningJourney(topic)

      if (result.success) {
        setHistory((prev) => [{ topic, filename: result.filename }, ...prev])
        setTopic("")
      } else {
        setError(result.error || "An error occurred while generating content")
      }
    } catch (err) {
      setError("Failed to generate content. Please try again.")
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container max-w-4xl mx-auto py-8 px-4">
        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-4xl font-bold text-primary">Learning Journey Generator</CardTitle>
            <CardDescription className="text-lg">Explore any topic with AI-powered educational content</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <Input
                type="text"
                placeholder="Enter a topic to learn about..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isLoading}
                className="flex-1"
                autoFocus
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate"
                )}
              </Button>
            </form>

            {error && <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-md">{error}</div>}
          </CardContent>
        </Card>

        {isLoading && (
          <Card className="mb-8 border-dashed animate-pulse">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg text-muted-foreground">Generating your learning journey...</p>
              <p className="text-sm text-muted-foreground mt-2">This may take a minute or two</p>
            </CardContent>
          </Card>
        )}

        {history.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Your Learning Journeys</h2>
            {history.map((item, index) => (
              <HistoryItem key={index} topic={item.topic} filename={item.filename} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}

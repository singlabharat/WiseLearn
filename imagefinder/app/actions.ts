"use server"

export async function generateLearningJourney(topic: string) {
  try {
    const response = await fetch(`${process.env.BACKEND_URL || "http://localhost:5000"}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ topic }),
    })

    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`)
    }

    const data = await response.json()
    return {
      success: true,
      filename: data.filename,
    }
  } catch (error) {
    console.error("Error generating learning journey:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}

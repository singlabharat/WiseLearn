import { notFound } from "next/navigation"
import fs from "fs"
import path from "path"

export default function LearningContentPage({ params }: { params: { filename: string } }) {
  const { filename } = params

  try {
    // Check if the file exists
    const filePath = path.join(process.cwd(), filename)
    if (!fs.existsSync(filePath)) {
      return notFound()
    }

    // Read the HTML content
    const content = fs.readFileSync(filePath, "utf8")

    return <div dangerouslySetInnerHTML={{ __html: content }} />
  } catch (error) {
    console.error("Error reading file:", error)
    return notFound()
  }
}

import { createClient } from "@/lib/server"
import Link from "next/link"

export default async function ArticlesPage() {
  const supabase = await createClient()

  const { data: articles, error } = await supabase
    .from("articles")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching articles:", error)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b bg-background">
        <div className="container flex h-16 items-center justify-between px-4">
          <h1 className="text-2xl font-bold">Админ-панель</h1>
          <nav className="flex items-center gap-6">
            <Link href="/admin/articles" className="text-sm font-medium">
              Статьи
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 bg-muted/40">
        <div className="container py-8 px-4">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Статьи</h2>
              <p className="text-muted-foreground">Управление статьями блога</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

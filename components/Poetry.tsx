export default function Poetry({ poetry }: { poetry: { title: string; author: string; content: string; annotation: string } }) {
  return (
    <section className="text-center p-4">
      <h2 className="text-xl font-semibold">{poetry.title}</h2>
      <p className="text-sm text-gray-600">{poetry.author}</p>
      <p className="mt-3 text-base whitespace-pre-line">{poetry.content}</p>
      <p className="mt-3 text-sm text-gray-700 whitespace-pre-line">注释：{poetry.annotation}</p>
    </section>
  )
}
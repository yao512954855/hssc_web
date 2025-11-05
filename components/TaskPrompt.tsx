export default function TaskPrompt({ tasks }: { tasks: string[] }) {
  return (
    <section className="p-4">
      <h3 className="font-semibold mb-2">学习任务</h3>
      <ul className="space-y-1">
        {tasks.map((t, i) => (
          <li key={i} className="text-sm">{t}</li>
        ))}
      </ul>
    </section>
  )
}
"use client"
import Image from 'next/image'
import { useState } from 'react'

type Item = { image_name: string; status: string; generate_time: string | Date; submit_time?: string | Date | null; total_time_seconds?: number | null }

export default function ImageGallery({ items, onSubmit }: { items: Item[]; onSubmit: (name: string) => Promise<void> }) {
  const [selected, setSelected] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  function toggle(name: string) {
    setSelected((prev) => (prev === name ? null : name))
  }

  return (
    <section className="p-4">
      <h3 className="font-semibold mb-2">选择你最喜欢的图片</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2">
        {items.map((it) => (
          <div key={it.image_name} className="border rounded p-2">
            <div
              className="relative w-full aspect-[4/3] overflow-hidden cursor-zoom-in"
              tabIndex={0}
              aria-label={`点击放大预览 ${it.image_name}`}
              onClick={() => setPreview(it.image_name)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') setPreview(it.image_name)
              }}
            >
              <Image
                src={`/generated-images/${it.image_name.split('_')[0]}/${it.image_name}`}
                alt={it.image_name}
                fill
                unoptimized
                className="object-cover"
              />
              <button
                onClick={(e) => { e.stopPropagation(); toggle(it.image_name) }}
                onKeyDown={(e) => { e.stopPropagation() }}
                className={`absolute bottom-2 right-2 px-3 py-2 text-sm rounded shadow ${selected === it.image_name ? 'bg-red-600 text-white' : 'bg-black/60 text-white'}`}
                aria-label={`选择 ${it.image_name}`}
              >
                选择
              </button>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-xs">{it.image_name}</span>
            </div>
          </div>
        ))}
      </div>
      {preview && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center" onClick={() => setPreview(null)}>
          <div
            className="relative w-[92vw] max-w-[1000px] aspect-[4/3]"
            onMouseLeave={() => setPreview(null)}
            onTouchEnd={() => setPreview(null)}
            onTouchCancel={() => setPreview(null)}
          >
            <Image
              src={`/generated-images/${preview.split('_')[0]}/${preview}`}
              alt={preview}
              fill
              unoptimized
              className="object-contain"
              sizes="(max-width: 1000px) 92vw, 1000px"
            />
            <button
              className="absolute top-2 right-2 bg-black/60 text-white text-sm px-3 py-1 rounded"
              onClick={() => setPreview(null)}
              aria-label="关闭预览"
            >
              关闭
            </button>
          </div>
        </div>
      )}
      <div className="mt-3">
        <button
          disabled={!selected}
          onClick={() => selected && onSubmit(selected)}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          确认提交
        </button>
      </div>
    </section>
  )
}
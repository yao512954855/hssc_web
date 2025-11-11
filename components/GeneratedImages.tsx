"use client"
import Image from 'next/image'

export default function GeneratedImages({ images }: { images: { url: string; name: string }[] }) {
  return (
    <section className="p-4">
      <h3 className="font-semibold mb-2">当前生成图</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {images.map((img) => (
          <div key={img.name} className="overflow-hidden">
            <div className="relative w-full aspect-[4/3]">
              <Image src={img.url} alt={img.name} fill unoptimized className="object-cover transition-transform duration-200 hover:scale-110" />
            </div>
            <p className="text-sm mt-1 text-center">{img.name}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
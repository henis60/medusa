import { HttpTypes } from "@medusajs/types"
import Image from "next/image"

type ImageGalleryProps = {
  images: HttpTypes.StoreProductImage[]
}

export const ImageGallery = ({ images }: ImageGalleryProps) => {
  const [first, ...rest] = images

  return (
    <div className="flex gap-3 px-6 small:px-10">
      {rest.length > 0 && (
        <div className="flex flex-col gap-2 w-16 shrink-0">
          {images.map((img, i) => (
            <div
              key={img.id ?? i}
              className={[
                "relative shrink-0 w-16 aspect-[3/4] overflow-hidden bg-[#F5F4F2] dark:bg-[#1e2a22]",
                i === 0 ? "ring-2 ring-hunter-gold opacity-100" : "opacity-40",
              ].join(" ")}
            >
              {img.url && (
                <Image
                  src={img.url}
                  alt={`Product image ${i + 1}`}
                  fill
                  className="object-cover object-center"
                  sizes="64px"
                />
              )}
            </div>
          ))}
        </div>
      )}

      <div className="relative aspect-[3/4] flex-1 overflow-hidden">
        {first?.url && (
          <Image
            src={first.url}
            alt="Product image"
            fill
            priority
            className="object-cover object-center"
            sizes="(max-width: 1024px) 100vw, 55vw"
          />
        )}
      </div>
    </div>
  )
}

export default ImageGallery

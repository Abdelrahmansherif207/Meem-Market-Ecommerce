import Image from "next/image";
import type { FooterData } from "../../types";

interface Props {
  data: FooterData["bottomRow"];
}

export default function FooterBottomRow({ data }: Props) {
  return (
    <div className="flex items-center justify-end gap-2 flex-wrap">
      <a href={data.appStore.url || "#"}>
        <Image
          src={data.appStore.imageSrc}
          alt={data.appStore.alt ?? data.appStore.platform}
          width={100}
          height={30}
          className="w-25 h-[1.852rem]"
          unoptimized
        />
      </a>
      <a href={data.googlePlay.url || "#"}>
        <Image
          src={data.googlePlay.imageSrc}
          alt={data.googlePlay.alt ?? data.googlePlay.platform}
          width={100}
          height={33}
          className="w-25 h-[2.04rem]"
          unoptimized
        />
      </a>
      <span className="me-2 text-xs leading-normal font-normal text-white">{data.title}</span>
    </div>
  );
}

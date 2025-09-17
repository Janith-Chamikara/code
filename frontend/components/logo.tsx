"use client";
import Image from "next/image";
import logo from "@/public/images/EventBuzz.png";
import { useRouter } from "next/navigation";

export default function Logo() {
  const router = useRouter();
  return (
    <Image
      onClick={() => router.push("/")}
      src={logo}
      className="hover:cursor-pointer w-[104px] h-auto md:w-[124px] md:h-auto"
      alt="Logo"
    />
  );
}

"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleClick = async () => {
    if (isNavigating) return; // Prevent multiple clicks

    setIsNavigating(true);
    try {
      await router.push("/select-age");
    } catch (error) {
      console.error("Navigation error:", error);
      setIsNavigating(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-purple-600 to-blue-800">
      {/* Background Image */}
      <Image
        src="/welcome.png"
        alt="Jackson Welcome Screen"
        width={360}
        height={640}
        className="w-full h-full object-cover absolute inset-0"
        priority
        sizes="(max-width: 480px) 100vw, (max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
      />

      {/* Navigation Button with improved touch handling and responsive positioning */}
      <button
        onClick={handleClick}
        disabled={isNavigating}
        className="absolute z-20 touch-manipulation active:scale-95 transition-transform duration-100 hover:opacity-80 disabled:opacity-50"
        style={{
          right: "clamp(4px, 2vw, 8px)",
          bottom: "clamp(80px, 15vh, 120px)",
          width: "clamp(80px, 20vw, 120px)",
          height: "clamp(200px, 40vh, 350px)",
          borderRadius: "50%",
          WebkitTapHighlightColor: "transparent",
        }}
        aria-label="Navigate to Select Goal"
      />
    </div>
  );
}

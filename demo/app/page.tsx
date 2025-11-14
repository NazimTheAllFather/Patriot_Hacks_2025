import Image from "next/image";
import { ChatWindow } from "../components/ChatWindow";

export default function Home() {
  return (
    <main
      className="
        relative
        min-h-screen flex items-center justify-center
        bg-gradient-to-br from-blue-500 via-blue-950 to-purple-600
        dark:from-blue-600 dark:via-blue-950 dark:to-purple-700
        bg-[length:200%_200%] animate-gradient p-4
      "
    >
      {/* MOVING LOGO */}
      <div className="absolute top-10 left-0 w-full overflow-hidden pointer-events-none">
        <div className="animate-marquee w-full flex justify-start">
          <Image
            src="/images/LogoTransparent.png"
            alt="Safefier Logo"
            width={350}
            height={90}
            className="opacity-100 select-none"
            priority
          />
        </div>
      </div>

      {/* MAIN CHAT UI */}
      <ChatWindow />
    </main>
  );
}

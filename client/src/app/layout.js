import { Sora, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import DragonCursor from "./components/DragonCursor";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora",
  weight: ["600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["500", "700"],
});

export const metadata = {
  title: "Backend Developer Intern Portfolio",
  description: "Aspiring Backend Developer Intern specializing in C#, .NET Core, Clean Architecture, and building robust databases and APIs.",
  keywords: "backend, developer, intern, dotnet, csharp, clean-architecture, postgresql, nextjs, tailwindcss, react, glassmorphism",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${sora.variable} ${inter.variable} ${jetbrainsMono.variable} dark scroll-smooth h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
        />
      </head>
      <body className="min-h-full bg-background text-on-surface font-sans overflow-x-hidden flex flex-col" suppressHydrationWarning>
        <DragonCursor />
        {children}
      </body>
    </html>
  );
}

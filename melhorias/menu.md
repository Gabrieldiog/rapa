You are given a task to integrate an existing React component in the codebase

The codebase should support:
- shadcn project structure  
- Tailwind CSS
- Typescript

If it doesn't, provide instructions on how to setup project via shadcn CLI, install Tailwind or Typescript.

Determine the default path for components and styles. 
If default path for components is not /components/ui, provide instructions on why it's important to create this folder
Copy-paste this component to /components/ui folder:
```tsx
liquid-morph-floating-menu.tsx
"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";

const ease = [0.22, 1, 0.36, 1] as const;

interface MenuItem {
  label: string;
  onClick?: () => void;
}

interface FloatingMenuProps {
  items?: MenuItem[];
}

function MenuButton({
  label,
  onClick,
  isOpen,
  index,
}: {
  label: string;
  onClick?: () => void;
  isOpen: boolean;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);
  const animatingRef = useRef(false);
  const pendingLeaveRef = useRef(false);
  const chars = label.split("");
  const lockDuration = 30 * chars.length + 300;

  const handleEnter = useCallback(() => {
    pendingLeaveRef.current = false;
    if (hovered) return;
    setHovered(true);
    animatingRef.current = true;
    setTimeout(() => {
      animatingRef.current = false;
      if (pendingLeaveRef.current) {
        pendingLeaveRef.current = false;
        setHovered(false);
      }
    }, lockDuration);
  }, [hovered, lockDuration]);

  const handleLeave = useCallback(() => {
    if (animatingRef.current) {
      pendingLeaveRef.current = true;
    } else {
      setHovered(false);
    }
  }, []);

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className="text-[#f7f1ed] text-[24px] uppercase leading-none overflow-hidden"
      style={{
        fontFamily: "'Trobika', 'Bebas Neue', sans-serif",
        letterSpacing: "-0.03em",
        height: "1em",
      }}
      animate={{ opacity: isOpen ? 1 : 0 }}
      transition={{
        duration: 0.4,
        delay: isOpen ? 0.4 + 0.08 * index : 0,
        ease,
      }}
    >
      <div className="flex justify-center">
        {chars.map((char, i) => (
          <span
            key={i}
            className="inline-block overflow-hidden"
            style={{ height: "1em" }}
          >
            <span
              className="flex flex-col"
              style={{
                transitionProperty: "transform",
                transitionDuration: hovered ? "800ms" : "0ms",
                transitionDelay: hovered ? `${30 * i}ms` : "0ms",
                transform: hovered ? "translateY(-50%)" : "translateY(0%)",
                transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
              }}
            >
              <span
                className="block"
                style={{ height: "1em", lineHeight: "1em" }}
              >
                {char}
              </span>
              <span
                className="block"
                style={{ height: "1em", lineHeight: "1em" }}
                aria-hidden
              >
                {char}
              </span>
            </span>
          </span>
        ))}
      </div>
    </motion.button>
  );
}

export default function FloatingMenu({ items }: FloatingMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const menuItems: MenuItem[] = items ?? [
    { label: "Home" },
    { label: "Works" },
    { label: "Contact" },
  ];

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [isOpen]);

  return (
    <motion.div
      ref={containerRef}
      className="fixed bottom-10 left-1/2 z-[100]"
      style={{ x: "-50%", pointerEvents: "auto" }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease }}
    >
      <motion.div
        className="relative overflow-hidden flex flex-col"
        onClick={() => {
          if (!isOpen) setIsOpen(true);
        }}
        style={{
          fontFamily: "'Aeonik TRIAL', 'Inter', sans-serif",
          letterSpacing: "-0.02em",
          cursor: isOpen ? "default" : "pointer",
        }}
        animate={{
          width: isOpen ? 280 : 150,
          height: isOpen ? 260 : 48,
          borderRadius: isOpen ? 32 : 72,
          scale: 1,
        }}
        whileHover={isOpen ? undefined : { scale: 1.05 }}
        transition={{
          duration: 0.8,
          ease,
          height: { duration: isOpen ? 0.8 : 0.15 },
          scale: { duration: 0.25, ease },
        }}
      >
        {/* Yellow background layer */}
        <motion.div
          className="absolute inset-0"
          animate={{
            backgroundColor: isOpen ? "#FFE862" : "#FFE862",
            borderColor: isOpen ? "#FFE862" : "#d1bb3b",
          }}
          transition={{ duration: isOpen ? 0.1 : 0.3, ease }}
          style={{
            borderWidth: 1,
            borderStyle: "solid",
            borderRadius: "inherit",
          }}
        />

        {/* Dark circle expanding from bottom */}
        <motion.div
          className="absolute left-1/2 bg-[#242424]"
          style={{
            width: "200%",
            height: "200%",
            borderRadius: "50%",
            x: "-50%",
          }}
          animate={{ bottom: isOpen ? "-20%" : "-200%" }}
          transition={{
            duration: 0.8,
            ease,
            delay: isOpen ? 0.1 : 0,
          }}
        />

        {/* Menu items */}
        <div
          className="relative z-10 flex flex-col gap-6 items-center justify-center"
          style={{
            pointerEvents: isOpen ? "auto" : "none",
            opacity: isOpen ? 1 : 0,
            flex: isOpen ? 1 : 0,
            overflow: "hidden",
          }}
        >
          {menuItems.map((item, idx) => (
            <MenuButton
              key={item.label}
              label={item.label}
              onClick={item.onClick}
              isOpen={isOpen}
              index={idx}
            />
          ))}
        </div>

        {/* Bottom bar: Menu + hamburger */}
        <motion.div
          className="relative z-10 flex items-center justify-between w-full shrink-0 cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
          animate={{
            paddingLeft: isOpen ? 24 : 20,
            paddingRight: isOpen ? 24 : 20,
            paddingBottom: isOpen ? 24 : 0,
            height: 48,
          }}
          transition={{ duration: 0.8, ease }}
          style={{ alignItems: "center" }}
        >
          <motion.span
            className="text-[14px] md:text-[20px] leading-none"
            animate={{ color: isOpen ? "#f7f1ed" : "#242424" }}
            transition={{ duration: 0.3, ease }}
          >
            Menu
          </motion.span>

          <div className="relative w-[24px] h-[24px] flex items-center justify-center">
            <motion.span
              className="absolute block w-[18px] h-[2px] rounded-full"
              animate={{
                rotate: isOpen ? 45 : 0,
                y: isOpen ? 0 : -3,
                backgroundColor: isOpen ? "#f7f1ed" : "#242424",
              }}
              transition={{ duration: 0.4, ease }}
            />
            <motion.span
              className="absolute block w-[18px] h-[2px] rounded-full"
              animate={{
                rotate: isOpen ? -45 : 0,
                y: isOpen ? 0 : 3,
                backgroundColor: isOpen ? "#f7f1ed" : "#242424",
              }}
              transition={{ duration: 0.4, ease }}
            />
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}


demo.tsx
"use client";

import FloatingMenu from "../components/ui/liquid-morph-floating-menu";

function SkeletonLoader() {
  return (
    <div className="w-full max-w-6xl mx-auto p-6 sm:p-10 flex flex-col gap-10 bg-transparent select-none pointer-events-none">
      {/* Header */}
      <div className="flex justify-between items-center w-full border-b border-[#242424]/10 pb-6 shrink-0">
        {/* Logo */}
        <div className="h-6 w-28 bg-[#242424]/10 rounded-lg animate-pulse" />
        {/* Nav Items */}
        <div className="hidden sm:flex gap-8">
          <div className="h-4 w-16 bg-[#242424]/10 rounded-md animate-pulse" />
          <div className="h-4 w-16 bg-[#242424]/10 rounded-md animate-pulse" />
          <div className="h-4 w-16 bg-[#242424]/10 rounded-md animate-pulse" />
        </div>
        {/* CTA */}
        <div className="h-9 w-24 bg-[#242424]/10 rounded-full animate-pulse" />
      </div>

      {/* Hero Section */}
      <div className="flex flex-col gap-4 py-12 items-center text-center max-w-2xl mx-auto w-full">
        <div className="h-10 w-4/5 bg-[#242424]/15 rounded-xl animate-pulse" />
        <div className="h-10 w-2/3 bg-[#242424]/15 rounded-xl animate-pulse" />
        <div className="h-4 w-full bg-[#242424]/10 rounded-md mt-4 animate-pulse" />
        <div className="h-4 w-5/6 bg-[#242424]/10 rounded-md animate-pulse" />
        <div className="flex gap-4 mt-6">
          <div className="h-11 w-32 bg-[#242424]/15 rounded-full animate-pulse" />
          <div className="h-11 w-32 bg-[#242424]/10 rounded-full animate-pulse" />
        </div>
      </div>

      {/* Grid Content - Section 1 */}
      <div className="flex flex-col gap-4">
        <div className="h-6 w-40 bg-[#242424]/15 rounded-lg animate-pulse mb-2" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white/60 backdrop-blur-sm p-5 rounded-2xl border border-white/40 flex flex-col gap-4">
              <div className="aspect-video w-full bg-[#242424]/10 rounded-xl animate-pulse" />
              <div className="h-3 w-1/4 bg-[#242424]/10 rounded-md animate-pulse" />
              <div className="h-5 w-3/4 bg-[#242424]/15 rounded-md animate-pulse" />
              <div className="flex flex-col gap-2">
                <div className="h-3 w-full bg-[#242424]/10 rounded-md animate-pulse" />
                <div className="h-3 w-5/6 bg-[#242424]/10 rounded-md animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Feature Block - Section 2 */}
      <div className="flex flex-col md:flex-row gap-8 items-center py-8 border-t border-[#242424]/10">
        <div className="w-full md:w-1/2 flex flex-col gap-4">
          <div className="h-8 w-2/3 bg-[#242424]/15 rounded-xl animate-pulse" />
          <div className="h-4 w-full bg-[#242424]/10 rounded-md animate-pulse" />
          <div className="h-4 w-11/12 bg-[#242424]/10 rounded-md animate-pulse" />
          <div className="h-4 w-4/5 bg-[#242424]/10 rounded-md animate-pulse" />
          <div className="h-9 w-28 bg-[#242424]/15 rounded-full animate-pulse mt-2" />
        </div>
        <div className="w-full md:w-1/2 aspect-video bg-[#242424]/10 rounded-2xl animate-pulse" />
      </div>

      {/* Grid Content - Section 3 */}
      <div className="flex flex-col gap-4 py-8 border-t border-[#242424]/10">
        <div className="h-6 w-48 bg-[#242424]/15 rounded-lg animate-pulse mb-2" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white/60 backdrop-blur-sm p-6 rounded-2xl border border-white/40 flex flex-col gap-4">
              <div className="h-5 w-1/2 bg-[#242424]/15 rounded-md animate-pulse" />
              <div className="flex flex-col gap-2">
                <div className="h-3.5 w-full bg-[#242424]/10 rounded-md animate-pulse" />
                <div className="h-3.5 w-11/12 bg-[#242424]/10 rounded-md animate-pulse" />
                <div className="h-3.5 w-5/6 bg-[#242424]/10 rounded-md animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center border-t border-[#242424]/10 pt-8 pb-28 gap-4 shrink-0">
        <div className="h-4 w-48 bg-[#242424]/10 rounded-md animate-pulse" />
        <div className="flex gap-4">
          <div className="h-8 w-8 bg-[#242424]/10 rounded-full animate-pulse" />
          <div className="h-8 w-8 bg-[#242424]/10 rounded-full animate-pulse" />
          <div className="h-8 w-8 bg-[#242424]/10 rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function FloatingMenuDemo() {
  return (
    <div className="min-h-screen w-full bg-[#ede8e4] relative font-sans antialiased selection:bg-[#FFE862]/30">
      <SkeletonLoader />
      <FloatingMenu />
    </div>
  );
}

```

Install NPM dependencies:
```bash
framer-motion
```

Implementation Guidelines
 1. Analyze the component structure and identify all required dependencies
 2. Review the component's argumens and state
 3. Identify any required context providers or hooks and install them
 4. Questions to Ask
 - What data/props will be passed to this component?
 - Are there any specific state management requirements?
 - Are there any required assets (images, icons, etc.)?
 - What is the expected responsive behavior?
 - What is the best place to use this component in the app?

Steps to integrate
 0. Copy paste all the code above in the correct directories
 1. Install external dependencies
 2. Fill image assets with Unsplash stock images you know exist
 3. Use lucide-react icons for svgs or logos if component requires them

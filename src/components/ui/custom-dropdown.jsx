import React, { useState, useRef, useEffect } from "react";
import { motion as Motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Custom Dropdown Component
 * @param {React.ReactNode} trigger - The element to click to toggle the menu
 * @param {React.ReactNode} children - The menu items
 * @param {string} align - Alignment of the dropdown ("start", "end", "center")
 */
export const CustomDropdown = ({
  trigger,
  children,
  align = "end",
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, []);

  const variants = {
    hidden: { opacity: 0, scale: 0.96, y: -6 },
    visible: { opacity: 1, scale: 1, y: 0 },
    exit:   { opacity: 0, scale: 0.96, y: -6 },
  };

  const transition = {
    duration: 0.18,
    ease: [0.4, 0, 0.2, 1],
  };

  return (
    <div
      className={cn("relative inline-block text-left", className)}
      ref={dropdownRef}
    >
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      <AnimatePresence>
        {isOpen && (
          <Motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={variants}
            transition={transition}
            style={{ transformOrigin: "top right" }}
            className={cn(
              "absolute z-50 mt-2 w-56 rounded-md border bg-popover p-1 shadow-md text-popover-foreground",
              align === "end"
                ? "right-0"
                : align === "start"
                ? "left-0"
                : "left-1/2 -translate-x-1/2"
            )}
          >
            <div
              className="flex flex-col gap-1"
              onClick={() => setIsOpen(false)}
            >
              {children}
            </div>
          </Motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const DropdownItem = ({
  children,
  onClick,
  className,
  destructive = false,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
        "transition-all duration-150 ease-out",
        "hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        "active:scale-[0.98]",
        destructive &&
          "text-destructive hover:text-destructive focus:text-destructive",
        className
      )}
    >
      {children}
    </button>
  );
};

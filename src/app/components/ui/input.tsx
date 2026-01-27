import * as React from "react";

import { cn } from "./utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-gray-600 placeholder:text-gray-400 selection:bg-purple-200 selection:text-purple-900 border-purple-200 border flex h-11 w-full min-w-0 rounded-xl px-4 py-2 text-base bg-white text-gray-800 transition-all duration-200 outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "hover:border-purple-300 focus-visible:border-purple-500 focus-visible:ring-purple-500/20 focus-visible:ring-2",
        "aria-invalid:ring-red-500/20 aria-invalid:border-red-500",
        className,
      )}
      {...props}
    />
  );
}

export { Input };

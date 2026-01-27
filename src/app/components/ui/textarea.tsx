import * as React from "react";

import { cn } from "./utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "resize-none border-purple-200 placeholder:text-gray-400 focus-visible:border-purple-500 focus-visible:ring-purple-500/20 aria-invalid:ring-red-500/20 aria-invalid:border-red-500 flex field-sizing-content min-h-16 w-full rounded-xl border bg-white text-gray-700 px-4 py-3 text-base transition-all duration-200 outline-none focus-visible:ring-2 hover:border-purple-300 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };

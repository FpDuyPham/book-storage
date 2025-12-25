import * as React from "react"
import { cn } from "../../lib/utils"

/**
 * A component that hides its children visually while keeping them accessible to screen readers.
 * Useful for providing context to Dialogs and Sheets that don't need a visible title.
 */
export const VisuallyHidden = React.forwardRef<
    HTMLSpanElement,
    React.HTMLAttributes<HTMLSpanElement>
>(({ className, ...props }, ref) => {
    return (
        <span
            ref={ref}
            className={cn(
                "absolute w-[1px] h-[1px] p-0 -m-[1px] overflow-hidden clip-rect-0 whitespace-nowrap border-0 sr-only",
                className
            )}
            {...props}
        />
    )
})

VisuallyHidden.displayName = "VisuallyHidden"

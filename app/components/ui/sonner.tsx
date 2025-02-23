import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()
  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      richColors
      expand
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: 
            "group toast group-[.toaster]:bg-background group-[.toaster]:border-border group-[.toaster]:text-foreground data-[type=success]:group-[.toaster]:border-l-4 data-[type=success]:group-[.toaster]:border-l-green-500",
          error:
            "group toast group-[.toaster]:bg-background group-[.toaster]:border-border group-[.toaster]:text-foreground data-[type=error]:group-[.toaster]:border-l-4 data-[type=error]:group-[.toaster]:border-l-destructive",
          info:
            "group toast group-[.toaster]:bg-background group-[.toaster]:border-border group-[.toaster]:text-foreground data-[type=info]:group-[.toaster]:border-l-4 data-[type=info]:group-[.toaster]:border-l-blue-500",
          warning:
            "group toast group-[.toaster]:bg-background group-[.toaster]:border-border group-[.toaster]:text-foreground data-[type=warning]:group-[.toaster]:border-l-4 data-[type=warning]:group-[.toaster]:border-l-yellow-500",
          loading:
            "group toast group-[.toaster]:bg-background group-[.toaster]:border-border group-[.toaster]:text-foreground",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }

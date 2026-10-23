"use client";

import * as React from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "cn";

export const PasswordInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<typeof Input>
>(function PasswordInput({ className, ...props }, ref) {
  const [visivel, setVisivel] = React.useState(false);

  return (
    <div className="relative">
      <Input
        ref={ref}
        type={visivel ? "text" : "password"}
        className={cn("pr-11", className)}
        {...props}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute right-0 top-0 h-full w-11 text-muted-foreground hover:text-foreground"
        aria-label={visivel ? "Ocultar senha" : "Mostrar senha"}
        aria-pressed={visivel}
        onClick={() => setVisivel((v) => !v)}
      >
        {visivel ? (
          <EyeOff className="size-4" aria-hidden="true" />
        ) : (
          <Eye className="size-4" aria-hidden="true" />
        )}
      </Button>
    </div>
  );
});

import * as React from "react";
import { cn } from "@/lib/utils";

const AvatarContext = React.createContext({
  imageLoading: true,
  imageError: false,
  setImageLoading: () => {},
  setImageError: () => {},
});

const Avatar = React.forwardRef(({ className, ...props }, ref) => {
  const [imageLoading, setImageLoading] = React.useState(true);
  const [imageError, setImageError] = React.useState(false);

  return (
    <AvatarContext.Provider
      value={{ imageLoading, imageError, setImageLoading, setImageError }}
    >
      <div
        ref={ref}
        className={cn(
          "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
          className
        )}
        {...props}
      />
    </AvatarContext.Provider>
  );
});
Avatar.displayName = "Avatar";

const AvatarImage = React.forwardRef(({ className, src, ...props }, ref) => {
  const { setImageLoading, setImageError } = React.useContext(AvatarContext);

  React.useEffect(() => {
    if (!src) {
      setImageError(true);
      setImageLoading(false);
      return;
    }
    setImageLoading(true);
    setImageError(false);

    const img = new Image();
    img.src = src;
    img.onload = () => {
      setImageLoading(false);
      setImageError(false);
    };
    img.onerror = () => {
      setImageLoading(false);
      setImageError(true);
    };
  }, [src, setImageLoading, setImageError]);

  const { imageError } = React.useContext(AvatarContext);

  if (imageError || !src) return null;

  return (
    <img
      ref={ref}
      src={src}
      className={cn("aspect-square h-full w-full object-cover", className)}
      {...props}
    />
  );
});
AvatarImage.displayName = "AvatarImage";

const AvatarFallback = React.forwardRef(({ className, ...props }, ref) => {
  const { imageLoading, imageError } = React.useContext(AvatarContext);

  if (!imageError && !imageLoading) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-muted",
        className
      )}
      {...props}
    />
  );
});
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };

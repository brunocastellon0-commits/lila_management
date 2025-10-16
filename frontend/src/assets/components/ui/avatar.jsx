import React from "react";
import PropTypes from "prop-types";
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "../../../utils/utils";

// Root
const Avatar = ({ className, children, ...props }) => {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      className={cn(
        "relative flex size-10 shrink-0 overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      {children}
    </AvatarPrimitive.Root>
  );
};

Avatar.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

// Image
const AvatarImage = ({ className, ...props }) => {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  );
};

AvatarImage.propTypes = {
  className: PropTypes.string,
};

// Fallback
const AvatarFallback = ({ className, children, ...props }) => {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      className={cn(
        "bg-muted flex size-full items-center justify-center rounded-full",
        className
      )}
      {...props}
      children={children}
    />
  );
};

AvatarFallback.propTypes = {
  className: PropTypes.string,
  children: PropTypes.node,
};

export { Avatar, AvatarImage, AvatarFallback };

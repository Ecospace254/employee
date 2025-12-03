import { useState } from "react";
import { Button } from "./button";

interface ExpandableTextProps {
  text: string;
  maxLength?: number;
  className?: string;
  showMoreText?: string;
  showLessText?: string;
}

export function ExpandableText({
  text,
  maxLength = 150,
  className = "",
  showMoreText = "Read more",
  showLessText = "Show less",
}: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) return null;

  const shouldTruncate = text.length > maxLength;
  const displayText = isExpanded || !shouldTruncate 
    ? text 
    : text.slice(0, maxLength) + "...";

  return (
    <div className={className}>
      <span className="whitespace-pre-wrap">{displayText}</span>
      {shouldTruncate && (
        <Button
          variant="link"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-1 h-auto p-0 text-primary hover:underline font-medium"
        >
          {isExpanded ? showLessText : showMoreText}
        </Button>
      )}
    </div>
  );
}

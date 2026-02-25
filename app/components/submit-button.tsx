"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  idleText: string;
  pendingText: string;
  className?: string;
};

export function SubmitButton({ idleText, pendingText, className }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={className} disabled={pending}>
      {pending ? pendingText : idleText}
    </button>
  );
}

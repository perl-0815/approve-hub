"use client";

import { useState, useTransition } from "react";
import { toggleApproval } from "@/app/lib/actions";

type ApprovalCheckboxProps = {
  checkId: string;
  groupSlug: string;
  checked: boolean;
};

export function ApprovalCheckbox({ checkId, groupSlug, checked }: ApprovalCheckboxProps) {
  const [isPending, startTransition] = useTransition();
  const [localChecked, setLocalChecked] = useState(checked);

  return (
    <form className={`check-form ${isPending ? "is-submitting" : ""}`}>
      <input
        aria-label="approval-checkbox"
        type="checkbox"
        checked={localChecked}
        onChange={(event) => {
          const previous = localChecked;
          const nextChecked = event.currentTarget.checked;
          setLocalChecked(nextChecked);
          startTransition(async () => {
            try {
              const formData = new FormData();
              formData.append("checkId", checkId);
              formData.append("groupSlug", groupSlug);
              formData.append("approved", nextChecked ? "true" : "false");
              await toggleApproval(formData);
            } catch {
              setLocalChecked(previous);
            }
          });
        }}
        disabled={isPending}
      />
    </form>
  );
}

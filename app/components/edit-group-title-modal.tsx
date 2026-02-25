"use client";

import { useState, useTransition } from "react";
import { updateGroupTitle } from "@/app/lib/actions";
import { PencilIcon } from "@/app/components/icons";

type EditGroupTitleModalProps = {
  groupId: string;
  groupSlug: string;
  currentTitle: string;
};

export function EditGroupTitleModal({ groupId, groupSlug, currentTitle }: EditGroupTitleModalProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await updateGroupTitle(formData);
      setOpen(false);
    });
  };

  return (
    <>
      <button type="button" className="icon-btn edit-title-btn" aria-label="グループタイトルを編集" onClick={() => setOpen(true)}>
        <PencilIcon className="mini-icon edit-title-icon" />
      </button>

      {open ? (
        <div className="share-modal-overlay" role="presentation" onClick={() => setOpen(false)}>
          <section
            className="share-modal"
            role="dialog"
            aria-modal="true"
            aria-label="グループタイトル編集"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="share-modal-head">
              <h2>タイトルを編集</h2>
              <button type="button" className="share-close-btn" aria-label="モーダルを閉じる" onClick={() => setOpen(false)}>
                ×
              </button>
            </div>

            <form action={handleSubmit} className="grid-form">
              <input type="hidden" name="groupId" value={groupId} />
              <input type="hidden" name="groupSlug" value={groupSlug} />
              <label>
                グループタイトル
                <input name="title" defaultValue={currentTitle} maxLength={100} required disabled={isPending} />
              </label>
              <button type="submit" className="full-width-btn" disabled={isPending}>
                {isPending ? "変更中..." : "変更する"}
              </button>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}

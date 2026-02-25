"use client";

import { useState, useTransition } from "react";
import { PencilIcon } from "@/app/components/icons";
import { updateApprovalItem } from "@/app/lib/actions";

type EditApprovalItemModalProps = {
  itemId: string;
  groupSlug: string;
  currentTitle: string;
  currentDetails: string;
};

export function EditApprovalItemModal({ itemId, groupSlug, currentTitle, currentDetails }: EditApprovalItemModalProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await updateApprovalItem(formData);
      setOpen(false);
    });
  };

  return (
    <>
      <button type="button" className="icon-btn item-edit-btn" aria-label="確認事項を編集" onClick={() => setOpen(true)}>
        <PencilIcon className="mini-icon" />
      </button>

      {open ? (
        <div className="share-modal-overlay" role="presentation" onClick={() => setOpen(false)}>
          <section
            className="share-modal"
            role="dialog"
            aria-modal="true"
            aria-label="確認事項を編集"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="share-modal-head">
              <h2>確認事項を編集</h2>
              <button type="button" className="share-close-btn" aria-label="モーダルを閉じる" onClick={() => setOpen(false)}>
                ×
              </button>
            </div>

            <form action={handleSubmit} className="grid-form">
              <input type="hidden" name="itemId" value={itemId} />
              <input type="hidden" name="groupSlug" value={groupSlug} />
              <label>
                承認事項のタイトル
                <input name="title" defaultValue={currentTitle} required maxLength={120} disabled={isPending} />
              </label>
              <label>
                承認するべき内容
                <textarea name="details" defaultValue={currentDetails} rows={4} required maxLength={2000} disabled={isPending} />
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

"use client";

import { useState, useTransition } from "react";
import { createApprovalItem } from "@/app/lib/actions";

type AddApprovalItemModalProps = {
  groupId: string;
  groupSlug: string;
  disabled?: boolean;
};

export function AddApprovalItemModal({ groupId, groupSlug, disabled = false }: AddApprovalItemModalProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await createApprovalItem(formData);
      setOpen(false);
    });
  };

  return (
    <>
      <button type="button" className="add-item-btn" disabled={disabled} onClick={() => setOpen(true)}>
        確認事項の追加
      </button>

      {open ? (
        <div className="share-modal-overlay" role="presentation" onClick={() => setOpen(false)}>
          <section
            className="share-modal"
            role="dialog"
            aria-modal="true"
            aria-label="確認事項を追加"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="share-modal-head">
              <h2>確認事項を追加</h2>
              <button type="button" className="share-close-btn" aria-label="モーダルを閉じる" onClick={() => setOpen(false)}>
                ×
              </button>
            </div>

            <form action={handleSubmit} className="grid-form">
              <input type="hidden" name="groupId" value={groupId} />
              <input type="hidden" name="groupSlug" value={groupSlug} />
              <label>
                承認事項のタイトル
                <input name="title" required maxLength={120} disabled={isPending} />
              </label>
              <label>
                申請者
                <input name="requester" maxLength={40} placeholder="任意" disabled={isPending} />
              </label>
              <label>
                承認するべき内容
                <textarea name="details" rows={4} required maxLength={2000} disabled={isPending} />
              </label>
              <button type="submit" className="full-width-btn" disabled={isPending}>
                {isPending ? "追加中..." : "追加する"}
              </button>
            </form>
          </section>
        </div>
      ) : null}
    </>
  );
}

"use client";

import { useState, useTransition } from "react";
import { deleteApprover, updateApproverName } from "@/app/lib/actions";

type EditApproverModalProps = {
  approverId: string;
  groupSlug: string;
  currentName: string;
};

export function EditApproverModal({ approverId, groupSlug, currentName }: EditApproverModalProps) {
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleUpdate = (formData: FormData) => {
    startTransition(async () => {
      await updateApproverName(formData);
      setOpen(false);
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("approverId", approverId);
      formData.append("groupSlug", groupSlug);
      await deleteApprover(formData);
      setConfirmOpen(false);
      setOpen(false);
    });
  };

  return (
    <>
      <button type="button" className="chip chip-btn" onClick={() => setOpen(true)}>
        <span>{currentName}</span>
      </button>

      {open ? (
        <div className="share-modal-overlay" role="presentation" onClick={() => setOpen(false)}>
          <section
            className="share-modal"
            role="dialog"
            aria-modal="true"
            aria-label="承認担当者を編集"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="share-modal-head">
              <h2>承認担当者を編集</h2>
              <button type="button" className="share-close-btn" aria-label="モーダルを閉じる" onClick={() => setOpen(false)}>
                ×
              </button>
            </div>

            <form action={handleUpdate} className="grid-form">
              <input type="hidden" name="approverId" value={approverId} />
              <input type="hidden" name="groupSlug" value={groupSlug} />
              <label>
                名前
                <input name="name" defaultValue={currentName} maxLength={40} required disabled={isPending} />
              </label>
              <button type="submit" className="full-width-btn" disabled={isPending}>
                {isPending ? "変更中..." : "名前を変更"}
              </button>
            </form>

            <div className="modal-delete-form">
              <button type="button" className="full-width-btn danger-btn" disabled={isPending} onClick={() => setConfirmOpen(true)}>
                削除
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {confirmOpen ? (
        <div className="share-modal-overlay" role="presentation" onClick={() => setConfirmOpen(false)}>
          <section
            className="share-modal"
            role="dialog"
            aria-modal="true"
            aria-label="削除確認"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="share-modal-head">
              <h2>担当者を削除しますか？</h2>
              <button
                type="button"
                className="share-close-btn"
                aria-label="モーダルを閉じる"
                onClick={() => setConfirmOpen(false)}
              >
                ×
              </button>
            </div>

            <p className="subtext">この操作は取り消せません。</p>

            <div className="modal-actions">
              <button type="button" className="full-width-btn danger-btn" onClick={handleDelete} disabled={isPending}>
                {isPending ? "削除中..." : "削除する"}
              </button>
              <button type="button" className="full-width-btn" onClick={() => setConfirmOpen(false)} disabled={isPending}>
                キャンセル
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteGroup, updateGroupTitle } from "@/app/lib/actions";
import { PencilIcon } from "@/app/components/icons";

type EditGroupTitleModalProps = {
  groupId: string;
  groupSlug: string;
  currentTitle: string;
};

export function EditGroupTitleModal({ groupId, groupSlug, currentTitle }: EditGroupTitleModalProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      await updateGroupTitle(formData);
      setOpen(false);
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("groupId", groupId);
      formData.append("groupSlug", groupSlug);
      const deleted = await deleteGroup(formData);
      if (deleted) {
        setConfirmOpen(false);
        setOpen(false);
        router.push("/");
      }
    });
  };

  return (
    <>
      <button type="button" className="group-title-trigger" aria-label="グループタイトルを編集" onClick={() => setOpen(true)}>
        <span className="group-title-main">{currentTitle}</span>
      </button>
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

            <div className="modal-delete-form">
              <button type="button" className="full-width-btn danger-btn" disabled={isPending} onClick={() => setConfirmOpen(true)}>
                グループを削除
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
            aria-label="グループ削除確認"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="share-modal-head">
              <h2>グループを削除しますか？</h2>
              <button
                type="button"
                className="share-close-btn"
                aria-label="モーダルを閉じる"
                onClick={() => setConfirmOpen(false)}
              >
                ×
              </button>
            </div>

            <p className="subtext">この操作は取り消せません。確認事項とコメントもすべて削除されます。</p>

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

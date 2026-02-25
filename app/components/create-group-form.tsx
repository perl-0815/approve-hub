"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createGroup } from "@/app/lib/actions";

export function CreateGroupForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      const slug = await createGroup(formData);
      if (!slug) return;

      const shareUrl = `${window.location.origin}/g/${slug}`;

      try {
        await navigator.clipboard.writeText(shareUrl);
        setToastMessage("クリップボードに共有URLをコピーしました！");
      } catch {
        setToastMessage("共有URLを作成しました（コピーは失敗しました）");
      }

      setTimeout(() => {
        router.push(`/g/${slug}`);
      }, 650);
    });
  };

  return (
    <>
      <form action={handleSubmit} className="grid-form">
        <label>
          <input name="title" placeholder="例: デザインチェック" required maxLength={100} disabled={isPending} />
        </label>
        <button type="submit" className="full-width-btn" disabled={isPending}>
          {isPending ? "作成中..." : "グループを作成"}
        </button>
      </form>

      {toastMessage ? <p className="toast">{toastMessage}</p> : null}
    </>
  );
}

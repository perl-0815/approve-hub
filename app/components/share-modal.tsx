"use client";

import { useState } from "react";
import { CopyUrlButton } from "@/app/components/copy-url-button";
import { LinkIcon } from "@/app/components/icons";

type ShareModalProps = {
  shareUrl: string;
  qrCodeDataUrl: string;
};

export function ShareModal({ shareUrl, qrCodeDataUrl }: ShareModalProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className="share-open-btn" onClick={() => setOpen(true)}>
        <span className="share-open-label">共有</span>
        <LinkIcon className="mini-icon share-open-icon" />
      </button>

      {open ? (
        <div className="share-modal-overlay" role="presentation" onClick={() => setOpen(false)}>
          <section
            className="share-modal"
            role="dialog"
            aria-modal="true"
            aria-label="共有設定"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="share-modal-head">
              <h2>共有URL</h2>
              <button type="button" className="share-close-btn" aria-label="モーダルを閉じる" onClick={() => setOpen(false)}>
                ×
              </button>
            </div>

            <p className="subtext">
              <code>{shareUrl}</code>
            </p>
            <CopyUrlButton url={shareUrl} />

            <div className="qr-wrap">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrCodeDataUrl} alt="共有URLのQRコード" width={180} height={180} />
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

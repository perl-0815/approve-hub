"use client";

import { useMemo, useState } from "react";
import { AddApprovalItemModal } from "@/app/components/add-approval-item-modal";
import { ApprovalCheckbox } from "@/app/components/approval-checkbox";
import { EditApprovalItemModal } from "@/app/components/edit-approval-item-modal";
import { SubmitButton } from "@/app/components/submit-button";
import { CheckCircleIcon, ClockIcon, CommentIcon } from "@/app/components/icons";
import { addComment } from "@/app/lib/actions";

type TimelineItem = {
  id: string;
  title: string;
  requester: string | null;
  details: string;
  createdAt: string;
  checks: {
    id: string;
    approved: boolean;
    approver: {
      name: string;
    };
  }[];
  comments: {
    id: string;
    author: string;
    body: string;
    createdAt: string;
  }[];
};

type ApprovalTimelineProps = {
  groupId: string;
  groupSlug: string;
  hasApprovers: boolean;
  items: TimelineItem[];
};

function formatDate(date: string) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

function isApproved(item: TimelineItem) {
  const approvedCount = item.checks.filter((check) => check.approved).length;
  return item.checks.length > 0 && approvedCount === item.checks.length;
}

export function ApprovalTimeline({ groupId, groupSlug, hasApprovers, items }: ApprovalTimelineProps) {
  const [statusFilter, setStatusFilter] = useState<"pending" | "approved" | "all">("pending");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const visibleItems = useMemo(() => {
    const filtered = items.filter((item) => {
      if (statusFilter === "all") return true;
      const approved = isApproved(item);
      return statusFilter === "approved" ? approved : !approved;
    });

    return filtered.sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return sortOrder === "asc" ? aTime - bTime : bTime - aTime;
    });
  }, [items, sortOrder, statusFilter]);

  return (
    <section className="card">
      <div className="timeline-head">
        <h2>承認タイムライン</h2>
        <AddApprovalItemModal groupId={groupId} groupSlug={groupSlug} disabled={!hasApprovers} />
      </div>

      <div className="timeline-toolbar">
        <div className="toggle-group" aria-label="表示フィルター">
          <button type="button" className={statusFilter === "pending" ? "toggle-btn active" : "toggle-btn"} onClick={() => setStatusFilter("pending")}>
            未承認のみ
          </button>
          <button type="button" className={statusFilter === "approved" ? "toggle-btn active" : "toggle-btn"} onClick={() => setStatusFilter("approved")}>
            承認のみ
          </button>
          <button type="button" className={statusFilter === "all" ? "toggle-btn active" : "toggle-btn"} onClick={() => setStatusFilter("all")}>
            すべて
          </button>
        </div>

        <div className="toggle-group" aria-label="並び順フィルター">
          <button type="button" className={sortOrder === "asc" ? "toggle-btn active" : "toggle-btn"} onClick={() => setSortOrder("asc")}>
            古い順
          </button>
          <button type="button" className={sortOrder === "desc" ? "toggle-btn active" : "toggle-btn"} onClick={() => setSortOrder("desc")}>
            新しい順
          </button>
        </div>
      </div>

      {!hasApprovers ? (
        <div className="timeline-notice">
          <p className="empty">先に承認担当者を追加してください。</p>
        </div>
      ) : null}

      {visibleItems.length === 0 ? (
        <div className="timeline-notice">
          <p className="empty">表示条件に一致する承認事項はありません。</p>
        </div>
      ) : (
        <div className="timeline">
          {visibleItems.map((item) => {
            const approvedCount = item.checks.filter((check) => check.approved).length;
            const approved = isApproved(item);

            return (
              <article key={item.id} className="timeline-item">
                <div className="timeline-header">
                  <div>
                    <div className="item-title-row">
                      <EditApprovalItemModal itemId={item.id} groupSlug={groupSlug} currentTitle={item.title} currentDetails={item.details} />
                    </div>
                    <p className="item-meta">
                      申請者: {item.requester ?? "未入力"} ・ {formatDate(item.createdAt)}
                    </p>
                  </div>
                  <span className={`status ${approved ? "ok" : "wait"}`}>
                    {approved ? <CheckCircleIcon className="mini-icon" /> : <ClockIcon className="mini-icon" />}
                    {approved ? "Approved" : `承認待ち ${approvedCount}/${item.checks.length}`}
                  </span>
                </div>

                <p className="item-details">{item.details}</p>

                <div className="checks">
                  {item.checks.map((check) => (
                    <label key={check.id} className="check-row">
                      <ApprovalCheckbox checkId={check.id} groupSlug={groupSlug} checked={check.approved} />
                      <span>{check.approver.name}</span>
                    </label>
                  ))}
                </div>

                <div className="comment-section">
                  <p className="comment-title">
                    <CommentIcon className="mini-icon" /> コメント
                  </p>
                  {item.comments.length === 0 ? (
                    <p className="empty">コメントはまだありません。</p>
                  ) : (
                    <ul className="comment-list">
                      {item.comments.map((comment) => (
                        <li key={comment.id}>
                          <strong>{comment.author}</strong>
                          <span>{formatDate(comment.createdAt)}</span>
                          <p>{comment.body}</p>
                        </li>
                      ))}
                    </ul>
                  )}

                  <form action={addComment} className="comment-form">
                    <input type="hidden" name="itemId" value={item.id} />
                    <input type="hidden" name="groupSlug" value={groupSlug} />
                    <input name="author" placeholder="名前" required maxLength={40} />
                    <input name="body" placeholder="修正依頼や補足コメント" required maxLength={500} />
                    <SubmitButton className="comment-submit-btn" idleText="投稿" pendingText="投稿中..." />
                  </form>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

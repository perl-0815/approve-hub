import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { AddApprovalItemModal } from "@/app/components/add-approval-item-modal";
import { ApprovalCheckbox } from "@/app/components/approval-checkbox";
import { EditApproverModal } from "@/app/components/edit-approver-modal";
import { EditGroupTitleModal } from "@/app/components/edit-group-title-modal";
import { ShareModal } from "@/app/components/share-modal";
import { SubmitButton } from "@/app/components/submit-button";
import { CheckCircleIcon, ClockIcon, CommentIcon } from "@/app/components/icons";
import { deleteInactiveGroupsExcept, touchGroup } from "@/app/lib/group-lifecycle";
import { addApprover, addComment } from "@/app/lib/actions";
import { prisma } from "@/app/lib/prisma";

type GroupPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default async function GroupPage({ params }: GroupPageProps) {
  const { slug } = await params;
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "localhost:3000";
  const proto = requestHeaders.get("x-forwarded-proto") ?? "https";
  const shareUrl = `${proto}://${host}/g/${slug}`;

  const group = await prisma.group.findUnique({
    where: { slug },
    include: {
      approvers: {
        orderBy: { createdAt: "asc" },
      },
      approvalItems: {
        orderBy: { createdAt: "desc" },
        include: {
          checks: {
            include: {
              approver: true,
            },
            orderBy: {
              approver: {
                createdAt: "asc",
              },
            },
          },
          comments: {
            orderBy: { createdAt: "asc" },
          },
        },
      },
    },
  });

  if (!group) notFound();
  await Promise.all([deleteInactiveGroupsExcept(group.id), touchGroup(group.id)]);
  const qrCodeDataUrl = await QRCode.toDataURL(shareUrl, {
    width: 180,
    margin: 1,
  });

  return (
    <main className="page">
      <section className="card compact">
        <div className="card-head">
          <Link href="/" className="back-link">
            ← トップに戻る
          </Link>
          <ShareModal shareUrl={shareUrl} qrCodeDataUrl={qrCodeDataUrl} />
        </div>
      </section>

      <section className="card">
        <div className="group-title-row">
          <h1 className="group-title-main">{group.title}</h1>
          <EditGroupTitleModal groupId={group.id} groupSlug={group.slug} currentTitle={group.title} />
        </div>

        <hr className="divider" />

        <h2>承認担当者</h2>
        <form action={addApprover} className="grid-form">
          <input type="hidden" name="groupId" value={group.id} />
          <input type="hidden" name="groupSlug" value={group.slug} />
          <div className="approver-inline-row">
            <label className="approver-name-label">
              <input name="name" placeholder="なまえ" required maxLength={40} />
            </label>
            <SubmitButton className="approver-add-btn" idleText="追加" pendingText="追加中..." />
          </div>
        </form>

        <div className="chips">
          {group.approvers.length === 0 && <p className="empty">追加するとここに表示されます</p>}
          {group.approvers.map((approver) => (
            <EditApproverModal key={approver.id} approverId={approver.id} groupSlug={group.slug} currentName={approver.name} />
          ))}
        </div>
      </section>

      <section className="card">
        <div className="timeline-head">
          <h2>承認タイムライン</h2>
          <AddApprovalItemModal groupId={group.id} groupSlug={group.slug} disabled={group.approvers.length === 0} />
        </div>
        {group.approvers.length === 0 ? (
          <p className="empty">先に承認担当者を追加してください。</p>
        ) : null}

        {group.approvalItems.length === 0 ? (
          <p className="empty">承認事項はまだありません。</p>
        ) : (
          <div className="timeline">
            {group.approvalItems.map((item) => {
              const approvedCount = item.checks.filter((check) => check.approved).length;
              const approved = item.checks.length > 0 && approvedCount === item.checks.length;

              return (
                <article key={item.id} className="timeline-item">
                  <div className="timeline-header">
                    <div>
                      <p className="item-title">{item.title}</p>
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
                        <ApprovalCheckbox checkId={check.id} groupSlug={group.slug} checked={check.approved} />
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
                      <input type="hidden" name="groupSlug" value={group.slug} />
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
    </main>
  );
}

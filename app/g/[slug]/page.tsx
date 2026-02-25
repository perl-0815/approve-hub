import type { Metadata } from "next";
import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { ApprovalTimeline } from "@/app/components/approval-timeline";
import { EditApproverModal } from "@/app/components/edit-approver-modal";
import { EditGroupTitleModal } from "@/app/components/edit-group-title-modal";
import { ShareModal } from "@/app/components/share-modal";
import { SubmitButton } from "@/app/components/submit-button";
import { deleteInactiveGroupsExcept, touchGroup } from "@/app/lib/group-lifecycle";
import { addApprover } from "@/app/lib/actions";
import { prisma } from "@/app/lib/prisma";

type GroupPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

async function getGroupForMeta(slug: string) {
  return prisma.group.findUnique({
    where: { slug },
    select: {
      title: true,
      _count: {
        select: {
          approvers: true,
          approvalItems: true,
        },
      },
    },
  });
}

export async function generateMetadata({ params }: GroupPageProps): Promise<Metadata> {
  const { slug } = await params;
  const group = await getGroupForMeta(slug);

  if (!group) {
    return {
      title: "グループが見つかりません",
      description: "指定されたグループは存在しないか、削除されています。",
    };
  }

  const description = `${group.title} の承認ページ。担当者${group._count.approvers}人、確認事項${group._count.approvalItems}件。`;

  return {
    title: group.title,
    description,
    alternates: {
      canonical: `/g/${slug}`,
    },
    openGraph: {
      type: "website",
      title: group.title,
      description,
      url: `/g/${slug}`,
      siteName: "Approve Hub",
      locale: "ja_JP",
    },
    twitter: {
      card: "summary",
      title: group.title,
      description,
    },
  };
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
            Approve Hub
          </Link>
          <ShareModal shareUrl={shareUrl} qrCodeDataUrl={qrCodeDataUrl} />
        </div>
      </section>

      <section className="card">
        <div className="group-title-row">
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

      <ApprovalTimeline
        groupId={group.id}
        groupSlug={group.slug}
        hasApprovers={group.approvers.length > 0}
        items={group.approvalItems.map((item) => ({
          id: item.id,
          title: item.title,
          requester: item.requester,
          details: item.details,
          createdAt: item.createdAt.toISOString(),
          checks: item.checks.map((check) => ({
            id: check.id,
            approved: check.approved,
            approver: {
              name: check.approver.name,
            },
          })),
          comments: item.comments.map((comment) => ({
            id: comment.id,
            author: comment.author,
            body: comment.body,
            createdAt: comment.createdAt.toISOString(),
          })),
        }))}
      />
    </main>
  );
}

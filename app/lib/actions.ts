"use server";

import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { touchGroup } from "@/app/lib/group-lifecycle";
import { prisma } from "@/app/lib/prisma";

function cleanText(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

async function generateUniqueSlug() {
  for (let i = 0; i < 10; i += 1) {
    const slug = randomBytes(4).toString("hex");
    const exists = await prisma.group.findUnique({ where: { slug } });
    if (!exists) {
      return slug;
    }
  }
  throw new Error("Failed to generate unique group slug");
}

export async function createGroup(formData: FormData) {
  const title = cleanText(formData.get("title"));
  if (!title) return null;

  const slug = await generateUniqueSlug();
  await prisma.group.create({
    data: {
      title,
      slug,
    },
  });

  revalidatePath("/");
  return slug;
}

export async function updateGroupTitle(formData: FormData) {
  const groupId = cleanText(formData.get("groupId"));
  const title = cleanText(formData.get("title"));

  if (!groupId || !title) return;

  await prisma.group.update({
    where: { id: groupId },
    data: { title },
  });
  await touchGroup(groupId);

  revalidatePath("/");
  revalidatePath(`/g/${cleanText(formData.get("groupSlug"))}`);
}

export async function addApprover(formData: FormData) {
  const groupId = cleanText(formData.get("groupId"));
  const groupSlug = cleanText(formData.get("groupSlug"));
  const name = cleanText(formData.get("name"));
  if (!groupId || !name) return;

  const approver = await prisma.approver.create({
    data: {
      groupId,
      name,
    },
    select: { id: true },
  });

  const items = await prisma.approvalItem.findMany({
    where: { groupId },
    select: { id: true },
  });

  if (items.length > 0) {
    await prisma.approvalCheck.createMany({
      data: items.map((item) => ({
        itemId: item.id,
        approverId: approver.id,
      })),
      skipDuplicates: true,
    });
  }

  await touchGroup(groupId);

  revalidatePath(`/g/${groupSlug}`);
}

export async function updateApproverName(formData: FormData) {
  const approverId = cleanText(formData.get("approverId"));
  const groupSlug = cleanText(formData.get("groupSlug"));
  const name = cleanText(formData.get("name"));

  if (!approverId || !name) return;

  const approver = await prisma.approver.update({
    where: { id: approverId },
    data: { name },
    select: { groupId: true },
  });
  await touchGroup(approver.groupId);

  revalidatePath(`/g/${groupSlug}`);
}

export async function deleteApprover(formData: FormData) {
  const approverId = cleanText(formData.get("approverId"));
  const groupSlug = cleanText(formData.get("groupSlug"));

  if (!approverId) return;

  const approver = await prisma.approver.delete({
    where: { id: approverId },
    select: { groupId: true },
  });
  await touchGroup(approver.groupId);

  revalidatePath(`/g/${groupSlug}`);
}

export async function createApprovalItem(formData: FormData) {
  const groupId = cleanText(formData.get("groupId"));
  const groupSlug = cleanText(formData.get("groupSlug"));
  const title = cleanText(formData.get("title"));
  const requester = cleanText(formData.get("requester"));
  const details = cleanText(formData.get("details"));

  if (!groupId || !title || !details) return;

  const approvers = await prisma.approver.findMany({
    where: { groupId },
    select: { id: true },
  });

  if (approvers.length === 0) return;

  await prisma.approvalItem.create({
    data: {
      groupId,
      title,
      requester: requester || null,
      details,
      checks: {
        create: approvers.map((approver) => ({
          approverId: approver.id,
        })),
      },
    },
  });
  await touchGroup(groupId);

  revalidatePath(`/g/${groupSlug}`);
}

export async function toggleApproval(formData: FormData) {
  const checkId = cleanText(formData.get("checkId"));
  const groupSlug = cleanText(formData.get("groupSlug"));
  const approved = cleanText(formData.get("approved")) === "true";

  if (!checkId) return;

  const check = await prisma.approvalCheck.update({
    where: { id: checkId },
    data: {
      approved,
      approvedAt: approved ? new Date() : null,
    },
    select: {
      item: {
        select: {
          groupId: true,
        },
      },
    },
  });
  await touchGroup(check.item.groupId);

  revalidatePath(`/g/${groupSlug}`);
}

export async function addComment(formData: FormData) {
  const itemId = cleanText(formData.get("itemId"));
  const groupSlug = cleanText(formData.get("groupSlug"));
  const author = cleanText(formData.get("author"));
  const body = cleanText(formData.get("body"));

  if (!itemId || !author || !body) return;

  const comment = await prisma.comment.create({
    data: {
      itemId,
      author,
      body,
    },
    select: {
      item: {
        select: {
          groupId: true,
        },
      },
    },
  });
  await touchGroup(comment.item.groupId);

  revalidatePath(`/g/${groupSlug}`);
}

import { prisma } from "@/app/lib/prisma";

const INACTIVE_DAYS = 30;

function getExpirationDate() {
  const now = new Date();
  now.setDate(now.getDate() - INACTIVE_DAYS);
  return now;
}

function isMissingLastActiveAtError(error: unknown) {
  if (!(error instanceof Error)) return false;
  return error.message.includes("Unknown argument `lastActiveAt`");
}

export async function deleteInactiveGroups() {
  try {
    await prisma.group.deleteMany({
      where: {
        lastActiveAt: {
          lt: getExpirationDate(),
        },
      },
    });
  } catch (error) {
    if (!isMissingLastActiveAtError(error)) throw error;
    await prisma.group.deleteMany({
      where: {
        createdAt: {
          lt: getExpirationDate(),
        },
      },
    });
  }
}

export async function touchGroup(groupId: string) {
  try {
    await prisma.group.update({
      where: { id: groupId },
      data: { lastActiveAt: new Date() },
    });
  } catch (error) {
    if (!isMissingLastActiveAtError(error)) throw error;
  }
}

export async function deleteInactiveGroupsExcept(preserveGroupId: string) {
  try {
    await prisma.group.deleteMany({
      where: {
        id: { not: preserveGroupId },
        lastActiveAt: {
          lt: getExpirationDate(),
        },
      },
    });
  } catch (error) {
    if (!isMissingLastActiveAtError(error)) throw error;
    await prisma.group.deleteMany({
      where: {
        id: { not: preserveGroupId },
        createdAt: {
          lt: getExpirationDate(),
        },
      },
    });
  }
}

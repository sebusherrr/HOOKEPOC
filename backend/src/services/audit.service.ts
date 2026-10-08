import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';

/** Every write path that matters calls this. Keep metadata minimal — no full request bodies,
 *  no sensitive field values — per the data-minimisation rule in docs/security.md. */
export async function writeAudit(
  actorId: string | null,
  action: string,
  targetType?: string,
  targetId?: string,
  metadata: Prisma.InputJsonValue = {}
) {
  await prisma.auditLog.create({
    data: { actorId: actorId ?? undefined, action, targetType, targetId, metadata },
  });
}

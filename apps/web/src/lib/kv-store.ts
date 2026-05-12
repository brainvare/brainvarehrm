import prisma from '@/lib/prisma';
import { getOrgId } from '@/lib/org';

export async function kvList<T = any>(namespace: string): Promise<T[]> {
  const orgId = await getOrgId();
  const rows = await prisma.kvRecord.findMany({
    where: { namespace, organizationId: orgId },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map((r) => ({ id: r.id, ...(JSON.parse(r.data) as object) })) as T[];
}

export async function kvCreate(namespace: string, payload: Record<string, any>) {
  const orgId = await getOrgId();
  // Strip any caller-supplied id so we use the cuid
  const { id: _ignored, ...rest } = payload;
  void _ignored;
  const row = await prisma.kvRecord.create({
    data: { namespace, organizationId: orgId, data: JSON.stringify(rest) },
  });
  return { id: row.id, ...rest };
}

export async function kvUpdate(namespace: string, id: string, patch: Record<string, any>) {
  const orgId = await getOrgId();
  const existing = await prisma.kvRecord.findFirst({
    where: { id, namespace, organizationId: orgId },
  });
  if (!existing) return null;
  const merged = { ...JSON.parse(existing.data), ...patch };
  delete merged.id;
  await prisma.kvRecord.update({
    where: { id },
    data: { data: JSON.stringify(merged) },
  });
  return { id, ...merged };
}

export async function kvDelete(namespace: string, id: string) {
  const orgId = await getOrgId();
  const existing = await prisma.kvRecord.findFirst({
    where: { id, namespace, organizationId: orgId },
  });
  if (!existing) return false;
  await prisma.kvRecord.delete({ where: { id } });
  return true;
}

export async function kvSeedOnce(namespace: string, items: Record<string, any>[]) {
  const orgId = await getOrgId();
  const count = await prisma.kvRecord.count({
    where: { namespace, organizationId: orgId },
  });
  if (count > 0) return;
  for (const item of items) {
    const { id: _ignored, ...rest } = item;
    void _ignored;
    await prisma.kvRecord.create({
      data: { namespace, organizationId: orgId, data: JSON.stringify(rest) },
    });
  }
}

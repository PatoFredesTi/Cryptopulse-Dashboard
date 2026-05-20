import type { BackendMode, CloudSnapshot, CloudSyncResult } from '../types/backend';

const SYNC_ENDPOINT = '/sync-state';

function wait(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export async function syncCloudSnapshot({
  mode,
  endpoint,
  snapshot,
}: {
  mode: BackendMode;
  endpoint: string | null;
  snapshot: CloudSnapshot;
}): Promise<CloudSyncResult> {
  const syncedAt = new Date().toISOString();

  if (mode === 'mock' || !endpoint) {
    await wait(450);
    return {
      ok: true,
      mode: 'mock',
      syncedAt,
      snapshot,
      message: 'Local mock sync completed. Ready to replace with API Gateway + Lambda.',
    };
  }

  const response = await fetch(`${endpoint.replace(/\/$/, '')}${SYNC_ENDPOINT}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(snapshot),
  });

  if (!response.ok) {
    throw new Error(`Backend sync failed with status ${response.status}`);
  }

  return {
    ok: true,
    mode: 'api',
    syncedAt,
    snapshot,
    message: 'Cloud API sync completed successfully.',
  };
}

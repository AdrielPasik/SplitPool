/**
 * Filecoin/IPFS Fetch Utilities
 * 
 * Obtiene metadata almacenada en Filecoin/IPFS
 */

// Gateways IPFS públicos (fallback)
const IPFS_GATEWAYS = [
  'https://w3s.link/ipfs',
  'https://ipfs.io/ipfs',
  'https://cloudflare-ipfs.com/ipfs',
  'https://gateway.pinata.cloud/ipfs',
];

interface FetchOptions {
  timeout?: number;
  retries?: number;
  gateway?: string;
}

/**
 * Fetch metadata desde IPFS/Filecoin
 */
export async function fetchFromFilecoin<T = any>(
  cid: string,
  options: FetchOptions = {}
): Promise<T | null> {
  const {
    timeout = 10000,
    retries = 3,
    gateway = IPFS_GATEWAYS[0],
  } = options;

  const url = `${gateway}/${cid}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(url, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error(`Failed to fetch from ${url}:`, error);

    // Retry con siguiente gateway
    if (retries > 0) {
      const nextGatewayIndex = IPFS_GATEWAYS.indexOf(gateway) + 1;
      if (nextGatewayIndex < IPFS_GATEWAYS.length) {
        return fetchFromFilecoin<T>(cid, {
          ...options,
          retries: retries - 1,
          gateway: IPFS_GATEWAYS[nextGatewayIndex],
        });
      }
    }

    return null;
  }
}

/**
 * Fetch metadata de grupo
 */
export async function fetchGroupMetadata(cid: string) {
  return fetchFromFilecoin<{
    name: string;
    description?: string;
    avatar?: string;
    createdAt: number;
    members?: Array<{
      address: string;
      name?: string;
    }>;
  }>(cid);
}

/**
 * Fetch metadata de pool
 */
export async function fetchPoolMetadata(cid: string) {
  return fetchFromFilecoin<{
    merchantName: string;
    description?: string;
    category?: string;
    createdAt: number;
  }>(cid);
}

/**
 * Fetch metadata de gasto
 */
export async function fetchExpenseMetadata(cid: string) {
  return fetchFromFilecoin<{
    title: string;
    description?: string;
    category?: string;
    receiptImage?: string;
    createdAt: number;
  }>(cid);
}

/**
 * Convierte pointer (uint256) a CID
 * En StoragePointer.sol, el CID se guarda como string
 * Este helper es para cuando se use keccak256(cid) como pointer
 */
export function pointerToCid(pointer: bigint): string {
  // Si el pointer es un keccak256 hash, necesitarías un mapping
  // Por ahora, asumimos que el pointer ES el CID o lo obtienes del contrato
  return pointer.toString();
}

/**
 * Resuelve URL de IPFS a gateway HTTP
 */
export function resolveIPFSUrl(
  ipfsUrl: string,
  gateway: string = IPFS_GATEWAYS[0]
): string {
  if (ipfsUrl.startsWith('ipfs://')) {
    const cid = ipfsUrl.replace('ipfs://', '');
    return `${gateway}/${cid}`;
  }
  return ipfsUrl;
}

/**
 * Valida CID de IPFS
 */
export function isValidCID(cid: string): boolean {
  // CIDv0: 46 caracteres empezando con Qm
  // CIDv1: empieza con bafy, bafk, etc.
  return /^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(cid) || 
         /^bafy[0-9a-z]{52}$/.test(cid) ||
         /^bafk[0-9a-z]{52}$/.test(cid);
}

/**
 * Cache en memoria para metadata frecuente
 */
const metadataCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export async function fetchFromFilecoinCached<T = any>(
  cid: string,
  options?: FetchOptions
): Promise<T | null> {
  const cached = metadataCache.get(cid);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data as T;
  }

  const data = await fetchFromFilecoin<T>(cid, options);
  
  if (data) {
    metadataCache.set(cid, { data, timestamp: Date.now() });
  }

  return data;
}

/**
 * Clear cache
 */
export function clearMetadataCache() {
  metadataCache.clear();
}
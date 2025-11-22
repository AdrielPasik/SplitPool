/**
 * Filecoin/IPFS Upload Utilities
 * 
 * Opciones de implementación:
 * 1. Web3.Storage (recomendado)
 * 2. NFT.Storage
 * 3. Pinata
 * 4. Lighthouse.storage
 */

interface UploadResult {
  cid: string;
  url: string;
  gateway: string;
}

interface GroupMetadata {
  name: string;
  description?: string;
  avatar?: string;
  createdAt: number;
  members?: Array<{
    address: string;
    name?: string;
  }>;
}

interface PoolMetadata {
  merchantName: string;
  description?: string;
  category?: string;
  createdAt: number;
}

interface ExpenseMetadata {
  title: string;
  description?: string;
  category?: string;
  receiptImage?: string;
  createdAt: number;
}

/**
 * Upload metadata to Filecoin/IPFS using Web3.Storage
 * Requiere API key de https://web3.storage/
 */
export async function uploadToFilecoin(
  data: GroupMetadata | PoolMetadata | ExpenseMetadata
): Promise<UploadResult> {
  const apiKey = process.env.EXPO_PUBLIC_WEB3_STORAGE_API_KEY;
  
  if (!apiKey) {
    throw new Error('Web3.Storage API key not configured');
  }

  try {
    // Crear blob con metadata JSON
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const file = new File([blob], 'metadata.json');

    // Upload a Web3.Storage
    const formData = new FormData();
    formData.append('file', file as any);

    const response = await fetch('https://api.web3.storage/upload', {
      method: 'POST',
      headers: {
        Authorization: Bearer ${apiKey},
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(Upload failed: ${response.statusText});
    }

    const result = await response.json();
    const cid = result.cid;

    return {
      cid,
      url: ipfs://${cid},
      gateway: https://${cid}.ipfs.w3s.link,
    };
  } catch (error) {
    console.error('Failed to upload to Filecoin:', error);
    throw error;
  }
}

/**
 * Upload imagen a Filecoin/IPFS
 */
export async function uploadImageToFilecoin(
  imageUri: string,
  filename: string = 'image.jpg'
): Promise<UploadResult> {
  const apiKey = process.env.EXPO_PUBLIC_WEB3_STORAGE_API_KEY;
  
  if (!apiKey) {
    throw new Error('Web3.Storage API key not configured');
  }

  try {
    // Fetch image como blob
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const file = new File([blob], filename);

    const formData = new FormData();
    formData.append('file', file as any);

    const uploadResponse = await fetch('https://api.web3.storage/upload', {
      method: 'POST',
      headers: {
        Authorization: Bearer ${apiKey},
      },
      body: formData,
    });

    if (!uploadResponse.ok) {
      throw new Error(Upload failed: ${uploadResponse.statusText});
    }

    const result = await uploadResponse.json();
    const cid = result.cid;

    return {
      cid,
      url: ipfs://${cid},
      gateway: https://${cid}.ipfs.w3s.link,
    };
  } catch (error) {
    console.error('Failed to upload image to Filecoin:', error);
    throw error;
  }
}

/**
 * Helper para crear metadata de grupo
 */
export function createGroupMetadata(
  name: string,
  description?: string,
  avatar?: string
): GroupMetadata {
  return {
    name,
    description,
    avatar,
    createdAt: Date.now(),
  };
}

/**
 * Helper para crear metadata de pool
 */
export function createPoolMetadata(
  merchantName: string,
  description?: string,
  category?: string
): PoolMetadata {
  return {
    merchantName,
    description,
    category,
    createdAt: Date.now(),
  };
}

/**
 * Helper para crear metadata de gasto
 */
export function createExpenseMetadata(
  title: string,
  description?: string,
  category?: string,
  receiptImage?: string
): ExpenseMetadata {
  return {
    title,
    description,
    category,
    receiptImage,
    createdAt: Date.now(),
  };
}

/**
 * Mock upload para desarrollo sin API key
 */
export async function mockUploadToFilecoin(
  data: any
): Promise<UploadResult> {
  // Simular delay de red
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  // Generar CID mock
  const mockCid = bafybei${Math.random().toString(36).substring(2, 15)};
  
  console.log('🔶 Mock upload:', data);
  
  return {
    cid: mockCid,
    url: ipfs://${mockCid},
    gateway: https://${mockCid}.ipfs.w3s.link,
  };
}

/**
 * Switch entre mock y real basado en configuración
 */
export const uploadMetadata = process.env.EXPO_PUBLIC_WEB3_STORAGE_API_KEY
  ? uploadToFilecoin
  : mockUploadToFilecoin;
import type { Address } from '../../types/models';

/**
 * Formatea una dirección Ethereum para mostrar
 * @param address - Dirección completa 0x...
 * @param chars - Número de caracteres a mostrar al inicio y fin (default: 4)
 * @returns Dirección formateada (ej: 0x1234...5678)
 */
export function formatAddress(address: Address | string, chars: number = 4): string {
  if (!address) return '';
  
  if (address.length <= chars * 2 + 2) {
    return address;
  }
  
  return `${address.substring(0, chars + 2)}...${address.substring(address.length - chars)}`;
}

/**
 * Formatea un monto en Wei a ETH con decimales
 * @param wei - Monto en Wei (bigint)
 * @param decimals - Número de decimales a mostrar (default: 4)
 * @returns String formateado con " ETH"
 */
export function formatBalance(wei: bigint, decimals: number = 4): string {
  const eth = Number(wei) / 1e18;
  
  if (eth === 0) return '0 ETH';
  
  // Para cantidades muy pequeñas, mostrar en Wei
  if (Math.abs(eth) < 0.0001) {
    return `${wei.toString()} Wei`;
  }
  
  return `${eth.toFixed(decimals).replace(/\.?0+$/, '')} ETH`;
}

/**
 * Formatea un monto como moneda (con símbolo ETH)
 * @param wei - Monto en Wei (bigint)
 * @returns String formateado con símbolo
 */
export function formatCurrency(wei: bigint | number): string {
  const weiValue = typeof wei === 'number' ? BigInt(wei) : wei;
  return formatBalance(weiValue, 4);
}

/**
 * Convierte input de usuario (string) a Wei (bigint)
 * @param amount - String con el monto (ej: "0.5")
 * @returns Monto en Wei como bigint
 */
export function parseInputAmount(amount: string): bigint {
  if (!amount || amount.trim() === '') return 0n;
  
  try {
    const num = parseFloat(amount);
    if (isNaN(num) || !isFinite(num)) return 0n;
    
    // Convertir a Wei (18 decimales)
    const wei = Math.floor(num * 1e18);
    return BigInt(wei);
  } catch {
    return 0n;
  }
}

/**
 * Formatea un porcentaje
 * @param value - Valor entre 0 y 1
 * @param decimals - Decimales a mostrar (default: 0)
 * @returns String con porcentaje (ej: "75%")
 */
export function formatPercentage(value: number, decimals: number = 0): string {
  const percent = value * 100;
  return `${percent.toFixed(decimals)}%`;
}

/**
 * Formatea una fecha/timestamp
 * @param timestamp - Unix timestamp en ms o segundos
 * @returns String formateado (ej: "Jan 15, 2024")
 */
export function formatDate(timestamp: number): string {
  // Si el timestamp es en segundos, convertir a ms
  const ts = timestamp < 1e12 ? timestamp * 1000 : timestamp;
  
  const date = new Date(ts);
  
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

/**
 * Formatea fecha relativa (hace X tiempo)
 * @param timestamp - Unix timestamp en ms o segundos
 * @returns String relativo (ej: "2 hours ago")
 */
export function formatRelativeTime(timestamp: number): string {
  const ts = timestamp < 1e12 ? timestamp * 1000 : timestamp;
  const now = Date.now();
  const diff = now - ts;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 7) {
    return formatDate(timestamp);
  } else if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
}

/**
 * Formatea un número grande con separadores
 * @param num - Número a formatear
 * @returns String con separadores de miles (ej: "1,234,567")
 */
export function formatNumber(num: number | bigint): string {
  const value = typeof num === 'bigint' ? Number(num) : num;
  return new Intl.NumberFormat('en-US').format(value);
}

/**
 * Trunca texto con ellipsis
 * @param text - Texto a truncar
 * @param maxLength - Longitud máxima
 * @returns Texto truncado
 */
export function truncateText(text: string, maxLength: number = 50): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Formatea un hash de transacción
 * @param hash - Hash de transacción
 * @returns Hash formateado (ej: 0x1234...5678)
 */
export function formatTxHash(hash: string): string {
  return formatAddress(hash as Address, 6);
}

/**
 * Obtiene URL del explorador de bloques para una dirección
 * @param address - Dirección o hash
 * @param type - Tipo de entidad ('address' | 'tx')
 * @returns URL completa del explorador
 */
export function getBlockExplorerUrl(
  address: string, 
  type: 'address' | 'tx' = 'address'
): string {
  const baseUrl = 'https://sepolia.basescan.org';
  return `${baseUrl}/${type}/${address}`;
}

/**
 * Valida y limpia input de monto
 * @param input - Input del usuario
 * @returns String limpio o vacío si inválido
 */
export function cleanAmountInput(input: string): string {
  // Remover caracteres no numéricos excepto punto
  let clean = input.replace(/[^0-9.]/g, '');
  
  // Asegurar solo un punto decimal
  const parts = clean.split('.');
  if (parts.length > 2) {
    clean = parts[0] + '.' + parts.slice(1).join('');
  }
  
  // Limitar decimales a 18 (ETH)
  if (parts.length === 2 && parts[1].length > 18) {
    clean = parts[0] + '.' + parts[1].substring(0, 18);
  }
  
  return clean;
}
export const toast = (m: string) => { if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('toast', { detail: m })) }

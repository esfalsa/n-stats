import { writable } from 'svelte/store';

export const nations = writable<string[]>([]);
export const userAgent = writable('');

// Scales are just an approximation for now.
// TODO: Need to move to better pixel measurement for the font.
export const X_SCALE = 13;
export const Y_SCALE = 30;
export const PLATFORM = navigator?.platform || 'unknown';
export const IS_PLATFORM_MAC = PLATFORM.toLowerCase().startsWith('mac');
export const DRAGGING_THRESHOLD = 10; // pixels

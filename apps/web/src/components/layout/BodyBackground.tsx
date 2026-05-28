import { CosmicBg } from '@/components/CosmicBg';

/**
 * BodyBackground — delegates to CosmicBg for the full-viewport starfield.
 * Replaces previous sumi-mountain static image background.
 */
export default function BodyBackground() {
  return <CosmicBg intensity="low" />;
}

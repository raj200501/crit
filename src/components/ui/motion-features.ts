// Loaded lazily by MotionProvider. domAnimation (animations, exit, hover/tap/focus, in-view) is all the app uses: the
// active-item indicators glide with a WAAPI FLIP (ui/useGlide.ts), so the layout/drag features (domMax, ~42 KB gzip)
// never ship. Don't add `layout` / `layoutId` / `drag` props: under domAnimation they silently do nothing.
export { domAnimation as default } from "motion/react";

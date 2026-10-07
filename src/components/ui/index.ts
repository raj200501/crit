// Shared primitives (DESIGN §6). Owned by P1; other packages request changes.
// Tip: in client components prefer direct imports ("@/components/ui/Button") to keep bundles lean.
export { cn } from "./cn";
export { EASE, DUR, SPRING, STAGGER, prefersReducedMotion } from "./motion";
export { useMediaQuery } from "./useMediaQuery";
export { MotionProvider } from "./MotionProvider";
export { InlineScript } from "./InlineScript";
export { PresentModeHotkey } from "./PresentMode";
export { SkipLink } from "./SkipLink";
export { HydrationMark } from "./HydrationMark";
export { Toaster, toast, dismissToast, type ToastOptions } from "./Toast";

export { Container, type ContainerProps } from "./Container";
export { Section, type SectionProps, type SectionTheme } from "./Section";
export { Eyebrow } from "./Eyebrow";
export { SectionHeading, type SectionHeadingProps } from "./SectionHeading";
export { TextReveal, type TextRevealProps } from "./TextReveal";
export { Reveal, type RevealProps } from "./Reveal";
export { Cite } from "./Cite";
export { SourceTag } from "./SourceTag";
export { Kbd } from "./Kbd";

export { HonestyRibbon } from "./HonestyRibbon";
export { Button, buttonClasses, type ButtonProps, type ButtonVariant, type ButtonSize } from "./Button";
export { IconButton, type IconButtonProps } from "./IconButton";
export { Badge, type BadgeProps } from "./Badge";
export { StatusPill, type StatusPillProps } from "./StatusPill";
export { SourceChip, sourceChipText, type SourceChipProps, type SourceKind } from "./SourceChip";
export { PedigreeGlyph, shapeForSex, type PedigreeGlyphProps, type GlyphShape, type GlyphStatus, type GlyphTone } from "./PedigreeGlyph";
export { StatusLegend, type StatusLegendProps, type LegendItem } from "./StatusLegend";
export { STATUS_LABEL, STATUS_LABEL_CLINICAL, STATUS_ICON, STATUS_CHIP, STATUS_TEXT, type UiStatus } from "./status";

export { Card, type CardProps, type CardTier } from "./Card";
export { SpotlightCard, type SpotlightCardProps } from "./SpotlightCard";
export { BorderBeam, type BorderBeamProps } from "./BorderBeam";
export { ProductFrame, type ProductFrameProps } from "./ProductFrame";
export { PhoneFrame, type PhoneFrameProps } from "./PhoneFrame";
export { Marquee, type MarqueeProps } from "./Marquee";
export { StatTicker, type StatTickerProps } from "./StatTicker";
export { FlowDiagram, type FlowDiagramProps, type FlowNode, type FlowEdge } from "./FlowDiagram";
export { Accordion, type AccordionProps } from "./Accordion";
export { Popover, type PopoverProps } from "./Popover";
export { ICONS, iconFor, type IconName } from "./iconMap";

export { Field, type FieldProps } from "./Field";
export { Input, Textarea, Select, inputClasses, type SelectProps } from "./Input";
export { Checkbox, type CheckboxProps } from "./Checkbox";
export { CheckboxCard, type CheckboxCardProps } from "./CheckboxCard";
export { RadioSegment, type RadioSegmentProps } from "./RadioSegment";
export { SegmentedControl, type SegmentedControlProps } from "./SegmentedControl";
export { Switch, type SwitchProps } from "./Switch";
export { Sheet, type SheetProps } from "./Sheet";
export { StickyActionBar } from "./StickyActionBar";

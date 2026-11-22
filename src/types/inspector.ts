export interface ElementBoxModel {
  margin: { top: number; right: number; bottom: number; left: number };
  padding: { top: number; right: number; bottom: number; left: number };
  border: { top: number; right: number; bottom: number; left: number };
  content: { width: number; height: number };
}

export interface TypographyInfo {
  fontFamily: string;
  fontSize: string;
  fontWeight: string;
  fontStyle: string;
  lineHeight: string;
  letterSpacing: string;
  textAlign: string;
  textTransform: string;
  textDecoration: string;
  textColor: string;
}

export interface ColorEntry {
  property: string;
  raw: string;
  hex: string;
  rgb: string;
  hsl: string;
  isTransparentOrNone: boolean;
  isGradientOrImage?: boolean;
}

export interface SpacingLayoutInfo {
  margin: string;
  padding: string;
  gap: string;
  rowGap: string;
  columnGap: string;
  borderRadius: string;
  borderWidth: string;
  borderStyle: string;
  borderColor: string;
  width: string;
  height: string;
  minWidth: string;
  maxWidth: string;
  minHeight: string;
  maxHeight: string;
  display: string;
  flexDirection?: string;
  justifyContent?: string;
  alignItems?: string;
  flexWrap?: string;
  gridTemplateColumns?: string;
  gridTemplateRows?: string;
  boxSizing: string;
  boxModel: ElementBoxModel;
}

export interface ResponsiveInfo {
  viewportWidth: number;
  viewportHeight: number;
  devicePixelRatio: number;
  scrollX: number;
  scrollY: number;
  url: string;
}

export interface InspectedElementData {
  tagName: string;
  id: string;
  classList: string[];
  selector: string;
  dimensions: {
    width: number;
    height: number;
  };
  position: {
    x: number;
    y: number;
    top: number;
    left: number;
  };
  display: string;
  positionType: string;
  visibility: string;
  zIndex: string;
  opacity: string;
  htmlSnippet: string;
  isSvg: boolean;
  isInIframe: boolean;

  typography: TypographyInfo;
  colors: ColorEntry[];
  spacing: SpacingLayoutInfo;
  computedCss: Record<string, string>;
  inlineStyles: Record<string, string>;
  responsive: ResponsiveInfo;
  timestamp: number;
}

export type InspectionMessage =
  | { type: 'START_INSPECTION' }
  | { type: 'STOP_INSPECTION' }
  | { type: 'GET_INSPECTION_STATUS' }
  | { type: 'INSPECTION_STATUS_RESPONSE'; isInspecting: boolean }
  | { type: 'ELEMENT_SELECTED'; data: InspectedElementData }
  | { type: 'CLOSE_INSPECTOR_OVERLAY' }
  | { type: 'TAB_UPDATED' };

export interface RecentInspectionItem {
  id: string;
  selector: string;
  tagName: string;
  timestamp: number;
  url: string;
  data: InspectedElementData;
}


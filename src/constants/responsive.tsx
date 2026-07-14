import React, {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AccessibilityInfo,
  Dimensions,
  type ImageStyle,
  PixelRatio,
  Platform,
  ScaledSize,
  StyleSheet,
  type TextStyle,
  useWindowDimensions,
  type ViewStyle,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

type AnyStyle = ViewStyle | TextStyle | ImageStyle;

const PHONE_BASELINE = { width: 375, height: 812 };
const TABLET_BASELINE = { width: 768, height: 1024 };

function getWindow(): ScaledSize {
  return Dimensions.get("window");
}

function isTabletLike(window: ScaledSize) {
  const minDim = Math.min(window.width, window.height);
  return minDim >= 600;
}

let windowMetrics = getWindow();
let baseline = isTabletLike(windowMetrics) ? TABLET_BASELINE : PHONE_BASELINE;
let widthScale = windowMetrics.width / baseline.width;
let heightScale = windowMetrics.height / baseline.height;
let avgScale = (widthScale + heightScale) / 2;

if (typeof Dimensions.addEventListener === "function") {
  Dimensions.addEventListener("change", ({ window }) => {
    windowMetrics = window;
    baseline = isTabletLike(windowMetrics) ? TABLET_BASELINE : PHONE_BASELINE;
    widthScale = windowMetrics.width / baseline.width;
    heightScale = windowMetrics.height / baseline.height;
    avgScale = (widthScale + heightScale) / 2;
  });
}

export function deviceWidth() {
  return windowMetrics.width;
}

export function deviceHeight() {
  return windowMetrics.height;
}

export function toWidth(percent: number) {
  return (deviceWidth() * percent) / 100;
}

export function toHeight(percent: number) {
  return (deviceHeight() * percent) / 100;
}

export function getResWidth(value: number) {
  return PixelRatio.roundToNearestPixel(value * widthScale);
}

export function getResHeight(value: number) {
  return PixelRatio.roundToNearestPixel(value * heightScale);
}

export function getResFont(value: number) {
  const fontScale = PixelRatio.getFontScale();
  const scaled = value * Math.min(widthScale, heightScale);
  return PixelRatio.roundToNearestPixel(scaled / fontScale);
}

function getResBorder(value: number) {
  const gentle = Math.max(0.85, Math.min(1.15, avgScale));
  return PixelRatio.roundToNearestPixel(value * gentle);
}

const DO_NOT_SCALE_KEYS = new Set([
  "flex",
  "flexGrow",
  "flexShrink",
  "flexBasis",
  "opacity",
  "zIndex",
  "aspectRatio",
  "shadowOpacity",
  "shadowRadius",
  "elevation",
]);

function scaleNumberForProp(prop: string, value: number) {
  if (DO_NOT_SCALE_KEYS.has(prop)) return value;

  if (
    prop === "fontSize" ||
    prop === "lineHeight" ||
    prop === "letterSpacing"
  ) {
    return getResFont(value);
  }

  if (prop.includes("border") && prop.endsWith("Width")) {
    return getResBorder(value);
  }
  if (prop === "borderRadius") {
    return PixelRatio.roundToNearestPixel(
      value * Math.min(widthScale, heightScale),
    );
  }

  const isHorizontal =
    prop === "width" ||
    prop === "minWidth" ||
    prop === "maxWidth" ||
    prop === "left" ||
    prop === "right" ||
    prop.endsWith("Left") ||
    prop.endsWith("Right") ||
    prop.endsWith("Horizontal");

  const isVertical =
    prop === "height" ||
    prop === "minHeight" ||
    prop === "maxHeight" ||
    prop === "top" ||
    prop === "bottom" ||
    prop.endsWith("Top") ||
    prop.endsWith("Bottom") ||
    prop.endsWith("Vertical");

  if (
    prop.startsWith("margin") ||
    prop.startsWith("padding") ||
    prop === "gap" ||
    prop === "rowGap" ||
    prop === "columnGap"
  ) {
    if (isHorizontal) return getResWidth(value);
    if (isVertical) return getResHeight(value);
    return PixelRatio.roundToNearestPixel(value * avgScale);
  }

  if (isHorizontal) return getResWidth(value);
  if (isVertical) return getResHeight(value);

  return PixelRatio.roundToNearestPixel(value * avgScale);
}

function scaleStyleObject(
  style: Record<string, unknown>,
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(style)) {
    if (typeof val === "number") {
      out[key] = scaleNumberForProp(key, val);
      continue;
    }
    if (val && typeof val === "object" && !Array.isArray(val)) {
      out[key] = scaleStyleObject(val as Record<string, unknown>);
      continue;
    }
    out[key] = val;
  }
  return out;
}

export const AppStyleSheet = {
  create<T extends NamedStyles<T>>(styles: T | NamedStyles<T>): T {
    const scaled: Record<string, AnyStyle> = {};
    for (const [name, style] of Object.entries(styles)) {
      if (style && typeof style === "object" && !Array.isArray(style)) {
        scaled[name] = scaleStyleObject(
          style as Record<string, unknown>,
        ) as AnyStyle;
      } else {
        scaled[name] = style as AnyStyle;
      }
    }
    return StyleSheet.create(scaled as T);
  },
};

// Original responsive utilities (from git history)
const BASE_WIDTH = 393;
const BASE_HEIGHT = 852;
const MAX_SCALE = 1.25;
const MIN_SCALE = 0.75;

export interface ColorPalette {
  background: string;
  surface: string;
  surfaceElevated: string;
  border: string;
  text: string;
  textSecondary: string;
  textDisabled: string;
  primary: string;
  primaryLight: string;
  primaryDark: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  overlay: string;
}

export interface TypographyScale {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
  hero: number;
}

export interface SpacingScale {
  xxs: number;
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  xxl: number;
}

export interface RadiusScale {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
  full: number;
}

export interface ShadowToken {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
}

export interface Theme {
  colors: ColorPalette;
  shadows: {
    sm: ShadowToken;
    md: ShadowToken;
    lg: ShadowToken;
  };
}

export interface ScaleFunctions {
  wp: (size: number) => number;
  hp: (size: number) => number;
  ms: (size: number, factor?: number) => number;
  fp: (size: number) => number;
}

export interface DeviceInfo {
  isTablet: boolean;
  isSmallPhone: boolean;
  isLandscape: boolean;
  IS_IOS: boolean;
  IS_ANDROID: boolean;
}

export interface ScreenInfo {
  width: number;
  height: number;
}

export interface LayoutTokens {
  spacing: SpacingScale;
  fontSizes: TypographyScale;
  radius: RadiusScale;
  containerMaxWidth: number | undefined;
}

export interface ResponsiveReturn
  extends ScaleFunctions, DeviceInfo, LayoutTokens {
  SCREEN: ScreenInfo;
  insets: ReturnType<typeof useSafeAreaInsets>;
  rowOnTablet: "row" | "column";
}

const APP_THEME: Theme = {
  colors: {
    background: "#FFFFFF",
    surface: "#F7F8FA",
    surfaceElevated: "#FFFFFF",
    border: "#E4E6EB",
    text: "#0D0F12",
    textSecondary: "#5A6272",
    textDisabled: "#ABAFC7",
    primary: "#4361EE",
    primaryLight: "#6E87F4",
    primaryDark: "#2B45D4",
    success: "#22C55E",
    warning: "#F59E0B",
    error: "#EF4444",
    info: "#3B82F6",
    overlay: "rgba(0,0,0,0.45)",
  },
  shadows: {
    sm: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
      elevation: 2,
    },
    md: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.09,
      shadowRadius: 8,
      elevation: 5,
    },
    lg: {
      shadowColor: "#000000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.12,
      shadowRadius: 20,
      elevation: 10,
    },
  },
};

const initialWindow = Dimensions.get("window");
const initialWidth = initialWindow.width;
const initialHeight = initialWindow.height;
const initialWRatio = initialWidth / BASE_WIDTH;
const initialHRatio = initialHeight / BASE_HEIGHT;
const initialBaseScale = Math.min(
  Math.max(Math.min(initialWRatio, initialHRatio), MIN_SCALE),
  MAX_SCALE,
);

export const staticWp = (size: number): number =>
  PixelRatio.roundToNearestPixel(size * initialWRatio);

export const staticHp = (size: number): number =>
  PixelRatio.roundToNearestPixel(size * initialHRatio);

export const staticMs = (size: number, factor = 0.5): number =>
  PixelRatio.roundToNearestPixel(
    size + (initialBaseScale * size - size) * factor,
  );

export const staticFp = (size: number): number => {
  const scaled = size * initialBaseScale;
  return Math.round(
    PixelRatio.roundToNearestPixel(scaled) / PixelRatio.getFontScale(),
  );
};

export const scale = {
  wp: staticWp,
  hp: staticHp,
  ms: staticMs,
  fp: staticFp,
};

interface A11yContextValue {
  reduceMotion: boolean;
  boldText: boolean;
  fontScaleFactor: number;
}

const A11yContext = createContext<A11yContextValue>({
  reduceMotion: false,
  boldText: false,
  fontScaleFactor: 1,
});

const ResponsiveContext = createContext<ResponsiveReturn | null>(null);

const A11yProvider = ({ children }: { children: ReactNode }) => {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [boldText, setBoldText] = useState(false);

  useEffect(() => {
    let mounted = true;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((value) => {
        if (mounted) setReduceMotion(value);
      })
      .catch(() => {});

    const reduceMotionSubscription = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduceMotion,
    );

    if (
      Platform.OS === "ios" &&
      typeof AccessibilityInfo.isBoldTextEnabled === "function"
    ) {
      AccessibilityInfo.isBoldTextEnabled()
        .then((value) => {
          if (mounted) setBoldText(value);
        })
        .catch(() => {});

      const boldTextSubscription = AccessibilityInfo.addEventListener(
        "boldTextChanged",
        setBoldText,
      );

      return () => {
        mounted = false;
        reduceMotionSubscription.remove();
        boldTextSubscription.remove();
      };
    }

    return () => {
      mounted = false;
      reduceMotionSubscription.remove();
    };
  }, []);

  const value = useMemo<A11yContextValue>(
    () => ({
      reduceMotion,
      boldText,
      fontScaleFactor: PixelRatio.getFontScale(),
    }),
    [reduceMotion, boldText],
  );

  return <A11yContext.Provider value={value}>{children}</A11yContext.Provider>;
};

const ResponsiveProvider = ({ children }: { children: ReactNode }) => {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const { top, bottom, left, right } = insets;

  const value = useMemo<ResponsiveReturn>(() => {
    const wRatio = width / BASE_WIDTH;
    const hRatio = height / BASE_HEIGHT;
    const baseScale = Math.min(
      Math.max(Math.min(wRatio, hRatio), MIN_SCALE),
      MAX_SCALE,
    );

    const wp: ScaleFunctions["wp"] = (size) =>
      PixelRatio.roundToNearestPixel(size * wRatio);

    const hp: ScaleFunctions["hp"] = (size) =>
      PixelRatio.roundToNearestPixel(size * hRatio);

    const ms: ScaleFunctions["ms"] = (size, factor = 0.5) =>
      PixelRatio.roundToNearestPixel(size + (baseScale * size - size) * factor);

    const fp: ScaleFunctions["fp"] = (size) => {
      const scaled = size * baseScale;
      return Math.round(
        PixelRatio.roundToNearestPixel(scaled) / PixelRatio.getFontScale(),
      );
    };

    const isTablet = width >= 768 && height >= 600;
    const isSmallPhone = width < 375;
    const isLandscape = width > height;

    const spacing: SpacingScale = {
      xxs: wp(2),
      xs: wp(4),
      sm: wp(8),
      md: wp(16),
      lg: wp(24),
      xl: wp(32),
      xxl: wp(48),
    };

    const fontSizes: TypographyScale = {
      xs: fp(11),
      sm: fp(13),
      md: fp(15),
      lg: fp(18),
      xl: fp(22),
      xxl: fp(28),
      hero: fp(36),
    };

    const radius: RadiusScale = {
      xs: wp(4),
      sm: wp(8),
      md: wp(12),
      lg: wp(16),
      xl: wp(24),
      full: 9999,
    };

    return {
      wp,
      hp,
      ms,
      fp,
      spacing,
      fontSizes,
      radius,
      isTablet,
      isSmallPhone,
      isLandscape,
      containerMaxWidth: isTablet ? 720 : undefined,
      rowOnTablet: isTablet ? "row" : "column",
      insets: { top, bottom, left, right },
      SCREEN: { width, height },
      IS_IOS: Platform.OS === "ios",
      IS_ANDROID: Platform.OS === "android",
    };
  }, [width, height, top, bottom, left, right]);

  return (
    <ResponsiveContext.Provider value={value}>
      {children}
    </ResponsiveContext.Provider>
  );
};

export const AppSystemProvider = ({ children }: { children: ReactNode }) => (
  <A11yProvider>
    <ResponsiveProvider>{children}</ResponsiveProvider>
  </A11yProvider>
);

export const useResponsive = (): ResponsiveReturn => {
  const ctx = useContext(ResponsiveContext);
  if (!ctx) {
    throw new Error("useResponsive must be used inside <AppSystemProvider>");
  }
  return ctx;
};

export const useAppTheme = (): Theme => APP_THEME;

export const useA11y = (): A11yContextValue => useContext(A11yContext);

export function useAdaptiveValue<T>(phoneValue: T, tabletValue: T): T {
  const { isTablet } = useResponsive();
  return isTablet ? tabletValue : phoneValue;
}

type StyleFactory<T extends StyleSheet.NamedStyles<T>> = (
  colors: ColorPalette,
  responsive: ResponsiveReturn,
) => T;

export const createThemedStyles = <T extends StyleSheet.NamedStyles<T>>(
  factory: StyleFactory<T>,
): (() => T) => {
  return () => {
    const { colors } = useAppTheme();
    const responsive = useResponsive();

    return useMemo(
      () => StyleSheet.create(factory(colors, responsive)),
      [colors, responsive],
    );
  };
};

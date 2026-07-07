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
  PixelRatio,
  Platform,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

export interface ResponsiveReturn extends ScaleFunctions, DeviceInfo, LayoutTokens {
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
      PixelRatio.roundToNearestPixel(
        size + (baseScale * size - size) * factor,
      );

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

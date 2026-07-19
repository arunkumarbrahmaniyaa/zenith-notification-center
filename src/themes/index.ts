import type { NotificationTheme } from "../types";
import { enterpriseTheme } from "./defaultTheme";

export const mergeTheme = (theme?: Partial<NotificationTheme>): NotificationTheme => {
  if (!theme) {
    return enterpriseTheme;
  }

  return {
    ...enterpriseTheme,
    ...theme,
    colors: {
      ...enterpriseTheme.colors,
      ...(theme.colors ?? {})
    }
  };
};

export { enterpriseTheme };

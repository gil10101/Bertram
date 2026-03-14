import { Config } from "@remotion/cli/config";
import path from "path";

Config.overrideWebpackConfig((currentConfig) => {
  return {
    ...currentConfig,
    resolve: {
      ...currentConfig.resolve,
      alias: {
        ...(currentConfig.resolve?.alias ?? {}),
        "@": path.resolve(__dirname, "..", "frontend", "src"),
      },
    },
  };
});

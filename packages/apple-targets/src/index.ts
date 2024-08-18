import { ConfigPlugin } from "@expo/config-plugins";
import { sync as globSync } from "glob";
import path from "path";

import type { Config } from "./config";
import withWidget from "./withWidget";
import { withXcodeProjectBetaBaseMod } from "./withXcparse";

interface AppleTargetProps {
  appleTeamId: string;
  isTV?: boolean;
  match?: string;
  root?: string;
}

export function isTVEnabled(isTV?: boolean): boolean {
  return process.env.EXPO_TV !== undefined || (isTV ?? false);
}

export const withTargetsDir: ConfigPlugin<AppleTargetProps> = (
  config,
  { appleTeamId, root = "./targets", match = "*", isTV }
) => {
  const tvEnabled = isTVEnabled(isTV);
  const projectRoot = config._internal!.projectRoot;

  const targets = globSync(`${root}/${match}/expo-target.config.@(json|js)`, {
    // const targets = globSync(`./targets/action/expo-target.config.@(json|js)`, {
    cwd: projectRoot,
    absolute: true,
  });

  if (tvEnabled) {
    // Skip target modifications if TV is enabled.
    return config;
  }

  targets.forEach((configPath) => {
    config = withWidget(config, {
      appleTeamId,
      ...require(configPath),
      directory: path.relative(projectRoot, path.dirname(configPath)),
    });
  });

  return withXcodeProjectBetaBaseMod(config);
};

export { Config };

module.exports = withTargetsDir;

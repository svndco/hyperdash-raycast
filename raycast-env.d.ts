/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `browse` command */
  export type Browse = ExtensionPreferences & {
  /** Vault Path - Absolute path to your Obsidian vault folder */
  "vaultPath": string,
  /** Bases HyperDASH File (optional) - Path to your Bases hyperdash.base file; used to auto-detect the todo tag and views */
  "basesTodoFile"?: string,
  /** Bases Project File (optional) - Path to your Bases project.base file; used to auto-detect the project tag */
  "basesProjectFile"?: string,
  /** Todo Tag (fallback) - Used if Bases file is not provided or has no tags.contains(...) */
  "todoTag": string,
  /** Project Tag (fallback) - Used if Bases file is not provided or has no tags.contains(...) */
  "projectTag": string
}
}

declare namespace Arguments {
  /** Arguments passed to the `browse` command */
  export type Browse = {}
}


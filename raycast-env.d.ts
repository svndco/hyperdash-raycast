/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Vault Path (Todos) - Path to scan for todos (e.g., /path/to/vault/tc/todo for better performance) */
  "vaultPath": string,
  /** Project Path - Path to scan for projects. Set to full vault root for all projects. */
  "projectPath": string,
  /** Bases HyperDASH File - Path to your Bases hyperdash.base file containing todo tag definitions */
  "basesTodoFile": string,
  /** Bases Project File - Path to your Bases project.base file containing project tag definitions */
  "basesProjectFile": string,
  /** Display Features - Display recurrence patterns for recurring tasks */
  "showRecurrence": boolean,
  /** undefined - Display task priority (use alphabetical names: 1-urgent, 2-high, 3-medium, 4-low) */
  "showPriority": boolean,
  /** undefined - Display time tracked and estimates */
  "showTimeTracking": boolean,
  /** Performance - Maximum number of tasks to display (default: 500, helps with large vaults) */
  "maxResults": string
}

/** Preferences accessible in all the extension's commands */
declare type Preferences = ExtensionPreferences

declare namespace Preferences {
  /** Preferences accessible in the `browse` command */
  export type Browse = ExtensionPreferences & {}
  /** Preferences accessible in the `projects` command */
  export type Projects = ExtensionPreferences & {}
}

declare namespace Arguments {
  /** Arguments passed to the `browse` command */
  export type Browse = {}
  /** Arguments passed to the `projects` command */
  export type Projects = {}
}


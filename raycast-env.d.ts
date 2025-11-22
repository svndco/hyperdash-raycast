/// <reference types="@raycast/api">

/* 🚧 🚧 🚧
 * This file is auto-generated from the extension's manifest.
 * Do not modify manually. Instead, update the `package.json` file.
 * 🚧 🚧 🚧 */

/* eslint-disable @typescript-eslint/ban-types */

type ExtensionPreferences = {
  /** Todo Base File - Path to your .base file for todos (vault auto-detected, cache used for speed) */
  "basesTodoFile": string,
  /** Todo View Name - Name of the view to use from your todo base file (e.g., 'Todo', 'Done') */
  "todoViewName": string,
  /** Project Base File - Path to your .base file for projects (vault auto-detected, cache used for speed) */
  "basesProjectFile": string,
  /** Project View Name - Name of the view to use from your project base file (e.g., 'Current', 'ALL') */
  "projectViewName": string,
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


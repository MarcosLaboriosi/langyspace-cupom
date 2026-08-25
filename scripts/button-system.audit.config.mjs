import { defineAuditConfig } from "@langyspace/ui/audit";
import { resolve } from "node:path";

export default defineAuditConfig({
  root: resolve(import.meta.dirname, ".."),
  canonicalComponents: ["Button", "IconButton"],
  auditDescendantActions: true,
});

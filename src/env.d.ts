/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface ImportMetaEnv {
  readonly RESEND_API_KEY?: string;
  readonly RESERVATION_TO_EMAIL?: string;
  readonly RESERVATION_FROM_EMAIL?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

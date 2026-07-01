import { EawbOptions } from "./types";

export function loadEawbOptionsFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): EawbOptions {
  return {
    api_key: env.EAWB_API_KEY ?? "",
    dry_run: env.EAWB_DRY_RUN === "true",
    from_contact: env.EAWB_FROM_CONTACT ?? "",
    from_phone: env.EAWB_FROM_PHONE ?? "",
    from_locality: env.EAWB_FROM_LOCALITY ?? "",
    from_county: env.EAWB_FROM_COUNTY ?? "",
    from_street: env.EAWB_FROM_STREET ?? "",
    from_street_no: env.EAWB_FROM_STREET_NO ?? "",
    from_zip: env.EAWB_FROM_ZIP ?? "",
    from_country: env.EAWB_FROM_COUNTRY ?? "RO",
  };
}

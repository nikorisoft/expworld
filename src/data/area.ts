import topLevel from "iso3166-2-db/countryList/dispute/UN/en.json";

export const countryData: { [countryCode: string]: { iso: string; name: string } } = topLevel;

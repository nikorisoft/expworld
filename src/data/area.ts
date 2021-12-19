import topLevel from "iso3166-2-db/countryList/dispute/UN/en.json";

export interface ISO3166_1_Data {
    iso: string;
    name: string;
}
export interface ISO3166_2_Data {
    iso: string;
    name: string;
}

export const countryData: { [countryCode: string]: { iso: string; name: string } } = topLevel;

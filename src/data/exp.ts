import { countryData } from "../data/area";

export enum ExpState {
    None = 0,
    Passed = 1,
    Landed = 2,
    Visited = 3,
    Stayed = 4,
    Lived = 5
};

export const ExpStateString = [
    "No Status",
    "Passed",
    "Landed",
    "Visited",
    "Stayed",
    "Lived"
];

export interface UserSubregionState {
    state: ExpState;
}

export interface UserCountryState {
    state: ExpState;
    subregions: {
        [subregionCode: string]: UserSubregionState
    };
}

export interface UserData {
    name: string;
    countries: {
        [countryCode: string]: UserCountryState
    };
}

export function createNewUserData(): UserData {
    const data: UserData = {
        name: "User",
        countries: {}
    };

    for (const code in countryData) {
        data.countries[code] = {
            state: ExpState.None,
            subregions: {}
        };
    }

    return data;
}

import { countryData } from "../data/area";

export enum ExpState {
    None = 0,
    Passed = 1,
    Landed = 2,
    Visited = 3,
    Stayed = 4,
    Lived = 5
}

export const ExpStateString = [
    "No Status",
    "Passed",
    "Landed",
    "Visited",
    "Stayed",
    "Lived"
];

export type UserGeoStateMap = { [code: string]: UserGeoState };

export interface UserGeoState {
    state: ExpState;
}

export type UserSubregionState = UserGeoState

export interface UserCountryState extends UserGeoState {
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
        data.countries[code] = createEmptyCountryState();
    }

    return data;
}

export function createEmptyCountryState(): UserCountryState {
    return {
        state: ExpState.None,
        subregions: {}
    };
}

export function validateCountryState(cs: UserCountryState): UserCountryState {
    const newState: UserCountryState = createEmptyCountryState();

    if (cs != null) {
        if (cs.state != null) {
            if (typeof(cs.state) === "number" && cs.state >= ExpState.None && cs.state <= ExpState.Lived) {
                newState.state = cs.state;
            }
        }
        if (cs.subregions != null) {
            newState.subregions = cs.subregions;
        }
    }

    return newState;
}

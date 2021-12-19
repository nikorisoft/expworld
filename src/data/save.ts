import { countryData } from "./area";
import { createEmptyCountryState, UserCountryState, UserData, validateCountryState } from "./exp";

const LS_KEY_NAME = "expworld_localsave";

export function exportToJSON(data: UserData) {
    return JSON.stringify(data);
}

export function importFromJSON(json: string): UserData {
    const imported = JSON.parse(json);
    const countries: { [code: string]: UserCountryState } = {};

    for (const code in countryData) {
        if (imported.countries != null && imported.countries[code] != null) {
            countries[code] = validateCountryState(imported.countries[code]);
        } else {
            countries[code] = createEmptyCountryState();
        }
    }

    return {
        name: imported.name,
        countries
    };
}

export function saveToLocalStorage(data: UserData) {
    const json = exportToJSON(data);

    localStorage.setItem(LS_KEY_NAME, json);
}

export function loadFromLocalStorage(): UserData | null {
    const json = localStorage.getItem(LS_KEY_NAME);

    if (json == null) {
        return null;
    }

    try {
        return importFromJSON(json);
    } catch (e) {
        console.warn("Error during loading from localStorage. Ignore and use an empty data", e);
        return null;
    }
}

export function downloadUserData(userData: UserData) {
    const json = exportToJSON(userData);

    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    document.body.appendChild(a);
    a.style.visibility = "hidden";
    a.download = "expworld-userdata.json";
    a.href = url;
    a.click();
    a.remove();

    URL.revokeObjectURL(url);
}

export async function uploadUserData(fileList: FileList): Promise<UserData | null> {
    if (fileList.length === 1) {
        const file = fileList[0];
        try {
            const json = await file.text();

            return importFromJSON(json);
        } catch {
            return null;
        }
    }

    return null;
}

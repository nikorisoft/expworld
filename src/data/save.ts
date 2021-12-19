import { countryData } from "./area";
import { createEmptyCountryState, createNewUserData, ExpState, UserCountryState, UserData, validateCountryState } from "./exp";

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

/**
 * Export the user data in the binary format.
 * @param userData User data
 *
 * The binary format is:
 *
 * EW_UD_BINARY                := Header Countries
 *   Header                    := Version(0x01) NameLen(1-byte) Name
 *   Countries                 := CountryTerminator | Country Countries
 *     Country                 := CountryCode(2-byte) MaxLenState(1-byte) Subregions
 *       Subregions            := SubregionState(5) SubregionState(4) SubregionState(3) SubregionState(2) SubregionState(1)
 *         SubregionState(n)   := SubregionCode(MaxLen-byte) SubregionState(n) | SubregionTerminator
 *         SubregionTerminator := 0x00
 *     CountryTerminator       := 0x00 0x00
 */
export function exportToBinary(userData: UserData): Buffer {
    const nameBuffer = Buffer.from(userData.name);

    const targets: { code: string, state: number, maxLen: number, maxState: number, numSubregions: number, subregions: string[][] }[] = [];

    let totalBytes = 2 + nameBuffer.length + 2; // Header, CountryTerminator

    for (const code in userData.countries) {
        const country = userData.countries[code];

        let nonZeroExp = 0;
        let maxLen = 0;
        let maxState = 0;
        const subregions: string[][] = [[], [], [], [], []];

        for (const regionCode in country.subregions) {
            const subregion = country.subregions[regionCode];
            if (subregion.state !== ExpState.None) {
                nonZeroExp++;

                if (subregion.state > maxState) {
                    maxState = subregion.state;
                }

                const codeLen = Buffer.from(regionCode).length;
                if (maxLen < codeLen) {
                    maxLen = codeLen;
                }

                subregions[subregion.state - 1].push(regionCode);
            }
        }

        if (country.state !== ExpState.None || nonZeroExp > 0) {
            targets.push({
                code,
                state: country.state,
                maxLen,
                maxState,
                numSubregions: nonZeroExp,
                subregions
            });

            totalBytes += maxLen * nonZeroExp + 3 + 5;
        }
    }

    // XXX: Lengthy name is trimmed (to 255 bytes)
    const nameLen = nameBuffer.length > 255 ? 255 : nameBuffer.length;

    const buffer = Buffer.alloc(totalBytes, 0x00);
    buffer.writeUInt8(0x01, 0); // Header.Version
    buffer.writeUInt8(nameLen, 1); // Header.NameLen
    nameBuffer.copy(buffer, 2, 0, nameLen);

    let offset = nameLen + 2;
    for (const target of targets) {
        Buffer.from(target.code).copy(buffer, offset, 0, 2); // CountryCode
        offset += 2;

        buffer.writeUInt8((target.maxLen << 4) | (target.state), offset); // MaxLenState
        offset++;

        // Shouldn't we use enum for numeric calculation?
        for (let state = ExpState.Lived; state > ExpState.None; state--) {
            for (const regionCode of target.subregions[state - 1]) {
                Buffer.from(regionCode).copy(buffer, offset, 0);
                offset += target.maxLen;
            }
            offset++; // SubregionTerminator
        }
    }

    return buffer;
}

export function importFromBinary(buffer: Buffer): UserData {
    const version = buffer.readUInt8(0);
    const nameLen = buffer.readUInt8(1);
    const name = buffer.slice(2, 2 + nameLen).toString();

    const userData = createNewUserData();
    userData.name = name;

    if (version !== 0x01) {
        throw new Error("This binary format is not supported");
    }

    let offset = 2 + nameLen;
    while (offset < buffer.length) {
        if (buffer.readUInt16LE(offset) === 0x00) { // CountryTeminator
            console.debug("Found CountryTerminator at %d", offset);
            break;
        }
        const countryCode = buffer.slice(offset, offset + 2).toString();
        offset += 2;

        const lenState = buffer.readUInt8(offset);
        offset++;
        const countryState = lenState & 0x0f;
        const maxLen = lenState >> 4;

        const country: UserCountryState = {
            state: countryState,
            subregions: {}
        };

        for (let state = ExpState.Lived; state > ExpState.None; state--) {
            while (offset < buffer.length) {
                const peek = buffer.readUInt8(offset);
                if (peek === 0x00) {
                    offset++;
                    break;
                }
                if (maxLen === 0) {
                    throw new Error("maxLen === 0. Should not reach here.");
                }
                // Find the last non-zero
                let endCode = 0;
                for (let l = maxLen - 1; l >= 0; l--) {
                    if (buffer[offset + l] != 0x00) {
                        endCode = l;
                        break;
                    }
                }
                const subregionCode = buffer.slice(offset, offset + endCode + 1).toString();
                offset += maxLen;

                country.subregions[subregionCode] = { state };
            }
        }

        if (userData.countries[countryCode] != null) {
            userData.countries[countryCode] = validateCountryState(country);
        }
    }

    return userData;
}

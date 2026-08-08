/**
 * Destinations Cartebay ships to. Pure data with no server imports, so the
 * checkout form and the server-side address validation share one list and
 * can't drift — a country offered in the dropdown is by definition one the
 * validator accepts.
 *
 * `hasPostalCode` is false for the countries that genuinely have no postal
 * system, so checkout doesn't demand a code that doesn't exist. `stateLabel`
 * exists because "State" is wrong nearly everywhere outside the US, and a
 * mislabelled required field is a checkout abandonment.
 */
export interface Country {
  code: string;
  name: string;
  stateLabel: string;
  postalLabel: string;
  hasPostalCode: boolean;
}

export const COUNTRIES: Country[] = [
  { code: "US", name: "United States", stateLabel: "State", postalLabel: "ZIP code", hasPostalCode: true },
  { code: "CA", name: "Canada", stateLabel: "Province", postalLabel: "Postal code", hasPostalCode: true },
  { code: "GB", name: "United Kingdom", stateLabel: "County", postalLabel: "Postcode", hasPostalCode: true },
  { code: "AU", name: "Australia", stateLabel: "State", postalLabel: "Postcode", hasPostalCode: true },
  { code: "NZ", name: "New Zealand", stateLabel: "Region", postalLabel: "Postcode", hasPostalCode: true },
  { code: "IE", name: "Ireland", stateLabel: "County", postalLabel: "Eircode", hasPostalCode: true },
  { code: "DE", name: "Germany", stateLabel: "State", postalLabel: "Postal code", hasPostalCode: true },
  { code: "FR", name: "France", stateLabel: "Region", postalLabel: "Postal code", hasPostalCode: true },
  { code: "ES", name: "Spain", stateLabel: "Province", postalLabel: "Postal code", hasPostalCode: true },
  { code: "IT", name: "Italy", stateLabel: "Province", postalLabel: "Postal code", hasPostalCode: true },
  { code: "NL", name: "Netherlands", stateLabel: "Province", postalLabel: "Postal code", hasPostalCode: true },
  { code: "BE", name: "Belgium", stateLabel: "Province", postalLabel: "Postal code", hasPostalCode: true },
  { code: "SE", name: "Sweden", stateLabel: "County", postalLabel: "Postal code", hasPostalCode: true },
  { code: "NO", name: "Norway", stateLabel: "County", postalLabel: "Postal code", hasPostalCode: true },
  { code: "DK", name: "Denmark", stateLabel: "Region", postalLabel: "Postal code", hasPostalCode: true },
  { code: "CH", name: "Switzerland", stateLabel: "Canton", postalLabel: "Postal code", hasPostalCode: true },
  { code: "AT", name: "Austria", stateLabel: "State", postalLabel: "Postal code", hasPostalCode: true },
  { code: "PL", name: "Poland", stateLabel: "Voivodeship", postalLabel: "Postal code", hasPostalCode: true },
  { code: "PT", name: "Portugal", stateLabel: "District", postalLabel: "Postal code", hasPostalCode: true },
  { code: "JP", name: "Japan", stateLabel: "Prefecture", postalLabel: "Postal code", hasPostalCode: true },
  { code: "SG", name: "Singapore", stateLabel: "Region", postalLabel: "Postal code", hasPostalCode: true },
  { code: "IN", name: "India", stateLabel: "State", postalLabel: "PIN code", hasPostalCode: true },
  { code: "BD", name: "Bangladesh", stateLabel: "District", postalLabel: "Postal code", hasPostalCode: true },
  { code: "MY", name: "Malaysia", stateLabel: "State", postalLabel: "Postcode", hasPostalCode: true },
  { code: "PH", name: "Philippines", stateLabel: "Province", postalLabel: "Postal code", hasPostalCode: true },
  { code: "MX", name: "Mexico", stateLabel: "State", postalLabel: "Postal code", hasPostalCode: true },
  { code: "BR", name: "Brazil", stateLabel: "State", postalLabel: "CEP", hasPostalCode: true },
  { code: "ZA", name: "South Africa", stateLabel: "Province", postalLabel: "Postal code", hasPostalCode: true },
  { code: "AE", name: "United Arab Emirates", stateLabel: "Emirate", postalLabel: "Postal code", hasPostalCode: false },
  { code: "SA", name: "Saudi Arabia", stateLabel: "Region", postalLabel: "Postal code", hasPostalCode: true },
  { code: "HK", name: "Hong Kong", stateLabel: "District", postalLabel: "Postal code", hasPostalCode: false },
  { code: "KR", name: "South Korea", stateLabel: "Province", postalLabel: "Postal code", hasPostalCode: true },
];

const BY_CODE = new Map(COUNTRIES.map((c) => [c.code, c]));

/** Falls back to US conventions for an unknown code so the form still renders sensible labels. */
export function getCountry(code: string | null | undefined): Country {
  // Tolerates null/undefined: a saved address predating the country field, or
  // a legacy row storing a full name rather than a code, would otherwise throw
  // during render and take the whole checkout form down.
  return BY_CODE.get((code ?? "").trim().toUpperCase()) ?? COUNTRIES[0];
}

export function isSupportedCountry(code: string | null | undefined): boolean {
  return BY_CODE.has((code ?? "").trim().toUpperCase());
}

export type CsvPlaceDraft = {
  name: string;
  addressLine: string;
  postalCode: string;
  city: string;
  country: string;
  note: string;
  categoryName: string;
  priority: number;
  isValid: boolean;
  warnings: string[];
};

export const CSV_HEADER_ALIASES = {
  name: ["name", "naam", "titel", "title", "object", "woning", "plek"],
  addressLine: ["address", "adres", "straat", "street", "streetnumber", "straatenhuisnummer"],
  postalCode: ["postalcode", "postcode", "zip", "zipcode"],
  city: ["city", "stad", "plaats", "town"],
  country: ["country", "land"],
  note: ["note", "notitie", "opmerking", "remarks", "remark"],
  category: ["category", "categorie", "type"],
  priority: ["priority", "prioriteit"]
} as const;

function firstValue(row: Record<string, string>, aliases: readonly string[]) {
  for (const alias of aliases) {
    const value = row[alias];
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim();
    }
  }

  return "";
}

export function normalizeCategoryName(value: string) {
  const normalized = value.trim().toLowerCase();

  const aliases: Record<string, string> = {
    koffie: "Coffee",
    coffee: "Coffee",
    eten: "Food",
    food: "Food",
    restaurant: "Food",
    museum: "Museum",
    park: "Park",
    natuur: "Park"
  };

  return aliases[normalized] ?? value.trim();
}

export function mapCsvRowToPlaceDraft(row: Record<string, string>): CsvPlaceDraft {
  const name = firstValue(row, CSV_HEADER_ALIASES.name);
  const addressLine = firstValue(row, CSV_HEADER_ALIASES.addressLine);
  const postalCode = firstValue(row, CSV_HEADER_ALIASES.postalCode);
  const city = firstValue(row, CSV_HEADER_ALIASES.city);
  const country = firstValue(row, CSV_HEADER_ALIASES.country);
  const note = firstValue(row, CSV_HEADER_ALIASES.note);
  const categoryName = normalizeCategoryName(firstValue(row, CSV_HEADER_ALIASES.category));
  const priorityValue = firstValue(row, CSV_HEADER_ALIASES.priority);
  const parsedPriority = Number.parseInt(priorityValue || "0", 10) || 0;
  const priority = Math.max(0, Math.min(5, parsedPriority));
  const warnings: string[] = [];

  if (!name && !addressLine) {
    warnings.push("Mist naam en adres");
  }

  if (!city) {
    warnings.push("Geen stad");
  }

  return {
    name,
    addressLine,
    postalCode,
    city,
    country,
    note,
    categoryName,
    priority,
    isValid: Boolean(name || addressLine),
    warnings
  };
}

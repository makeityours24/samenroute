import { createPlaceService } from "@/server/services/places/create-place.service";
import { addPlaceToListService } from "@/server/services/list-places/add-place-to-list.service";
import { AppError } from "@/server/services/errors";
import type { AuthorizedUser } from "@/server/domain/types";
import { parseCsv } from "@/lib/utils/csv";
import { PlaceRepository } from "@/server/repositories/place.repository";

const placeRepository = new PlaceRepository();

const HEADER_ALIASES = {
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

function normalizeCategoryName(value: string) {
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

export async function importListPlacesService(user: AuthorizedUser, input: { listId: string; filename: string; content: string }) {
  if (!input.filename.toLowerCase().endsWith(".csv")) {
    throw new AppError("Gebruik een CSV-bestand voor deze eerste importversie.");
  }

  if (input.content.length > 1024 * 1024) {
    throw new AppError("Het CSV-bestand is te groot. Gebruik een bestand tot ongeveer 1 MB.");
  }

  const rows = parseCsv(input.content);

  if (rows.length === 0) {
    throw new AppError("We konden geen bruikbare rijen in dit CSV-bestand vinden.");
  }

  if (rows.length > 200) {
    throw new AppError("Gebruik voor nu maximaal 200 regels per import.");
  }

  const categories = await placeRepository.listCategories();
  const categoriesByName = new Map(categories.map((category) => [category.name.toLowerCase(), category.id]));
  const seenSignatures = new Set<string>();

  let importedCount = 0;
  let skippedCount = 0;

  for (const row of rows) {
    const name = firstValue(row, HEADER_ALIASES.name);
    const addressLine = firstValue(row, HEADER_ALIASES.addressLine);
    const postalCode = firstValue(row, HEADER_ALIASES.postalCode);
    const city = firstValue(row, HEADER_ALIASES.city);
    const country = firstValue(row, HEADER_ALIASES.country);
    const note = firstValue(row, HEADER_ALIASES.note);
    const categoryName = normalizeCategoryName(firstValue(row, HEADER_ALIASES.category));
    const priorityValue = firstValue(row, HEADER_ALIASES.priority);

    if (!name && !addressLine) {
      skippedCount += 1;
      continue;
    }

    const safeName = name || addressLine || "Onbekende plek";
    const signature = [safeName, addressLine, postalCode, city, country].map((value) => value.trim().toLowerCase()).join("|");

    if (seenSignatures.has(signature)) {
      skippedCount += 1;
      continue;
    }

    seenSignatures.add(signature);

    const priority = Math.max(0, Math.min(5, Number.parseInt(priorityValue || "0", 10) || 0));
    const categoryId = categoryName ? categoriesByName.get(categoryName.toLowerCase()) : undefined;

    const place = await createPlaceService(user, {
      sourceType: "IMPORTED",
      name: safeName,
      addressLine: addressLine || undefined,
      postalCode: postalCode || undefined,
      city: city || undefined,
      country: country || undefined,
      categoryId
    });

    await addPlaceToListService(user, {
      listId: input.listId,
      placeId: place.id,
      note: note || undefined,
      priority,
      includeInRoute: true,
      isFavorite: false
    });

    importedCount += 1;
  }

  if (importedCount === 0) {
    throw new AppError("De import leverde geen bruikbare plekken op. Controleer of je CSV kolommen zoals naam, adres of stad bevat.");
  }

  return {
    importedCount,
    skippedCount
  };
}

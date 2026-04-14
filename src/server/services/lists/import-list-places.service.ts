import { createPlaceService } from "@/server/services/places/create-place.service";
import { addPlaceToListService } from "@/server/services/list-places/add-place-to-list.service";
import { AppError } from "@/server/services/errors";
import type { AuthorizedUser } from "@/server/domain/types";
import { parseCsv } from "@/lib/utils/csv";
import { mapCsvRowToPlaceDraft } from "@/lib/utils/csv-import";
import { PlaceRepository } from "@/server/repositories/place.repository";

const placeRepository = new PlaceRepository();

export async function importListPlacesService(user: AuthorizedUser, input: { listId: string; filename: string; content: string }) {
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
    const draft = mapCsvRowToPlaceDraft(row);
    const { name, addressLine, postalCode, city, country, note, categoryName, priority, isValid } = draft;

    if (!isValid) {
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

"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/auth";
import { createListService } from "@/server/services/lists/create-list.service";
import { updateListService } from "@/server/services/lists/update-list.service";
import { createPlaceService } from "@/server/services/places/create-place.service";
import { addPlaceToListService } from "@/server/services/list-places/add-place-to-list.service";
import { generateRoutePlanService } from "@/server/services/routes/generate-route-plan.service";
import { markListPlaceVisitedService } from "@/server/services/list-places/mark-list-place-visited.service";
import { markListPlaceSkippedService } from "@/server/services/list-places/mark-list-place-skipped.service";
import { reorderListPlacesService } from "@/server/services/list-places/reorder-list-places.service";
import { updateListPlaceService } from "@/server/services/list-places/update-list-place.service";
import { shareListService } from "@/server/services/lists/share-list.service";
import { archiveListService } from "@/server/services/lists/archive-list.service";
import { duplicateListService } from "@/server/services/lists/duplicate-list.service";
import { importListPlacesService } from "@/server/services/lists/import-list-places.service";
import { completeRouteStopService } from "@/server/services/routes/complete-route-stop.service";
import { completeRoutePlanService } from "@/server/services/routes/complete-route-plan.service";
import { addRouteSuggestionService } from "@/server/services/routes/add-route-suggestion.service";
import { ListRepository } from "@/server/repositories/list.repository";
import { updatePlaceService } from "@/server/services/places/update-place.service";
import { ListPlaceRepository } from "@/server/repositories/list-place.repository";
import { AppError } from "@/server/services/errors";
import { submitMakelaarsDemoRequestService } from "@/server/services/marketing/submit-makelaars-demo-request.service";

const listRepository = new ListRepository();
const listPlaceRepository = new ListPlaceRepository();

async function requireUserOrThrow() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/signin");
  }
  return user;
}

export async function createListAction(formData: FormData) {
  const user = await requireUserOrThrow();
  await createListService(user, {
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? "") || undefined,
    coverColor: String(formData.get("coverColor") ?? "") || undefined
  });
  revalidatePath("/lists");
  revalidatePath("/home");
}

export async function createListAndOpenImportAction(formData: FormData) {
  const user = await requireUserOrThrow();
  const list = await createListService(user, {
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? "") || undefined,
    coverColor: String(formData.get("coverColor") ?? "") || undefined
  });
  revalidatePath("/lists");
  revalidatePath("/home");
  redirect(`/lists/${list.id}?focus=csv-import`);
}

export async function updateListAction(formData: FormData) {
  const user = await requireUserOrThrow();
  const listId = String(formData.get("listId") ?? "");

  await updateListService(listId, user, {
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? "") || undefined,
    coverColor: String(formData.get("coverColor") ?? "") || undefined
  });

  revalidatePath(`/lists/${listId}`);
  revalidatePath("/lists");
  revalidatePath("/home");
  redirect(`/lists/${listId}`);
}

export async function addPlaceAction(formData: FormData) {
  const user = await requireUserOrThrow();
  const listId = String(formData.get("listId") ?? "");

  const place = await createPlaceService(user, {
    sourceType: formData.get("externalSourceId") ? "GOOGLE_PLACE" : "MANUAL",
    externalSourceId: String(formData.get("externalSourceId") ?? "") || undefined,
    name: String(formData.get("name") ?? ""),
    addressLine: String(formData.get("addressLine") ?? "") || undefined,
    city: String(formData.get("city") ?? "") || undefined,
    country: String(formData.get("country") ?? "") || undefined,
    latitude: formData.get("latitude") ? Number(formData.get("latitude")) : undefined,
    longitude: formData.get("longitude") ? Number(formData.get("longitude")) : undefined,
    googleMapsUrl: String(formData.get("googleMapsUrl") ?? "") || undefined,
    categoryId: String(formData.get("categoryId") ?? "") || undefined
  });

  await addPlaceToListService(user, {
    listId,
    placeId: place.id,
    note: String(formData.get("note") ?? "") || undefined,
    priority: Number(formData.get("priority") ?? 0),
    includeInRoute: formData.get("includeInRoute") === "on",
    isFavorite: formData.get("isFavorite") === "on"
  });

  revalidatePath(`/lists/${listId}`);
  revalidatePath("/home");
  redirect(`/lists/${listId}`);
}

export async function updateListPlaceAndPlaceAction(formData: FormData) {
  const user = await requireUserOrThrow();
  const listId = String(formData.get("listId") ?? "");
  const listPlaceId = String(formData.get("listPlaceId") ?? "");
  const placeId = String(formData.get("placeId") ?? "");

  await updatePlaceService(placeId, user, {
    name: String(formData.get("name") ?? ""),
    addressLine: String(formData.get("addressLine") ?? "") || null,
    city: String(formData.get("city") ?? "") || null,
    country: String(formData.get("country") ?? "") || null,
    latitude: formData.get("latitude") ? Number(formData.get("latitude")) : null,
    longitude: formData.get("longitude") ? Number(formData.get("longitude")) : null,
    googleMapsUrl: String(formData.get("googleMapsUrl") ?? "") || null,
    categoryId: String(formData.get("categoryId") ?? "") || null
  });

  await updateListPlaceService(listPlaceId, user, {
    note: String(formData.get("note") ?? "") || null,
    priority: Number(formData.get("priority") ?? 0),
    includeInRoute: formData.get("includeInRoute") === "on",
    isFavorite: formData.get("isFavorite") === "on"
  });

  revalidatePath(`/lists/${listId}`);
  revalidatePath("/home");
  redirect(`/lists/${listId}`);
}

export async function generateRouteAction(formData: FormData) {
  const user = await requireUserOrThrow();
  const listId = String(formData.get("listId") ?? "");
  const listPlaceIds = formData.getAll("listPlaceIds").map(String).filter(Boolean);

  if (listPlaceIds.length === 0) {
    redirect(`/today?listId=${listId}&error=no-stops`);
  }

  const route = await generateRoutePlanService(user, {
    listId,
    title: String(formData.get("title") ?? "Vandaag"),
    transportMode: String(formData.get("transportMode") ?? "WALKING"),
    routeOrderingStrategy: String(formData.get("routeOrderingStrategy") ?? "FASTEST"),
    listPlaceIds,
    maxStops: Number(formData.get("maxStops") ?? 4),
    startPlaceLabel: String(formData.get("startPlaceLabel") ?? "") || undefined,
    startLatitude: formData.get("startLatitude") ? Number(formData.get("startLatitude")) : undefined,
    startLongitude: formData.get("startLongitude") ? Number(formData.get("startLongitude")) : undefined
  });

  redirect(`/route/${route.id}`);
}

export async function markVisitedAction(formData: FormData) {
  const user = await requireUserOrThrow();
  const listPlaceId = String(formData.get("listPlaceId") ?? "");
  const returnPath = String(formData.get("returnPath") ?? "/home");
  await markListPlaceVisitedService(user, { listPlaceId });
  revalidatePath(returnPath);
  revalidatePath("/history");
  revalidatePath("/home");
}

export async function markSkippedAction(formData: FormData) {
  const user = await requireUserOrThrow();
  const listPlaceId = String(formData.get("listPlaceId") ?? "");
  const returnPath = String(formData.get("returnPath") ?? "/home");
  await markListPlaceSkippedService(user, { listPlaceId });
  revalidatePath(returnPath);
}

export async function reorderListPlaceAction(formData: FormData) {
  const user = await requireUserOrThrow();
  const listId = String(formData.get("listId") ?? "");
  const listPlaceId = String(formData.get("listPlaceId") ?? "");
  const direction = String(formData.get("direction") ?? "");
  const returnPath = String(formData.get("returnPath") ?? `/lists/${listId}`);

  const list = await listRepository.findDetail(listId, user.id);

  if (!list) {
    redirect("/lists");
  }

  const orderedIds = list.listPlaces.map((item) => item.id);
  const currentIndex = orderedIds.indexOf(listPlaceId);

  if (currentIndex === -1) {
    revalidatePath(returnPath);
    return;
  }

  const targetIndex =
    direction === "up" ? currentIndex - 1 : direction === "down" ? currentIndex + 1 : currentIndex;

  if (targetIndex < 0 || targetIndex >= orderedIds.length || targetIndex === currentIndex) {
    revalidatePath(returnPath);
    return;
  }

  [orderedIds[currentIndex], orderedIds[targetIndex]] = [orderedIds[targetIndex], orderedIds[currentIndex]];

  await reorderListPlacesService(listId, user, orderedIds);
  revalidatePath(returnPath);
}

export async function toggleFavoriteListPlaceAction(formData: FormData) {
  const user = await requireUserOrThrow();
  const listPlaceId = String(formData.get("listPlaceId") ?? "");
  const returnPath = String(formData.get("returnPath") ?? "/home");
  const nextValue = String(formData.get("nextValue") ?? "") === "true";

  await updateListPlaceService(listPlaceId, user, {
    isFavorite: nextValue
  });

  revalidatePath(returnPath);
}

export async function deleteListPlaceAction(formData: FormData) {
  const user = await requireUserOrThrow();
  const listPlaceId = String(formData.get("listPlaceId") ?? "");
  const returnPath = String(formData.get("returnPath") ?? "/lists");

  const listPlace = await listPlaceRepository.findById(listPlaceId);

  if (!listPlace) {
    revalidatePath(returnPath);
    return;
  }

  const list = await listRepository.getMembershipContext(listPlace.listId, user.id);

  if (!list) {
    redirect("/lists");
  }

  await listPlaceRepository.remove(listPlaceId);
  revalidatePath(returnPath);
  revalidatePath("/home");
}

export async function shareListAction(formData: FormData) {
  const user = await requireUserOrThrow();
  const listId = String(formData.get("listId") ?? "");
  await shareListService(listId, user, {
    email: String(formData.get("email") ?? ""),
    role: String(formData.get("role") ?? "VIEWER")
  });
  revalidatePath(`/lists/${listId}`);
}

export type ShareListFormState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export type DemoRequestFormState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export async function submitShareListAction(
  _previousState: ShareListFormState,
  formData: FormData
): Promise<ShareListFormState> {
  try {
    const user = await requireUserOrThrow();
    const listId = String(formData.get("listId") ?? "");

    const result = await shareListService(listId, user, {
      email: String(formData.get("email") ?? ""),
      role: String(formData.get("role") ?? "VIEWER")
    });

    revalidatePath(`/lists/${listId}`);
    revalidatePath(`/lists/${listId}/members`);

    return {
      status: "success",
      message: result.message
    };
  } catch (error) {
    if (error instanceof AppError) {
      return {
        status: "error",
        message: error.message
      };
    }

    console.error("submitShareListAction failed", error);

    return {
      status: "error",
      message: "Er ging iets mis bij het delen van de lijst."
    };
  }
}

export async function submitMakelaarsDemoRequestAction(
  _previousState: DemoRequestFormState,
  formData: FormData
): Promise<DemoRequestFormState> {
  try {
    await submitMakelaarsDemoRequestService({
      name: String(formData.get("name") ?? ""),
      officeName: String(formData.get("officeName") ?? ""),
      email: String(formData.get("email") ?? ""),
      city: String(formData.get("city") ?? "") || undefined,
      weeklyViewings: String(formData.get("weeklyViewings") ?? "") || undefined,
      notes: String(formData.get("notes") ?? "") || undefined
    });

    return {
      status: "success",
      message: "Je aanvraag is verstuurd. We nemen contact met je op via e-mail."
    };
  } catch (error) {
    return {
      status: "error",
      message: error instanceof AppError ? error.message : "Er ging iets mis bij het versturen van je aanvraag."
    };
  }
}

export async function archiveListAction(formData: FormData) {
  const user = await requireUserOrThrow();
  const listId = String(formData.get("listId") ?? "");
  await archiveListService(listId, user);
  revalidatePath("/lists");
  redirect("/lists");
}

export async function duplicateListAction(formData: FormData) {
  const user = await requireUserOrThrow();
  const listId = String(formData.get("listId") ?? "");
  const duplicated = await duplicateListService(listId, user);
  revalidatePath("/lists");
  redirect(`/lists/${duplicated.id}`);
}

export async function importListPlacesAction(formData: FormData) {
  const user = await requireUserOrThrow();
  const listId = String(formData.get("listId") ?? "");
  const file = formData.get("file");

  const search = new URLSearchParams();

  try {
    if (!(file instanceof File) || file.size === 0) {
      throw new AppError("Kies eerst een CSV-bestand om te importeren.");
    }

    const content = await file.text();
    const result = await importListPlacesService(user, {
      listId,
      filename: file.name,
      content
    });

    search.set("import", "success");
    search.set("count", String(result.importedCount));
    if (result.skippedCount > 0) {
      search.set("skipped", String(result.skippedCount));
    }

    revalidatePath(`/lists/${listId}`);
    revalidatePath("/home");
  } catch (error) {
    const message = error instanceof AppError ? error.message : "Er ging iets mis tijdens het importeren van je CSV-bestand.";
    search.set("import", "error");
    search.set("message", message);
  }

  redirect(`/lists/${listId}?${search.toString()}`);
}

export async function completeRouteStopAction(formData: FormData) {
  const user = await requireUserOrThrow();
  const routePlanId = String(formData.get("routePlanId") ?? "");
  const routePlanStopId = String(formData.get("routePlanStopId") ?? "");
  const listPlaceId = String(formData.get("listPlaceId") ?? "");
  await completeRouteStopService(user, { routePlanId, routePlanStopId, listPlaceId });
  revalidatePath(`/route/${routePlanId}`);
  revalidatePath("/history");
  revalidatePath("/home");
}

export async function completeRoutePlanAction(formData: FormData) {
  const user = await requireUserOrThrow();
  const routePlanId = String(formData.get("routePlanId") ?? "");
  await completeRoutePlanService(routePlanId, user);
  revalidatePath("/today");
  revalidatePath("/home");
  redirect("/today");
}

export async function addRouteSuggestionAction(formData: FormData) {
  const user = await requireUserOrThrow();
  const routePlanId = String(formData.get("routePlanId") ?? "");

  await addRouteSuggestionService(user, {
    routePlanId,
    externalSourceId: String(formData.get("externalSourceId") ?? "") || undefined,
    name: String(formData.get("name") ?? ""),
    addressLine: String(formData.get("addressLine") ?? "") || undefined,
    city: String(formData.get("city") ?? "") || undefined,
    country: String(formData.get("country") ?? "") || undefined,
    latitude: formData.get("latitude") ? Number(formData.get("latitude")) : undefined,
    longitude: formData.get("longitude") ? Number(formData.get("longitude")) : undefined,
    googleMapsUrl: String(formData.get("googleMapsUrl") ?? "") || undefined
  });

  revalidatePath(`/route/${routePlanId}`);
  revalidatePath("/today");
  revalidatePath("/home");
}

import { apiErrorResponse, ok } from "@/lib/utils/api";
import { requireAuthenticatedUser } from "@/lib/utils/request";
import { guardSensitiveRequest } from "@/lib/utils/request";
import { getLocale } from "@/lib/i18n/server";
import { GooglePlaceLookupAdapter } from "@/server/services/google/place-lookup.adapter";

const placeLookupAdapter = new GooglePlaceLookupAdapter();

export async function GET(request: Request) {
  try {
    await requireAuthenticatedUser();
    await guardSensitiveRequest("place-lookup");
    const url = new URL(request.url);
    const query = url.searchParams.get("q");
    const city = url.searchParams.get("city") ?? undefined;
    const country = url.searchParams.get("country") ?? undefined;
    const locale = await getLocale();

    if (!query || query.trim().length < 3) {
      return ok([]);
    }

    const data = await placeLookupAdapter.search(query, { city, country, locale });
    return ok(data);
  } catch (error) {
    return apiErrorResponse(error);
  }
}

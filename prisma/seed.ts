import "dotenv/config";
import { PrismaClient, ListMemberRole, PlaceSourceType, ListPlaceStatus, RoutePlanStatus, TransportMode } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { buildGoogleMapsDirectionsUrl } from "@/server/services/google/maps-url.builder";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to run the Prisma seed script.");
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString })
});

async function main() {
  await prisma.activityLog.deleteMany();
  await prisma.routePlanStop.deleteMany();
  await prisma.routePlan.deleteMany();
  await prisma.listPlace.deleteMany();
  await prisma.place.deleteMany();
  await prisma.listMember.deleteMany();
  await prisma.list.deleteMany();
  await prisma.category.deleteMany();
  await prisma.account.deleteMany();
  await prisma.session.deleteMany();
  await prisma.verificationToken.deleteMany();
  await prisma.user.deleteMany();

  const [coffee, food, museum, park] = await prisma.$transaction([
    prisma.category.create({ data: { id: "00000000-0000-4000-8000-000000000001", name: "Coffee", iconName: "coffee" } }),
    prisma.category.create({ data: { id: "00000000-0000-4000-8000-000000000002", name: "Food", iconName: "utensils" } }),
    prisma.category.create({ data: { id: "00000000-0000-4000-8000-000000000003", name: "Museum", iconName: "landmark" } }),
    prisma.category.create({ data: { id: "00000000-0000-4000-8000-000000000004", name: "Park", iconName: "trees" } })
  ]);

  const anna = await prisma.user.create({
    data: {
      id: "10000000-0000-4000-8000-000000000001",
      email: "anna@samenroute.demo",
      name: "Anna"
    }
  });

  const bas = await prisma.user.create({
    data: {
      id: "10000000-0000-4000-8000-000000000002",
      email: "bas@samenroute.demo",
      name: "Bas"
    }
  });

  const rotterdamList = await prisma.list.create({
    data: {
      id: "20000000-0000-4000-8000-000000000001",
      ownerUserId: anna.id,
      name: "Rotterdam weekend",
      description: "Favorieten voor koffie, lunch en uitzicht.",
      coverColor: "#1F7A5C"
    }
  });

  const amsterdamList = await prisma.list.create({
    data: {
      id: "20000000-0000-4000-8000-000000000002",
      ownerUserId: bas.id,
      name: "Amsterdam dagje uit",
      description: "Stops voor een lichte route door de stad.",
      coverColor: "#C26D36"
    }
  });

  await prisma.listMember.createMany({
    data: [
      { id: "30000000-0000-4000-8000-000000000001", listId: rotterdamList.id, userId: anna.id, role: ListMemberRole.OWNER },
      { id: "30000000-0000-4000-8000-000000000002", listId: rotterdamList.id, userId: bas.id, role: ListMemberRole.EDITOR },
      { id: "30000000-0000-4000-8000-000000000003", listId: amsterdamList.id, userId: bas.id, role: ListMemberRole.OWNER },
      { id: "30000000-0000-4000-8000-000000000004", listId: amsterdamList.id, userId: anna.id, role: ListMemberRole.VIEWER }
    ]
  });

  const places = await prisma.place.createManyAndReturn({
    data: [
      {
        id: "40000000-0000-4000-8000-000000000001",
        sourceType: PlaceSourceType.MANUAL,
        name: "Man Met Bril Koffie",
        addressLine: "Vijverhofstraat 70",
        city: "Rotterdam",
        country: "Nederland",
        latitude: 51.92443,
        longitude: 4.47773,
        googleMapsUrl: "https://maps.google.com/?q=51.92443,4.47773",
        categoryId: coffee.id,
        createdByUserId: anna.id
      },
      {
        id: "40000000-0000-4000-8000-000000000002",
        sourceType: PlaceSourceType.MANUAL,
        name: "Markthal",
        addressLine: "Dominee Jan Scharpstraat 298",
        city: "Rotterdam",
        country: "Nederland",
        latitude: 51.92064,
        longitude: 4.48716,
        googleMapsUrl: "https://maps.google.com/?q=51.92064,4.48716",
        categoryId: food.id,
        createdByUserId: anna.id
      },
      {
        id: "40000000-0000-4000-8000-000000000003",
        sourceType: PlaceSourceType.MANUAL,
        name: "Depot Boijmans Van Beuningen",
        addressLine: "Museumpark 24",
        city: "Rotterdam",
        country: "Nederland",
        latitude: 51.9146,
        longitude: 4.47117,
        googleMapsUrl: "https://maps.google.com/?q=51.9146,4.47117",
        categoryId: museum.id,
        createdByUserId: anna.id
      },
      {
        id: "40000000-0000-4000-8000-000000000004",
        sourceType: PlaceSourceType.MANUAL,
        name: "Het Park",
        addressLine: "Baden Powelllaan 2",
        city: "Rotterdam",
        country: "Nederland",
        latitude: 51.90591,
        longitude: 4.47054,
        googleMapsUrl: "https://maps.google.com/?q=51.90591,4.47054",
        categoryId: park.id,
        createdByUserId: anna.id
      },
      {
        id: "40000000-0000-4000-8000-000000000005",
        sourceType: PlaceSourceType.MANUAL,
        name: "Fenix Food Factory",
        addressLine: "Veerlaan 19D",
        city: "Rotterdam",
        country: "Nederland",
        latitude: 51.90644,
        longitude: 4.49785,
        googleMapsUrl: "https://maps.google.com/?q=51.90644,4.49785",
        categoryId: food.id,
        createdByUserId: anna.id
      },
      {
        id: "40000000-0000-4000-8000-000000000006",
        sourceType: PlaceSourceType.MANUAL,
        name: "Bocca Coffee",
        addressLine: "Kerkstraat 96H",
        city: "Amsterdam",
        country: "Nederland",
        latitude: 52.36493,
        longitude: 4.88447,
        googleMapsUrl: "https://maps.google.com/?q=52.36493,4.88447",
        categoryId: coffee.id,
        createdByUserId: bas.id
      },
      {
        id: "40000000-0000-4000-8000-000000000007",
        sourceType: PlaceSourceType.MANUAL,
        name: "Rijksmuseum",
        addressLine: "Museumstraat 1",
        city: "Amsterdam",
        country: "Nederland",
        latitude: 52.35999,
        longitude: 4.88522,
        googleMapsUrl: "https://maps.google.com/?q=52.35999,4.88522",
        categoryId: museum.id,
        createdByUserId: bas.id
      },
      {
        id: "40000000-0000-4000-8000-000000000008",
        sourceType: PlaceSourceType.MANUAL,
        name: "Vondelpark",
        addressLine: "Vondelpark",
        city: "Amsterdam",
        country: "Nederland",
        latitude: 52.35795,
        longitude: 4.86865,
        googleMapsUrl: "https://maps.google.com/?q=52.35795,4.86865",
        categoryId: park.id,
        createdByUserId: bas.id
      },
      {
        id: "40000000-0000-4000-8000-000000000009",
        sourceType: PlaceSourceType.MANUAL,
        name: "Foodhallen",
        addressLine: "Bellamyplein 51",
        city: "Amsterdam",
        country: "Nederland",
        latitude: 52.36367,
        longitude: 4.86929,
        googleMapsUrl: "https://maps.google.com/?q=52.36367,4.86929",
        categoryId: food.id,
        createdByUserId: bas.id
      },
      {
        id: "40000000-0000-4000-8000-000000000010",
        sourceType: PlaceSourceType.MANUAL,
        name: "NDSM Wharf",
        addressLine: "NDSM-Plein 90",
        city: "Amsterdam",
        country: "Nederland",
        latitude: 52.40065,
        longitude: 4.89445,
        googleMapsUrl: "https://maps.google.com/?q=52.40065,4.89445",
        categoryId: park.id,
        createdByUserId: bas.id
      },
      {
        id: "40000000-0000-4000-8000-000000000011",
        sourceType: PlaceSourceType.MANUAL,
        name: "Hotel New York",
        addressLine: "Koninginnenhoofd 1",
        city: "Rotterdam",
        country: "Nederland",
        latitude: 51.90575,
        longitude: 4.48454,
        googleMapsUrl: "https://maps.google.com/?q=51.90575,4.48454",
        categoryId: food.id,
        createdByUserId: anna.id
      }
    ]
  });

  const rotterdamListPlaces = await prisma.$transaction(
    places.slice(0, 6).filter((place) => place.city === "Rotterdam").map((place, index) =>
      prisma.listPlace.create({
        data: {
          id: `50000000-0000-4000-8000-00000000000${index + 1}`,
          listId: rotterdamList.id,
          placeId: place.id,
          priority: index % 3,
          sortOrder: index,
          status: index < 2 ? ListPlaceStatus.VISITED : ListPlaceStatus.PLANNED,
          visitedAt: index < 2 ? new Date(Date.now() - (index + 1) * 86_400_000) : null,
          visitedByUserId: index < 2 ? anna.id : null,
          includeInRoute: true,
          isFavorite: index === 0
        }
      })
    )
  );

  const amsterdamPlaces = places.filter((place) => place.city === "Amsterdam");
  const amsterdamListPlaces = await prisma.$transaction(
    amsterdamPlaces.map((place, index) =>
      prisma.listPlace.create({
        data: {
          id: `60000000-0000-4000-8000-00000000000${index + 1}`,
          listId: amsterdamList.id,
          placeId: place.id,
          priority: (index + 1) % 3,
          sortOrder: index,
          status: index === 0 ? ListPlaceStatus.VISITED : ListPlaceStatus.PLANNED,
          visitedAt: index === 0 ? new Date(Date.now() - 2 * 86_400_000) : null,
          visitedByUserId: index === 0 ? bas.id : null,
          includeInRoute: true,
          isFavorite: index === 1
        }
      })
    )
  );

  const seededStops = rotterdamListPlaces.slice(2, 5).map((listPlace) => {
    const place = places.find((candidate) => candidate.id === listPlace.placeId);

    if (!place) {
      throw new Error(`Missing seeded place for listPlace ${listPlace.id}`);
    }

    return { listPlace, place };
  });
  const routePlan = await prisma.routePlan.create({
    data: {
      id: "70000000-0000-4000-8000-000000000001",
      listId: rotterdamList.id,
      createdByUserId: anna.id,
      title: "Vandaag in Rotterdam",
      transportMode: TransportMode.WALKING,
      startPlaceLabel: "Rotterdam Centraal",
      startLatitude: 51.92442,
      startLongitude: 4.46866,
      googleMapsUrl: buildGoogleMapsDirectionsUrl({
        transportMode: TransportMode.WALKING,
        start: {
          label: "Rotterdam Centraal",
          latitude: 51.92442,
          longitude: 4.46866
        },
        stops: seededStops.map(({ place }) => ({
          label: place.name,
          latitude: place.latitude ? Number(place.latitude) : null,
          longitude: place.longitude ? Number(place.longitude) : null
        }))
      }),
      status: RoutePlanStatus.ACTIVE
    }
  });

  await prisma.routePlanStop.createMany({
    data: seededStops.map(({ listPlace }, index) => ({
        id: `80000000-0000-4000-8000-00000000000${index + 1}`,
      routePlanId: routePlan.id,
      listPlaceId: listPlace.id,
      stopOrder: index,
      isCompleted: false
    }))
  });

  await prisma.activityLog.createMany({
    data: [
      {
        id: "90000000-0000-4000-8000-000000000001",
        actorUserId: anna.id,
        listId: rotterdamList.id,
        entityType: "LIST",
        entityId: rotterdamList.id,
        actionType: "list.created",
        payloadJson: { name: rotterdamList.name }
      },
      {
        id: "90000000-0000-4000-8000-000000000002",
        actorUserId: anna.id,
        listId: rotterdamList.id,
        entityType: "PLACE",
        entityId: rotterdamListPlaces[0].id,
        actionType: "list.place_visited",
        payloadJson: { placeName: "Man Met Bril Koffie" }
      },
      {
        id: "90000000-0000-4000-8000-000000000003",
        actorUserId: bas.id,
        listId: amsterdamList.id,
        entityType: "PLACE",
        entityId: amsterdamListPlaces[0].id,
        actionType: "list.place_visited",
        payloadJson: { placeName: "Bocca Coffee" }
      }
    ]
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

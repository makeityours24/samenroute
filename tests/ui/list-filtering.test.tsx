// @vitest-environment jsdom

import { vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";

vi.mock("@/app/(app)/actions", () => ({
  markSkippedAction: vi.fn(),
  markVisitedAction: vi.fn(),
  reorderListPlaceAction: vi.fn()
}));

import { ListPlacesPanel } from "@/components/lists/list-places-panel";

describe("ListPlacesPanel", () => {
  it("filters places on mobile-friendly segmented controls", () => {
    render(
      <ListPlacesPanel
        items={[
          {
            id: "1",
            listId: "list-1",
            name: "Museum",
            location: "Rotterdam",
            status: "PLANNED",
            priority: 1,
            sortOrder: 0,
            isFavorite: false,
            includeInRoute: true
          },
          {
            id: "2",
            listId: "list-1",
            name: "Cafe",
            location: "Rotterdam",
            status: "VISITED",
            priority: 2,
            sortOrder: 1,
            isFavorite: true,
            includeInRoute: true
          }
        ]}
        returnPath="/lists/demo"
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Visited" }));

    expect(screen.getByTestId("filtered-places")).toHaveTextContent("Cafe");
    expect(screen.getByTestId("filtered-places")).not.toHaveTextContent("Museum");
  });
});

// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";
import { CreateListForm } from "@/components/lists/create-list-form";
import { PlaceForm } from "@/components/places/place-form";
import { PlannerForm } from "@/components/today/planner-form";

describe("core forms", () => {
  it("renders the list creation form fields", () => {
    render(
      <CreateListForm
        action={async () => {}}
        footer={
          <Button type="submit" fullWidth>
            Create list
          </Button>
        }
      />
    );

    expect(screen.getByLabelText("List name")).toBeInTheDocument();
    expect(screen.getByLabelText("List description")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create list" })).toBeInTheDocument();
  });

  it("renders the add place form fields", () => {
    render(
      <PlaceForm
        action={async () => {}}
        listId="11111111-1111-4111-8111-111111111111"
        categories={[{ id: "1", name: "Coffee" }]}
        footer={<Button type="submit">Save place</Button>}
      />
    );

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Category")).toBeInTheDocument();
    expect(screen.getByText("Include in route")).toBeInTheDocument();
  });

  it("renders the planner flow UI", () => {
    render(
      <PlannerForm
        action={async () => {}}
        lists={[{ id: "1", name: "Weekend" }]}
        selectedListId="1"
        stops={[{ id: "a", name: "Markthal", detail: "Priority 1", defaultChecked: true }]}
        submitLabel="Generate route"
      />
    );

    expect(screen.getByLabelText("Choose list")).toBeInTheDocument();
    expect(screen.getByText("Markthal")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Generate route" })).toBeInTheDocument();
  });
});

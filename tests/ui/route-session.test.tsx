// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";
import { RouteSessionActions } from "@/components/route-session/route-session-actions";

describe("RouteSessionActions", () => {
  it("keeps route session actions obvious and accessible", () => {
    render(
      <RouteSessionActions>
        <Button>Open in Google Maps</Button>
        <Button>Mark current stop visited</Button>
        <Button variant="secondary">Skip stop</Button>
        <Button variant="ghost">Finish route</Button>
      </RouteSessionActions>
    );

    expect(screen.getByRole("button", { name: "Open in Google Maps" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Mark current stop visited" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Skip stop" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Finish route" })).toBeInTheDocument();
  });
});

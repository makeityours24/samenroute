// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { MemberRow } from "@/components/members/member-row";

describe("MemberRow", () => {
  it("shows member role badges clearly", () => {
    render(
      <div>
        <MemberRow email="owner@example.com" role="OWNER" />
        <MemberRow email="editor@example.com" role="EDITOR" />
        <MemberRow email="viewer@example.com" role="VIEWER" />
      </div>
    );

    expect(screen.getByText("Owner")).toBeInTheDocument();
    expect(screen.getByText("Editor")).toBeInTheDocument();
    expect(screen.getByText("Viewer")).toBeInTheDocument();
  });
});

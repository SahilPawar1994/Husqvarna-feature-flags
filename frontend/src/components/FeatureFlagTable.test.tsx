import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import FeatureFlagTable from "./FeatureFlagTable";
import type { FeatureFlag } from "../types";

const mockFlags: FeatureFlag[] = [
  {
    id: "flag-1",
    key: "new-checkout-flow",
    description: "Enable redesigned checkout",
    environment: "PROD",
    enabled: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

describe("FeatureFlagTable", () => {
  it("should display feature flags", () => {
    render(
      <FeatureFlagTable
        flags={mockFlags}
        loading={false}
        togglingId={null}
        onToggle={vi.fn()}
      />,
    );

    expect(screen.getByText("new-checkout-flow")).toBeInTheDocument();
    expect(screen.getByText("PROD")).toBeInTheDocument();
    expect(screen.getByText("Enabled")).toBeInTheDocument();
  });

  it("should call onToggle when toggle button is clicked", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();

    render(
      <FeatureFlagTable
        flags={mockFlags}
        loading={false}
        togglingId={null}
        onToggle={onToggle}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Toggle new-checkout-flow" }),
    );

    expect(onToggle).toHaveBeenCalledWith("flag-1");
  });
});

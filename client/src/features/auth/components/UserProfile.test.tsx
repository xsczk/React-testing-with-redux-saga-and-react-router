import { render, screen } from "@testing-library/react";
import { UserProfile } from "./UserProfile";

test("greets the user", () => {
  render(<UserProfile />);
  expect(screen.getByText(/hi/i)).toBeInTheDocument();
});

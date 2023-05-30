import { render, screen } from "../../../test-utils";
import { NavBar } from "./NavBar";
import userEvent from "@testing-library/user-event";
import { App } from "../../../App";

describe("sign-in button navigation", () => {
  test("clicking sign-in button pushs 'sign-in' route to history", async () => {
    const user = userEvent.setup();
    const { history } = render(<NavBar />);
    const signInButton = screen.getByRole("button", { name: /sign in/i });
    await user.click(signInButton);
    expect(history.location.pathname).toBe("/signin");
  });

  test("clicking sign-in button shows sign-in page", async () => {
    const user = userEvent.setup();
    render(<App />);
    const signInButton = screen.getByRole("button", { name: /sign in/i });
    await user.click(signInButton);
    expect(
      screen.getByRole("heading", {
        name: /sign in to your account/i,
      })
    ).toBeInTheDocument();
  });
});

describe("display when signed in / not signed in", () => {
  test("should display sign in button when user is null", () => {
    render(<NavBar />);
    const signInButton = screen.getByRole("button", {
      name: /sign in/i,
    });
    expect(signInButton).toBeInTheDocument();
  });

  test("should display sign out button and user email when user is not null", () => {
    render(<NavBar />, {
      preloadedState: {
        user: { userDetails: { email: "wowminhnghia@gmail.com" } },
      },
    });
    const signOuntButton = screen.getByRole("button", {
      name: /sign out/i,
    });
    expect(signOuntButton).toBeInTheDocument();
    expect(screen.getByText(/wowminhnghia@gmail.com/)).toBeInTheDocument();
  });
});

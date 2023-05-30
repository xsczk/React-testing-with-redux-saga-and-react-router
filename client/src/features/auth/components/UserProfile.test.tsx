import { render, screen } from "../../../test-utils";
import { UserProfile } from "./UserProfile";
import { App } from "../../../App";

const testUser = {
  email: "wowminhnghia@gmail.com",
};

test("greets the user", () => {
  render(<UserProfile />, {
    preloadedState: { user: { userDetails: testUser } },
  });
  expect(screen.getByText(/hi, wowminhnghia@gmail.com/i)).toBeInTheDocument();
});

test("redirects to sign-in if user is falsy", () => {
  const { history } = render(<UserProfile />);
  expect(history.location.pathname).toBe("/signin");
  expect(screen.queryByText(/hi/i)).not.toBeInTheDocument();
});

test("view sign-in page when loading profile while not logged in", () => {
  // leave the preloadedState blank so that user is undefined
  render(<App />, { routeHistory: ["/profile"] });
  const heading = screen.getByRole("heading", {
    name: /sign in to your account/i,
  });
  expect(heading).toBeInTheDocument();
});

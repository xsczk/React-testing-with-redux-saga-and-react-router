import { render, screen } from "../../../test-utils";
import { UserProfile } from "./UserProfile";

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

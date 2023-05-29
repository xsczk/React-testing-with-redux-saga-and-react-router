import { SagaIterator } from "redux-saga";
import { call, cancel, cancelled, fork, put, take } from "redux-saga/effects";

import { showToast } from "../../toast/redux/toastSlice";
import { authServerCall } from "../api";
import { LoggedInUser, SignInDetails } from "../types";
import {
  cancelSignIn,
  endSignIn,
  signIn,
  signInRequest,
  signOut,
  startSignIn,
} from "./authSlice";
import { expectSaga } from "redux-saga-test-plan";
import { authenticateUser, signInFlow } from "./signInSaga";
import * as matchers from "redux-saga-test-plan/matchers";
import { StaticProvider } from "redux-saga-test-plan/providers";

const signInRequestPayload: SignInDetails = {
  email: "wowminhnghia@gmail.com",
  password: "12021999",
  action: "signIn",
};

const authServerResponse: LoggedInUser = {
  email: "wowminhnghia@gmail.com",
  token: "12345678901234567890123456789",
  id: 123,
};

const signUpRequestPayload: SignInDetails = {
  email: "wowminhnghia@gmail.com",
  password: "12021999",
  action: "signUp",
};

const networkProviders: Array<StaticProvider> = [
  [matchers.call.fn(authServerCall), authServerResponse],
];

describe("signInFlow saga", () => {
  test("successfull sign-in", () => {
    return (
      expectSaga(signInFlow)
        .provide(networkProviders)
        .dispatch(signInRequest(signInRequestPayload))
        .fork(authenticateUser, signInRequestPayload)
        .put(startSignIn())
        // TODO: create provider
        .call(authServerCall, signInRequestPayload)
        .put(signIn(authServerResponse)) // partial assertion
        .put(
          showToast({
            title: `Signed in as ${authServerResponse.email}`,
            status: "info",
          })
        )
        .put(endSignIn())
        .silentRun() // using silentRun to avoid warning timeout in infinite loop
    );
  });
  test("successfull sign-up", () => {
    return expectSaga(signInFlow)
      .provide(networkProviders)
      .dispatch(signInRequest(signUpRequestPayload))
      .fork(authenticateUser, signUpRequestPayload)
      .put(startSignIn())
      .call(authServerCall, signUpRequestPayload)
      .put(signIn(authServerResponse))
      .put(
        showToast({
          title: `Signed in as ${authServerResponse.email}`,
          status: "info",
        })
      )
      .put(endSignIn())
      .silentRun();
  });
  test.todo("cancelled sign-in");
  test.todo("sign-in error");
});

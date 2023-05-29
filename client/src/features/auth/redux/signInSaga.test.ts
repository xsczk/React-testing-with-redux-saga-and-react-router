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

const sleep = (delay: number) => {
  return new Promise((resolve, reject) => {
    setTimeout(resolve, delay);
  });
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
  test("cancelled sign-in", () => {
    return (
      expectSaga(signInFlow)
        // create dynamic provider to make sure
        // that we have a delay to authServerCall
        // so that cancelSignIn action can be dispatched
        .provide({
          call: async (effect, next) => {
            if (effect.fn === authServerCall) {
              await sleep(500);
            }
            next();
          },
        })
        .dispatch(signInRequest(signInRequestPayload))
        .fork(authenticateUser, signInRequestPayload)
        .dispatch(cancelSignIn())
        .put(showToast({ title: "Sign in canceled", status: "warning" }))
        .put(signOut())
        .put(endSignIn())
        .silentRun()
    );
  });
  test.todo("sign-in error");
});

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

const networkProviders: Array<StaticProvider> = [
  [matchers.call.fn(authServerCall), null],
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
        .put.actionType(signIn.type) // partial assertion
        .put.actionType(showToast.type)
        .put(endSignIn())
        .silentRun() // using silentRun to avoid warning timeout in infinite loop
    );
  });
  test.todo("successfull sign-up");
  test.todo("cancelled sign-in");
  test.todo("sign-in error");
});

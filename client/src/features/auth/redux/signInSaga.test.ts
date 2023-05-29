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

describe("signInFlow saga", () => {
  test.todo("successfull sign-in");
  test.todo("successfull sign-up");
  test.todo("cancelled sign-in");
  test.todo("sign-in error");
});

import { PayloadAction } from "@reduxjs/toolkit";
import { SagaIterator } from "redux-saga";
import { call, put, takeEvery } from "redux-saga/effects";

import { ToastOptions } from "../types";
import { showToast } from "./toastSlice";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const sendToAnalytics = (title: string): void => {
  // presumably this would send the event to some analytics engine
};

// presumably this would send the toast to some analytics engine
const logErrorToast = (title: string) => {
  // eslint-disable-next-line no-console
  console.error("Got error toast!", title);
};

export function* logErrorToasts({
  payload,
}: PayloadAction<ToastOptions>): SagaIterator {
  const { title, status } = payload;
  if (status === "error") {
    yield call(sendToAnalytics, title);
  }
  yield put(showToast({ title, status }));
}

// not very useful, didn't bother adding to root saga
export function* watchToasts(): SagaIterator {
  yield takeEvery(showToast.type, logErrorToasts);
}

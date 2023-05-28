import { PayloadAction } from "@reduxjs/toolkit";
import axios, { CancelTokenSource } from "axios";
import { SagaIterator } from "redux-saga";
import {
  call,
  cancel,
  cancelled,
  put,
  race,
  select,
  take,
  takeEvery,
} from "redux-saga/effects";

import { HoldReservation } from "../../../../../shared/types";
import { showToast } from "../../toast/redux/toastSlice";
import { ToastOptions } from "../../toast/types";
import {
  cancelPurchaseServerCall,
  releaseServerCall,
  reserveTicketServerCall,
} from "../api";
import { TicketAction } from "../types";
import {
  endTransaction,
  holdTickets,
  PurchasePayload,
  ReleasePayload,
  resetTransaction,
  selectors,
  startTicketAbort,
  startTicketPurchase,
  startTicketRelease,
} from "./ticketSlice";
import { expectSaga } from "redux-saga-test-plan";
import {
  generateErrorToastOptions,
  cancelTransaction,
  purchaseTickets,
  ticketFlow,
} from "./ticketSaga";
import {
  holdReservation,
  purchaseReservation,
  purchasePayload,
} from "../../../test-utils/fake-data";
import * as matchers from "redux-saga-test-plan/matchers";
import { StaticProvider, throwError } from "redux-saga-test-plan/providers";

const holdAction = {
  type: "test",
  payload: holdReservation,
};

const networkProviders: Array<StaticProvider> = [
  [matchers.call.fn(reserveTicketServerCall), null],
  [matchers.call.fn(releaseServerCall), null],
  [matchers.call.fn(cancelPurchaseServerCall), null],
];

test("cancelTransaction cancels hold and resets transaction", () => {
  return expectSaga(cancelTransaction, holdReservation)
    .provide(networkProviders)
    .call(releaseServerCall, holdReservation)
    .put(resetTransaction())
    .run();
});

describe("common to all flows", () => {
  test("starts with hold call to server", () => {
    // expectSaga is asynchronous fn so we have to use return keyword or async await
    return (
      expectSaga(ticketFlow, holdAction)
        .provide(networkProviders)
        .dispatch(
          startTicketAbort({
            reservation: holdReservation,
            reason: "Abort request",
          })
        )
        // .call(reserveTicketServerCall, holdReservation)
        .run()
    );
  });
  test("show error toast and clean up after server error", () => {
    return (
      expectSaga(ticketFlow, holdAction)
        .provide([
          [
            matchers.call.fn(reserveTicketServerCall),
            throwError(new Error(`It's did not work`)),
          ],
          // write providers for selector
          [
            matchers.select.selector(selectors.getTicketAction),
            TicketAction.hold,
          ],
          // based on the documentation, the first provider to match an effect is used,
          // skipping subsequent providers, so we can use spread operator of network provider
          // to override the releaseServerCall fn() without caring about reserveTicketServerCall fn()
          ...networkProviders,
        ])
        // assert on startToast action
        .put(
          showToast(
            generateErrorToastOptions(`It's did not work`, TicketAction.hold)
          )
        )
        .call(cancelTransaction, holdReservation)
        .run()
    );
  });
});

describe("purchase flow", () => {
  test("network error on purchase shows toast and cancels transaction", () => {
    return expectSaga(ticketFlow, holdAction)
      .provide([
        [
          matchers.call.like({
            fn: reserveTicketServerCall,
            args: [purchaseReservation], // not holdReservation
          }),
          throwError(new Error(`it did not work!`)),
        ],
        [
          matchers.select.selector(selectors.getTicketAction),
          TicketAction.hold,
        ],
        ...networkProviders,
      ])
      .dispatch(startTicketPurchase(purchasePayload))
      .call(cancelPurchaseServerCall, purchaseReservation)
      .put(
        showToast(
          generateErrorToastOptions(`it did not work!`, TicketAction.hold)
        )
      )
      .call(cancelTransaction, holdReservation)
      .run();
  });

  test("abort purchase while call to server is running", () => {
    const cancelSource = axios.CancelToken.source();
    return (
      expectSaga(purchaseTickets, purchasePayload, cancelSource)
        .provide([
        // dynamic providers
          {
            race: () => ({
              abort: true,
            }),
          },
          ...networkProviders,
        ])
        .call(cancelSource.cancel)
        .call(cancelPurchaseServerCall, purchaseReservation)
        .put(showToast({ title: "purchase canceled", status: "warning" }))
        .call(cancelTransaction, holdReservation)
        .not.put(showToast({ title: "tickets purchased", status: "success" }))
        .run()
    );
  });
});

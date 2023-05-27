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

const holdAction = {
  type: "test",
  payload: holdReservation,
};

describe("common to all flows", () => {
  test("starts with hold call to server", () => {
    // expectSaga is asynchronous fn so we have to use return keyword or async await
    return expectSaga(ticketFlow, holdAction)
      .provide([
        [matchers.call.fn(reserveTicketServerCall), null],
        [matchers.call.fn(releaseServerCall), null],
      ])
      .dispatch(
        startTicketAbort({
          reservation: holdReservation,
          reason: "Abort request",
        })
      )
      .call(reserveTicketServerCall, holdReservation)
      .run();
  });
});

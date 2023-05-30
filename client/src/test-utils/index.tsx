import {
  RenderOptions,
  RenderResult,
  render as rtlRender,
} from "@testing-library/react";
import { createMemoryHistory } from "history";
import { ReactElement } from "react";
import { Provider } from "react-redux";
import { RootState, configureStoreWithMiddlewares } from "../app/store";
import { Router } from "react-router";

type CustomRenderOptions = {
  preloadedState?: RootState;
  routeHistory?: Array<string>;
  initialRouteIndex?: number;
  renderOptions?: Omit<RenderOptions, "wrapper">;
};

const render = (
  ui: ReactElement,
  {
    preloadedState = {},
    routeHistory,
    initialRouteIndex,
    ...renderOptions
  }: CustomRenderOptions = {}
): RenderResult => {
  const Wrapper: React.FC = ({ children }) => {
    const store = configureStoreWithMiddlewares(preloadedState);
    const history = createMemoryHistory({
      initialEntries: routeHistory,
      initialIndex: initialRouteIndex,
    });
    return (
      <Provider store={store}>
        {/* @ts-ignore */}
        <Router history={history}>{children}</Router>
      </Provider>
    );
  };
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
};

export * from "@testing-library/react";
export { render };

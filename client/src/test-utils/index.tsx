import {
  RenderOptions,
  RenderResult,
  render as rtlRender,
} from "@testing-library/react";
import { MemoryHistory, createMemoryHistory } from "history";
import { ReactElement } from "react";
import { Provider } from "react-redux";
import { Router } from "react-router";
import { RootState, configureStoreWithMiddlewares } from "../app/store";

type CustomRenderOptions = {
  preloadedState?: RootState;
  routeHistory?: Array<string>;
  initialRouteIndex?: number;
  renderOptions?: Omit<RenderOptions, "wrapper">;
};

type CustomRenderResult = RenderResult & { history: MemoryHistory };

const render = (
  ui: ReactElement,
  {
    preloadedState = {},
    routeHistory,
    initialRouteIndex,
    ...renderOptions
  }: CustomRenderOptions = {}
): CustomRenderResult => {
  const history = createMemoryHistory({
    initialEntries: routeHistory,
    initialIndex: initialRouteIndex,
  });
  const Wrapper: React.FC = ({ children }) => {
    const store = configureStoreWithMiddlewares(preloadedState);
    return (
      <Provider store={store}>
        {/* @ts-ignore */}
        <Router history={history}>{children}</Router>
      </Provider>
    );
  };
  const rtlRenderObject = rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
  return { ...rtlRenderObject, history };
};

export * from "@testing-library/react";
export { render };

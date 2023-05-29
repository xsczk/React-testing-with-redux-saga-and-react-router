import {
  render as rtlRender,
  RenderResult,
  RenderOptions,
} from "@testing-library/react";
import { Provider } from "react-redux";
import { configureStoreWithMiddlewares, RootState } from "../app/store";
import { ReactElement, ReactNode } from "react";

type CustomRenderOptions = {
  preloadedState?: RootState;
  renderOptions?: Omit<RenderOptions, "wrapper">;
};

const render = (
  ui: ReactElement,
  { preloadedState = {}, ...renderOptions }: CustomRenderOptions = {}
): RenderResult => {
  const Wrapper: React.FC = ({ children }) => {
    const store = configureStoreWithMiddlewares(preloadedState);
    // @ts-ignore
    return <Provider store={store}>{children}</Provider>;
  };
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
};

export * from "@testing-library/react";
export { render };

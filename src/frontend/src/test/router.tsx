import {
  Outlet,
  RouterProvider,
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import type { ReactNode } from "react";

/**
 * Builds a memory router whose root renders the given element, so components
 * that use `Link`/`useNavigate` can be exercised without the app's real routes.
 * Returns the router so callers can `await router.load()` before asserting.
 */
export function buildTestRouter(
  element: ReactNode,
  initialPath = "/",
  elementPath = "/",
) {
  const rootRoute = createRootRoute({
    component: () => (
      <>
        <Outlet />
      </>
    ),
  });

  const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: () => (elementPath === "/" ? <>{element}</> : <div />),
  });

  const chatRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/chat",
    component: () =>
      elementPath === "/chat" ? (
        <>{element}</>
      ) : (
        <div data-testid="chat-route">chat</div>
      ),
  });

  const routeTree = rootRoute.addChildren([indexRoute, chatRoute]);
  return createRouter({
    routeTree,
    history: createMemoryHistory({ initialEntries: [initialPath] }),
  });
}

export function renderInRouter(element: ReactNode, initialPath = "/") {
  return <RouterProvider router={buildTestRouter(element, initialPath)} />;
}

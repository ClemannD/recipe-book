import { type Dispatch, createContext, useContext, useReducer } from 'react';

export interface NavbarState {
  desktopNavbarExpanded: boolean;
}
export enum NavbarStateAction {
  ToggleDesktopNavbar,
}

const NavbarStateContext = createContext<NavbarState>({
  desktopNavbarExpanded: false,
});
const NavbarStateDispatchContext =
  createContext<Dispatch<NavbarStateAction> | null>(null);

function navbarStateReducer(state: NavbarState, action: NavbarStateAction) {
  switch (action) {
    case NavbarStateAction.ToggleDesktopNavbar:
      return {
        desktopNavbarExpanded: !state.desktopNavbarExpanded,
      };
    default:
      return state;
  }
}

export function useNavbarState() {
  return useContext(NavbarStateContext);
}

export function useNavbarStateDispatch() {
  return useContext(NavbarStateDispatchContext);
}

export function NavbarStateProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(navbarStateReducer, {
    desktopNavbarExpanded: false,
  });

  return (
    <NavbarStateContext.Provider value={state}>
      <NavbarStateDispatchContext.Provider value={dispatch}>
        {children}
      </NavbarStateDispatchContext.Provider>
    </NavbarStateContext.Provider>
  );
}

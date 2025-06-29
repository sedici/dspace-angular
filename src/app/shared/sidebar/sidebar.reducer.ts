import {
  SidebarAction,
  SidebarActionTypes,
  SidebarMode
} from './sidebar.actions';

/**
 * Interface that represents the state of the sidebar
 */
export interface SidebarState {
  sidebarCollapsed: boolean;
  mode: SidebarMode;
}

const initialState: SidebarState = {
  sidebarCollapsed: true,
  mode: SidebarMode.DEFAULT
};

/**
 * Performs a sidebar action on the current state
 * @param {SidebarState} state The state before the action is performed
 * @param {SidebarAction} action The action that should be performed
 * @returns {SidebarState} The state after the action is performed
 */
export function sidebarReducer(state = initialState, action: SidebarAction): SidebarState {
  switch (action.type) {

    case SidebarActionTypes.COLLAPSE: {
      return Object.assign({}, state, {
        sidebarCollapsed: true,
        mode: SidebarMode.DEFAULT
      });
    }

    case SidebarActionTypes.EXPAND: {
      return Object.assign({}, state, {
        sidebarCollapsed: false,
        mode: SidebarMode.DEFAULT
      });
    }

    case SidebarActionTypes.EXPAND_WITH_MODE: {
      return Object.assign({}, state, {
        sidebarCollapsed: false,
        mode: action.payload
      });
    }

    case SidebarActionTypes.TOGGLE: {
      return Object.assign({}, state, {
        sidebarCollapsed: !state.sidebarCollapsed,
        mode: SidebarMode.DEFAULT
      });
    }

    default: {
      return state;
    }
  }
}

export const initialState = {
  auth_token: null,
  user: null,
  newListingScreen: false,
  search_categories: [],
  search_locations: [],
  listing_locations: null,
  cat_name: "",
  button_hidden: false,
  chat_badge: null,
  is_connected: true,
  config: {
    currency: {
      id: "USD",
      symbol: "&#36;",
      position: "left",
      separator: {
        decimal: ".",
        thousand: ",",
      },
    },
    location_type: "local",
    //local or google
    mark_as_sold: false,
  },
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_AUTH_DATA":
      let new_state = state;
      if (
        action.data.user !== undefined &&
        action.data.auth_token !== undefined
      ) {
        new_state = {
          ...state,
          user: action.data.user,
          auth_token: action.data.auth_token,
        };
      } else if (action.data.user === undefined && action.data.auth_token) {
        new_state = {
          ...state,
          auth_token: action.data.auth_token,
        };
      } else if (action.data.user && action.data.auth_token === undefined) {
        new_state = {
          ...state,
          user: action.data.user,
        };
      }
      return new_state;
    case "SET_NEW_LISTING_SCREEN":
      return {
        ...state,
        newListingScreen: action.newListingScreen,
      };

    case "SET_SEARCH_LOCATIONS":
      return {
        ...state,
        search_locations: action.search_locations,
      };

    case "SET_SEARCH_CATEGORIES":
      return {
        ...state,
        search_categories: action.search_categories,
      };

    case "SET_LISTING_LOCATIONS":
      return {
        ...state,
        listing_locations: action.listing_locations,
      };
    case "SET_CAT_NAME":
      return {
        ...state,
        cat_name: action.cat_name,
      };

    case "SET_BUTTON_HIDDEN":
      return {
        ...state,
        button_hidden: action.button_hidden,
      };

    case "SET_CHAT_BADGE":
      return {
        ...state,
        chat_badge: action.chat_badge,
      };
    case "SET_CONFIG":
      return {
        ...state,
        config: action.config,
      };
    case "IS_CONNECTED":
      return {
        ...state,
        is_connected: action.is_connected,
      };
    default:
      return state;
  }
};

export default reducer;

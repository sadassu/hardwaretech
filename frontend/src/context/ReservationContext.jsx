import { createContext } from "react";
import { useReducer } from "react";

export const ReservationsContext = createContext();

const initialState = {
  reservations: [],
  total: 0,
  page: 1,
  pages: 1,
};

export const reservationsReducer = (state, action) => {
  switch (action.type) {
    case "SET_RESERVATIONS":
      return {
        ...state,
        reservations: action.payload.reservations,
        total: action.payload.total,
        page: action.payload.page,
        pages: action.payload.pages,
      };

    case "CREATE_RESERVATION":
      return {
        ...state,
        reservations: [action.payload, ...state.reservations],
        total: state.total + 1,
      };

    case "DELETE_RESERVATION":
      return {
        ...state,
        reservations: state.reservations.filter(
          (r) => r._id !== action.payload._id
        ),
        total: state.total - 1,
      };

    case "UPDATE_RESERVATION":
      return {
        ...state,
        reservations: state.reservations.map((reservation) =>
          reservation._id === action.payload._id ? action.payload : reservation
        ),
      };

    default:
      return state;
  }
};

export const ReservationContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reservationsReducer, initialState);

  return (
    <ReservationsContext.Provider value={{ ...state, dispatch }}>
      {children}
    </ReservationsContext.Provider>
  );
};

import { createContext, useReducer } from "react";

export const SalesContext = createContext();

const initialState = {
  sales: [],
  total: 0,
  page: 1,
  pages: 1,
};

export const salesReducer = (state, action) => {
  switch (action.type) {
    case "SET_SALES":
      return {
        ...state,
        sales: action.payload.sales,
        total: action.payload.total,
        page: action.payload.page,
        pages: action.payload.pages,
      };
    case "UPDATE_SALE":
      return {
        ...state,
        sales: state.sales.map((sale) =>
          sale._id === action.payload._id ? action.payload : sale
        ),
      };

    case "CLEAR_SALES":
      return {
        ...state,
        sales: [],
        total: 0,
        page: 1,
        pages: 1,
      };

    default:
      return state;
  }
};

export const SaleContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(salesReducer, initialState);

  return (
    <SalesContext.Provider value={{ ...state, dispatch }}>
      {children}
    </SalesContext.Provider>
  );
};

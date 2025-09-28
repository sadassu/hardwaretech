import { useReducer } from "react";
import { createContext } from "react";

export const ProductsContext = createContext();

const initialState = {
  products: [],
  total: 0,
  page: 1,
  pages: 1,
};

export const productsReducer = (state, action) => {
  switch (action.type) {
    case "SET_PRODUCTS":
      return {
        ...state,
        products: action.payload.products,
        total: action.payload.total,
        page: action.payload.page,
        pages: action.payload.pages,
      };

    case "UPDATE_VARIANT":
      return {
        ...state,
        products: state.products.map((product) =>
          product._id === action.payload.productId
            ? {
                ...product,
                variants: product.variants
                  ? [
                      // check if variant already exists → update
                      ...product.variants.filter(
                        (v) => v._id !== action.payload.variant._id
                      ),
                      action.payload.variant,
                    ]
                  : [action.payload.variant], // if no variants yet
              }
            : product
        ),
      };

    case "DELETE_VARIANT":
      return {
        ...state,
        products: state.products.map((product) =>
          product._id === action.payload.productId
            ? {
                ...product,
                variants: product.variants.filter(
                  (v) => v._id !== action.payload.variantId
                ),
              }
            : product
        ),
      };

    case "CREATE_PRODUCT":
      return {
        ...state,
        products: [action.payload, ...state.products],
        total: state.total ? state.total + 1 : 1,
      };

    case "DELETE_PRODUCT":
      return {
        ...state,
        products: state.products.filter((p) => p._id !== action.payload),
        total: state.total - 1,
      };

    case "UPDATE_PRODUCT":
      return {
        ...state,
        products: state.products.map((product) =>
          product._id === action.payload._id ? action.payload : product
        ),
      };

    case "CLEAR_PRODUCTS":
      return {
        ...state,
        products: [],
        total: 0,
        page: 1,
        pages: 1,
      };

    default:
      return state;
  }
};

export const ProductContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(productsReducer, initialState);

  return (
    <ProductsContext.Provider value={{ ...state, dispatch }}>
      {children}
    </ProductsContext.Provider>
  );
};

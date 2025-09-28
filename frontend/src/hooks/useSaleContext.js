import { useContext } from "react";
import { SalesContext } from "../context/SaleContext";

export const useSalesContext = () => {
  const context = useContext(SalesContext);

  if (!context) {
    throw Error("useSalesContext must be used inside SalesContextProvider");
  }

  return context;
};

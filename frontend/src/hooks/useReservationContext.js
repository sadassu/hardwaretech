import { useContext } from "react";
import { ReservationsContext } from "../context/ReservationContext";

export const useReservationsContext = () => {
  const context = useContext(ReservationsContext);

  if (!context) {
    throw Error(
      "useReservationsContext must be used inside ReservationsContextProvider"
    );
  }

  return context;
};

import { useState, useEffect } from "react";
import api from "../utils/api";

export const useFetch = (url, options = {}, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false); // default false
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    // ⛔ Skip if url is not provided
    if (!url) {
      return;
    }

    setLoading(true);
    setError(null);

    const fetchData = async () => {
      try {
        const response = await api.get(url, options);
        if (isMounted) {
          setData(response.data);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.response?.data?.message || err.message);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);

  return { data, loading, error };
};

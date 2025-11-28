import { useEffect, useMemo, useState } from "react";

const normalizeTopics = (topics = []) =>
  Array.from(new Set(topics.filter(Boolean)));

export const useLiveResourceRefresh = (topics = []) => {
  const [refreshKey, setRefreshKey] = useState(0);
  const topicSignature = useMemo(() => normalizeTopics(topics).join("|"), [topics]);

  useEffect(() => {
    const normalizedTopics = topicSignature
      ? topicSignature.split("|").filter(Boolean)
      : [];

    const handler = (event) => {
      const eventTopics = event.detail?.topics || [];
      if (
        !normalizedTopics.length ||
        eventTopics.some((topic) => normalizedTopics.includes(topic))
      ) {
        setRefreshKey((prev) => prev + 1);
      }
    };

    window.addEventListener("live-update", handler);
    return () => {
      window.removeEventListener("live-update", handler);
    };
  }, [topicSignature]);

  return refreshKey;
};

export default useLiveResourceRefresh;


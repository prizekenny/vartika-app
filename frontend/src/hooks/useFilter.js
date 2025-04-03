// src/hooks/useFilter.js

import { useState } from "react";

export default function useFilter(map, initial = "All") {
  const [label, setLabel] = useState(initial);

  const getValue = () => {
    if (label === "All") return undefined;
    return map.find((item) => item.label === label)?.value;
  };

  return {
    label,
    setLabel,
    options: ["All", ...map.map((m) => m.label)],
    value: getValue(),
  };
}

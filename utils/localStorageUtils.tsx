const loadAndCleanCurrency = (key: string, defaultValue: string): string => {
  if (typeof window === "undefined") return defaultValue;
  const rawValue = localStorage.getItem(key);
  if (rawValue === null) return defaultValue;

  let currentValueToParse = rawValue;
  try {
    let parsed = JSON.parse(currentValueToParse);

    while (
      typeof parsed === "string" &&
      parsed.startsWith('"') &&
      parsed.endsWith('"') &&
      parsed.length > 1
    ) {
      try {
        parsed = JSON.parse(parsed);
      } catch (e) {
        break;
      }
    }

    if (typeof parsed === "string") {
      if (parsed.startsWith('"') && parsed.endsWith('"') && parsed.length > 1) {
        return parsed.substring(1, parsed.length - 1);
      }
      return parsed;
    } else {
      console.warn(
        `Currency for key ${key} parsed to non-string: ${JSON.stringify(
          parsed
        )}. Using raw value if string, or default.`
      );
      if (typeof rawValue === "string" && /^[a-zA-Z0-9]{1,10}$/.test(rawValue))
        return rawValue;
      return defaultValue;
    }
  } catch (error) {
    if (typeof rawValue === "string") {
      if (
        rawValue.startsWith('"') &&
        rawValue.endsWith('"') &&
        rawValue.length > 1
      ) {
        let unquoted = rawValue.substring(1, rawValue.length - 1);
        while (
          typeof unquoted === "string" &&
          unquoted.startsWith('"') &&
          unquoted.endsWith('"') &&
          unquoted.length > 1
        ) {
          try {
            unquoted = JSON.parse(unquoted);
          } catch (e) {
            break;
          }
        }
        if (typeof unquoted === "string") return unquoted;
      }
      if (/^[a-zA-Z0-9]{1,10}$/.test(rawValue)) {
        return rawValue;
      }
    }
    console.warn(
      `Failed to load/clean currency for key ${key}. Raw: "${rawValue}". Error: ${error}. Defaulting to ${defaultValue}.`
    );
    return defaultValue;
  }
};

export { loadAndCleanCurrency };

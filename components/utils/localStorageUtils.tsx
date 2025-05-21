const loadAndCleanCurrency = (key: string, defaultValue: string): string => {
  if (typeof window === "undefined") return defaultValue;
  const rawValue = localStorage.getItem(key);
  if (rawValue === null) return defaultValue;

  let currentValueToParse = rawValue;
  try {
    let parsed = JSON.parse(currentValueToParse);

    // Handle multiple layers of stringification (e.g., value was "\"\\\"usd\\\"\"")
    while (
      typeof parsed === "string" &&
      parsed.startsWith('"') &&
      parsed.endsWith('"') &&
      parsed.length > 1
    ) {
      try {
        parsed = JSON.parse(parsed);
      } catch (e) {
        // If further parsing fails, 'parsed' is the string like "\"btc\"". Break and use it as is (it will be cleaned below if it still has quotes).
        break;
      }
    }

    if (typeof parsed === "string") {
      // If after all parsing, it's still like "\"btc\"", clean it.
      if (parsed.startsWith('"') && parsed.endsWith('"') && parsed.length > 1) {
        return parsed.substring(1, parsed.length - 1);
      }
      return parsed; // Should be the clean currency code, e.g., "usd" or "btc"
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
    // Initial JSON.parse(rawValue) failed. RawValue might be a clean string "usd", or a problematic one like "\"btc\"" (stored raw without JSON stringification).
    if (typeof rawValue === "string") {
      // If rawValue is like "\"btc\"" (a string literal containing quotes)
      if (
        rawValue.startsWith('"') &&
        rawValue.endsWith('"') &&
        rawValue.length > 1
      ) {
        let unquoted = rawValue.substring(1, rawValue.length - 1);
        // Check if this unquoted string was itself a JSON string that needs further parsing
        while (
          typeof unquoted === "string" &&
          unquoted.startsWith('"') &&
          unquoted.endsWith('"') &&
          unquoted.length > 1
        ) {
          try {
            unquoted = JSON.parse(unquoted);
          } catch (e) {
            break; // Stop if further parsing fails
          }
        }
        if (typeof unquoted === "string") return unquoted; // Return the finally unquoted string
      }
      // If rawValue is a simple string like "usd"
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

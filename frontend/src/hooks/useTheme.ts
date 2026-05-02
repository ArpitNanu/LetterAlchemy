// --- 🎓 LEARNING MOMENT: Custom Hooks ---
// A "custom hook" is just a normal function that starts with "use".
// It lets us EXTRACT reusable logic out of components.
// Any component that calls useTheme() will share the EXACT same dark mode logic.
// This means toggling from TopBar will also update the Profile page — automatically.

import { useState, useEffect } from "react";

export const useTheme = () => {
  // Step 1: Read from localStorage on first load.
  // If the user previously chose "dark", we start in dark mode immediately.
  // If nothing is saved, we default to light mode ("light").
  const [theme, setTheme] = useState<"light" | "dark">(
    () => (localStorage.getItem("la-theme") as "light" | "dark") || "light"
  );

  // Step 2: Whenever the theme changes, apply it to the <html> element.
  // document.documentElement IS the <html> tag.
  // Adding the class "dark" to it activates ALL the `.dark` CSS variables in your index.css.
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    // Step 3: Persist the choice to localStorage so it survives a page refresh.
    localStorage.setItem("la-theme", theme);
  }, [theme]); // This runs every time `theme` changes.

  // Step 4: The toggle function flips between "light" and "dark".
  const toggle = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  // Step 5: Return the values any component will need.
  return { isDark: theme === "dark", toggle };
};

import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}", "./lib/**/*.{js,ts,jsx,tsx}", "./pages/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#05060a",
        surface: "#10121a",
        accent: {
          50: "#f2f8ff",
          100: "#d9eaff",
          200: "#b3d4ff",
          300: "#8cbfff",
          400: "#66aaff",
          500: "#3f95ff",
          600: "#2172db",
          700: "#165bab",
          800: "#0d3e73",
          900: "#061f3a",
        }
      }
    }
  },
  plugins: [],
};

export default config;

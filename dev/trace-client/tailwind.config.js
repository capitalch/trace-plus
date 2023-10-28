/** @type {import('tailwindcss').Config} */
import colors from "tailwindcss/colors";

export default {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          // Royal blue
          50: "#E6EFF9",
          100: "#D2E2F4",
          200: "#A1C3E8",
          300: "#74A7DD",
          400: "#4287D1",
          500: "#2B6CB0",
          600: "#22558B",
          700: "#1A416B",
          800: "#112A46",
          900: "#091625",
          950: "#040A10",
        },
        secondary: {
          // Peach
          50: "#FDF5F1",
          100: "#FBECE4",
          200: "#F8DCCD",
          300: "#F5C9B2",
          400: "#F1B597",
          500: "#EEA47F",
          600: "#E5753D",
          700: "#C2521A",
          800: "#833711",
          900: "#3F1B08",
          950: "#200D04",
        },
        tertiary: {
          50: "#F4F1EC",
          100: "#EAE5DB",
          200: "#D4CAB5",
          300: "#BFB091",
          400: "#AB966E",
          500: "#8C7851",
          600: "#716141",
          700: "#544831",
          800: "#372F20",
          900: "#1D1911",
          950: "#0D0B07",
        },
        info: {
          50: "#FFF3EB",
          100: "#FFE7D6",
          200: "#FFD2B3",
          300: "#FFBB8A",
          400: "#FFA361",
          500: "#FF8E3C",
          600: "#FA6800",
          700: "#BD4F00",
          800: "#803500",
          900: "#3D1A00",
          950: "#1F0D00",
        },
        success: colors.green,
        error: colors.red,
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"), 
    require("@tailwindcss/forms")
  ],
};

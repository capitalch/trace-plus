/** @type {import('tailwindcss').Config} */
import colors from "tailwindcss/colors";
import defaultTheme from "tailwindcss/defaultTheme";
export default {
  content: ["./src/**/*.{html,js,jsx,ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter var", ...defaultTheme.fontFamily.sans],
      },
      colors: {
        primary: {
          // Royal blue
          50: "#EAEBF5",
          100: "#D5D6EB",
          200: "#AFB1DA",
          300: "#8588C6",
          400: "#5C5FB3",
          500: "#444791",
          600: "#363873",
          700: "#292A57",
          800: "#1C1D3B",
          900: "#0D0E1C",
          950: "#07070E",
        },
        secondary: {
          // teal
          50: "#DEF6F7",
          100: "#C2EEF0",
          200: "#80DCE0",
          300: "#43CCD0",
          400: "#279B9F",
          500: "#185E61",
          600: "#134C4E",
          700: "#0E3839",
          800: "#092425",
          900: "#051414",
          950: "#020808",
        },
        tertiary: {
          50: "#FEF3E6",
          100: "#FEE8CD",
          200: "#FCCF97",
          300: "#FBB765",
          400: "#FAA033",
          500: "#F08706",
          600: "#C26D05",
          700: "#905104",
          800: "#5F3502",
          900: "#321C01",
          950: "#190E01",
        },
        info: {
          50: "#FFF9E5",
          100: "#FFF4D1",
          200: "#FFE79E",
          300: "#FFDB70",
          400: "#FFD042",
          500: "#FFC312",
          600: "#DBA400",
          700: "#A37A00",
          800: "#6B5000",
          900: "#382A00",
          950: "#191300",
        },
        success: colors.green,
        error: colors.red,
      },
    },
  },
  plugins: [require("@tailwindcss/typography"), require("@tailwindcss/forms")],
};

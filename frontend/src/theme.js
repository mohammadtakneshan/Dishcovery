const theme = {
  colors: {
    headerBlue: "#1F4E79",
    brand: "#1F4E79",

    pageBg: "#F6F4F4",
    background: "#F6F4F4",

    surface: "#F6F4F4",
    subtleBorder: "#ECEBEA",
    cardBorder: "#ECEBEA",
    outline: "#E8E4E2",

    muted: "#6B7280",
    text: "#1F2937",

    buttonBg: "#0B0B0B",
    buttonHover: "#1F4E79",
    buttonText: "#FFFFFF",

    infoBg: "#F1F6FB",
    infoBorder: "#DDEAF6",
  },

  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 24,
    xl: 36,
  },

  radii: {
    sm: 6,
    md: 10,
    lg: 14,
    apple: 12,
  },

  shadows: {
    soft: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 3,
    },
    pronounced: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.12,
      shadowRadius: 18,
      elevation: 6,
    },
  },

  typography: {
    heading: { fontSize: 20, fontWeight: "800" },
    subheading: { fontSize: 16, fontWeight: "700" },
    body: { fontSize: 14, fontWeight: "400" },
    label: { fontSize: 13, fontWeight: "600" },
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },

  button: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
};

export default theme;

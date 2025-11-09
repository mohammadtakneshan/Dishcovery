const theme = {
  colors: {
    brand: "#E76F51",
    brandDark: "#C85A3F",
    accent: "#47966a", // green for action & success
    background: "#FFF8F3", // very light warm background
    surface: "#FFFFFF", // card surface
    muted: "#6B7280", // for secondary text
    text: "#1F2937", // primary text
    danger: "#E53E3E",
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
  },

  typography: {
    heading: { fontSize: 20, fontWeight: "800" },
    subheading: { fontSize: 16, fontWeight: "700" },
    body: { fontSize: 14, fontWeight: "400" },
    label: { fontSize: 13, fontWeight: "600" },
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },

  button: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
};

export default theme;

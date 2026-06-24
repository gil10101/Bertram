// Theme-aware Clerk appearance. Element classes use semantic Tailwind tokens
// (bg-card, text-foreground, …) so they adapt automatically; only the color
// `variables` are hardcoded per theme.

const elements = {
  rootBox: "w-full",
  cardBox: "w-full shadow-none",
  card: "bg-card border border-border shadow-none rounded-lg w-full",
  navbar: "bg-card border-r-border",
  navbarButton: "text-muted-foreground hover:text-foreground hover:bg-accent",
  navbarButtonActive: "text-foreground bg-accent",
  headerTitle: "text-foreground",
  headerSubtitle: "text-muted-foreground",
  profileSectionTitle: "text-foreground border-b-border",
  profileSectionTitleText: "text-foreground",
  profileSectionContent: "text-foreground",
  profileSectionPrimaryButton: "text-paprika hover:text-paprika-500",
  formFieldLabel: "text-muted-foreground",
  formFieldInput: "bg-background border-border text-foreground focus:ring-ring",
  formButtonPrimary: "bg-primary text-primary-foreground hover:bg-primary/90",
  formButtonReset: "text-muted-foreground hover:text-foreground",
  badge: "bg-accent text-accent-foreground",
  avatarBox: "border-border",
  pageScrollBox: "p-0",
  page: "gap-6",
  profilePage: "gap-6",
  accordionTriggerButton: "text-foreground hover:bg-accent",
  accordionContent: "text-muted-foreground",
  menuButton: "text-muted-foreground hover:text-foreground hover:bg-accent",
  menuList: "bg-card border-border",
  menuItem: "text-foreground hover:bg-accent",
};

const darkVariables = {
  colorPrimary: "#eb5e28",
  colorText: "#F5F2E9",
  colorTextSecondary: "#CCC5B9",
  colorBackground: "#2D2821",
  colorInputBackground: "#1E1D1B",
  colorInputText: "#F5F2E9",
  borderRadius: "0.5rem",
};

const lightVariables = {
  colorPrimary: "#eb5e28",
  colorText: "#1a1714",
  colorTextSecondary: "#5a564e",
  colorBackground: "#ffffff",
  colorInputBackground: "#ffffff",
  colorInputText: "#1a1714",
  borderRadius: "0.5rem",
};

export function clerkAppearance(isDark: boolean) {
  return { elements, variables: isDark ? darkVariables : lightVariables };
}

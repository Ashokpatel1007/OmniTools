export const siteConfig = {
  name: "OmniTools",
  title: "OmniTools — production-grade online utilities",
  description:
    "A fast, organized utility suite for images, PDFs, media, text, developers, files, and everyday calculations.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://omnitool.example",
  ogImage: "/icon.svg",
};

export const navItems = [
  { href: "/", label: "Home" },
  { href: "/categories", label: "Categories" },
  { href: "/favorites", label: "Favorites" },
  { href: "/recent", label: "Recent" },
  { href: "/search", label: "Search" },
  { href: "/donate", label: "Support" },
];

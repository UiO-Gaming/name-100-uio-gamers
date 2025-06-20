"use client";

import { useLanguage } from "@/LanguageContext";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { IoLanguage } from "react-icons/io5";

// Language type from context
type Language = "en" | "no";

// Language options configuration
const LANGUAGE_OPTIONS: Array<{ code: Language; label: string }> = [
  { code: "en", label: "English" },
  { code: "no", label: "Norsk" },
];

const LanguageMenu = () => {
  const { setLanguage } = useLanguage();

  return (
    <Menu as="div" className="relative">
      <div>
        <MenuButton className="border-accent-primary bg-accent-primary hover:text-accent-primary aria-expanded:text-accent-primary w-full cursor-pointer rounded-full border px-4 py-2 text-2xl text-white duration-300 hover:bg-white focus:outline-none aria-expanded:bg-white">
          <IoLanguage />
        </MenuButton>
      </div>

      <MenuItems className="bg-background-secondary border-border absolute right-0 z-50 mt-2 w-32 origin-top-right rounded border shadow-lg">
        <div className="py-1">
          {LANGUAGE_OPTIONS.map(({ code, label }) => (
            <MenuItem
              key={code}
              as="button"
              className={({ active }) =>
                `text-foreground w-full cursor-pointer px-4 py-2 text-center text-sm transition-colors ${
                  active ? "bg-accent-primary text-white" : "hover:bg-accent-primary hover:text-white"
                }`
              }
              onClick={() => setLanguage(code)}
            >
              {label}
            </MenuItem>
          ))}
        </div>
      </MenuItems>
    </Menu>
  );
};

export default LanguageMenu;

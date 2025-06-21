import { useLanguage } from "@/LanguageContext";
import { translations } from "@/translations";
import { twMerge } from "tailwind-merge";

const Footer = ({ className }: { className?: string }) => {
  const { language } = useLanguage();
  const t = translations[language];
  return (
    <footer
      className={twMerge("bg-background-secondary flex flex-col justify-center gap-2 p-10 text-center", className)}
    >
      <p>
        {t.madeBy}{" "}
        <a href="https://furumo.eu" target="_blank">
          Leander Furumo
        </a>
      </p>
      <p>
        <a href="https://github.com/UiO-Gaming/name-100-uio-gamers" target="_blank">
          {t.sourceCode}
        </a>
      </p>
    </footer>
  );
};

export default Footer;

import { GOAL_AMOUNT } from "@/consts";
import { useLanguage } from "@/LanguageContext";
import { translations } from "@/translations";

const Header = () => {
  const { language } = useLanguage();
  const t = translations[language];
  return (
    <header>
      <h1 className="mb-12 text-center text-4xl font-bold">
        {t.appTitle.split(" ")[0]} {GOAL_AMOUNT} <span className="border-accent-primary border-b-2">{t.subject}</span>
      </h1>
    </header>
  );
};

export default Header;

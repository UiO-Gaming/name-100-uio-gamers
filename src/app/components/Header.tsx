import { useLanguage } from "@/LanguageContext";
import { translations } from "@/translations";

const Header = () => {
  const { language } = useLanguage();
  const t = translations[language];
  return (
    <header>
      <h1 className="text-center text-4xl font-bold">
        {t.appTitle.split(" ")[0]} 100 <span className="border-norway border-b-2">{t.norwegians}</span>
      </h1>
    </header>
  );
};

export default Header;

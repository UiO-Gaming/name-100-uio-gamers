import { useLanguage } from "@/LanguageContext";
import { translations } from "@/translations";

interface HeaderProps {
  goalAmount?: number;
}

const Header: React.FC<HeaderProps> = ({ goalAmount = 100 }) => {
  const { language } = useLanguage();
  const t = translations[language];
  return (
    <header>
      <h1 className="mt-24 mb-12 text-center text-4xl font-bold">
        {t.appTitle.split(" ")[0]} {goalAmount} <span className="border-accent-primary border-b-2">{t.subject}</span>
      </h1>
    </header>
  );
};

export default Header;

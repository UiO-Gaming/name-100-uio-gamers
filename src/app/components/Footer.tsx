import { useLanguage } from "@/LanguageContext";
import { translations } from "@/translations";

const Footer = () => {
  const { language } = useLanguage();
  const t = translations[language];
  return (
    <footer className="mt-10 flex flex-col justify-center gap-2 p-10">
      <p>
        {t.madeBy}{" "}
        <a href="https://furumo.eu" target="_blank">
          Leander Furumo
        </a>
      </p>
      <a href="https://github.com/LBlend/name100" target="_blank">
        {t.sourceCode}
      </a>
    </footer>
  );
};

export default Footer;

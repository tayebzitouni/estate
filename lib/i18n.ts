import { Locale } from "@/lib/constants";

type Dictionary = {
  dir: "rtl" | "ltr";
  lang: string;
  nav: {
    search: string;
    saved: string;
    dashboard: string;
    admin: string;
    login: string;
    register: string;
  };
  home: {
    badge: string;
    title: string;
    subtitle: string;
    ctaPrimary: string;
    ctaSecondary: string;
    stats: Array<{ label: string; value: string }>;
  };
};

export const dictionaries: Record<Locale, Dictionary> = {
  ar: {
    dir: "rtl",
    lang: "ar",
    nav: {
      search: "البحث",
      saved: "المحفوظات",
      dashboard: "لوحة التحكم",
      admin: "الإدارة",
      login: "تسجيل الدخول",
      register: "إنشاء حساب"
    },
    home: {
      badge: "منصة عقارية جزائرية موثوقة",
      title: "وجهتك الذكية للعقار",
      subtitle:
        "دراك تجمع بين الإعلانات الموثقة، البحث السريع، المواعيد، والرسائل الآمنة لتجربة إيجار وإدارة عقارية أكثر ثقة في الجزائر.",
      ctaPrimary: "ابدأ البحث",
      ctaSecondary: "أضف عقارك",
      stats: [
        { label: "إعلانات موثقة", value: "+1,200" },
        { label: "وقت رد متوسط", value: "أقل من ساعتين" },
        { label: "ولايات مدعومة", value: "12" }
      ]
    }
  },
  fr: {
    dir: "ltr",
    lang: "fr",
    nav: {
      search: "Recherche",
      saved: "Favoris",
      dashboard: "Tableau de bord",
      admin: "Admin",
      login: "Connexion",
      register: "Créer un compte"
    },
    home: {
      badge: "Marketplace immobilier de confiance en Algérie",
      title: "Votre portail immobilier intelligent",
      subtitle:
        "Darak réunit des annonces vérifiées, une recherche rapide, des rendez-vous de visite et une messagerie sécurisée pour le marché algérien.",
      ctaPrimary: "Rechercher",
      ctaSecondary: "Publier un bien",
      stats: [
        { label: "Annonces vérifiées", value: "+1 200" },
        { label: "Temps de réponse", value: "< 2 h" },
        { label: "Wilayas couvertes", value: "12" }
      ]
    }
  },
  en: {
    dir: "ltr",
    lang: "en",
    nav: {
      search: "Search",
      saved: "Saved",
      dashboard: "Dashboard",
      admin: "Admin",
      login: "Login",
      register: "Register"
    },
    home: {
      badge: "Trusted Algerian property platform",
      title: "Your smart destination for real estate",
      subtitle:
        "Darak brings verified listings, fast search, viewing appointments, and safe messaging to Algeria's rental-first property market.",
      ctaPrimary: "Start searching",
      ctaSecondary: "List a property",
      stats: [
        { label: "Verified listings", value: "1,200+" },
        { label: "Median response time", value: "< 2 hours" },
        { label: "Supported wilayas", value: "12" }
      ]
    }
  }
};

export function getDictionary(locale: string) {
  return dictionaries[(locale as Locale) || "ar"] ?? dictionaries.ar;
}

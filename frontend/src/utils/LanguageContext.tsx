import { createContext, useState, useContext, ReactNode } from 'react';

// Define the shape of the context
interface LanguageContextType {
  language: string;
  setLanguage: (language: string) => void;
  t: (key: string) => string;
}

// Define the translations
const translations: { [key: string]: { [key: string]: string } } = {
  en: {
    home: 'HOME',
    collection: 'COLLECTION',
    cart: 'CART',
    about_us: 'About Us',
    privacy_policy: 'Privacy Policy',
    terms_conditions: 'Terms & Conditions',
    hero_title: 'GVNG 2025',
    hero_subtitle: 'Discover premium quality clothing and accessories',
    featured_products: 'FEATURED PRODUCTS',
    free_shipping: 'Free Shipping',
    free_shipping_description: 'On orders over $100',
    easy_returns: 'Easy Returns',
    easy_returns_description: '30-day return policy',
    secure_payment: 'Secure Payment',
    secure_payment_description: '100% secure transactions',
    best_quality: 'Best Quality',
    best_quality_description: 'Premium materials',
    view_all_collection: 'VIEW ALL COLLECTION',
    subscribe_newsletter: 'SUBSCRIBE TO OUR NEWSLETTER',
    subscribe_newsletter_description: 'Get exclusive offers and latest updates',
    enter_your_email: 'Enter your email',
    subscribe: 'SUBSCRIBE',
    view_details: 'VIEW DETAILS',
    add_to_cart: 'ADD TO CART',
    close: 'CLOSE',
    size: 'Size',
    color: 'Color',
  },
  ro: {
    home: 'ACASĂ',
    collection: 'COLECȚIE',
    cart: 'COȘ',
    about_us: 'Despre Noi',
    privacy_policy: 'Politică de Confidențialitate',
    terms_conditions: 'Termeni și Condiții',
    hero_title: 'GVNG 2025',
    hero_subtitle: 'Descoperiți îmbrăcăminte și accesorii de calitate premium',
    featured_products: 'PRODUSE RECOMANDATE',
    free_shipping: 'Livrare gratuită',
    free_shipping_description: 'La comenzi de peste 100 USD',
    easy_returns: 'Returnări ușoare',
    easy_returns_description: 'Politică de returnare în 30 de zile',
    secure_payment: 'Plată sigură',
    secure_payment_description: 'Tranzacții 100% sigure',
    best_quality: 'Cea mai bună calitate',
    best_quality_description: 'Materiale premium',
    view_all_collection: 'VEZI TOATĂ COLECȚIA',
    subscribe_newsletter: 'ABONEAZĂ-TE LA NEWSLETTER-UL NOSTRU',
    subscribe_newsletter_description: 'Primește oferte exclusive și cele mai recente actualizări',
    enter_your_email: 'Introduceți adresa de e-mail',
    subscribe: 'ABONEAZĂ-TE',
    view_details: 'VEZI DETALII',
    add_to_cart: 'ADĂUGARE ÎN COȘ',
    close: 'ÎNCHIDE',
    size: 'Mărime',
    color: 'Culoare',
  }
};

// Create the context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Create a provider component
export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState('ro'); // Default to Romanian

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Create a custom hook for easy access to the context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const localeOptions = [
  { code: "en", label: "English", short: "EN" },
  { code: "nl", label: "Nederlands", short: "NL" },
  { code: "de", label: "Deutsch", short: "DE" },
  { code: "fr", label: "Français", short: "FR" }
] as const;

export type Locale = (typeof localeOptions)[number]["code"];

export const copy = {
  en: {
    eyebrow: "Food facts, made clear",
    headlineA: "Know what’s",
    headlineB: "inside.",
    intro: "Search thousands of packaged foods. Get the basics for free, then unlock the full nutrition story.",
    placeholder: "Try ‘oat milk’ or ‘dark chocolate’",
    search: "Search",
    recent: "Recent searches",
    member: "Demo member",
    free: "Free plan",
    active: "Nutrition unlocked",
    results: "Search results",
    products: "products",
    emptyTitle: "Your food shelf is ready",
    emptyBody: "Enter a product or brand to start exploring.",
    noResults: "No matching products found. Try a broader search.",
    nutrition: "Nutrition per 100 g",
    subscribe: "Unlock nutrition",
    subscribeNote: "Full values with a monthly test subscription.",
    manage: "Manage plan",
    locked: "Members see the full nutrition panel",
    unknown: "Not available",
    energy: "Energy",
    fat: "Fat",
    saturatedFat: "Saturated fat",
    carbohydrates: "Carbohydrates",
    sugars: "Sugars",
    protein: "Protein",
    salt: "Salt",
    loading: "Searching the shelves…",
    footer: "Product data from Open Food Facts",
    error: "Something went wrong. Please try again."
  },
  nl: {
    eyebrow: "Voedingsfeiten, helder uitgelegd", headlineA: "Weet wat erin", headlineB: "zit.",
    intro: "Doorzoek duizenden verpakte producten. Bekijk gratis de basis en ontgrendel alle voedingswaarden.",
    placeholder: "Probeer ‘havermelk’ of ‘pure chocolade’", search: "Zoeken", recent: "Recente zoekopdrachten",
    member: "Demo-gebruiker", free: "Gratis abonnement", active: "Voedingswaarden ontgrendeld", results: "Zoekresultaten", products: "producten",
    emptyTitle: "Je voedingsplank staat klaar", emptyBody: "Voer een product of merk in om te beginnen.",
    noResults: "Geen producten gevonden. Probeer een bredere zoekopdracht.", nutrition: "Voedingswaarde per 100 g",
    subscribe: "Ontgrendel voeding", subscribeNote: "Alle waarden met een maandelijks testabonnement.", manage: "Abonnement beheren",
    locked: "Leden zien het volledige voedingspaneel", unknown: "Niet beschikbaar", energy: "Energie", fat: "Vet",
    saturatedFat: "Verzadigd vet", carbohydrates: "Koolhydraten", sugars: "Suikers", protein: "Eiwit", salt: "Zout",
    loading: "Producten zoeken…", footer: "Productgegevens van Open Food Facts", error: "Er ging iets mis. Probeer opnieuw."
  },
  de: {
    eyebrow: "Lebensmitteldaten, klar erklärt", headlineA: "Wissen, was", headlineB: "drin ist.",
    intro: "Durchsuche tausende verpackte Lebensmittel. Basisinfos sind kostenlos, alle Nährwerte für Mitglieder.",
    placeholder: "Zum Beispiel „Hafermilch“", search: "Suchen", recent: "Letzte Suchen", member: "Demo-Nutzer",
    free: "Kostenlos", active: "Nährwerte freigeschaltet", results: "Suchergebnisse", products: "Produkte", emptyTitle: "Dein Lebensmittelregal ist bereit",
    emptyBody: "Gib ein Produkt oder eine Marke ein.", noResults: "Keine passenden Produkte. Versuche einen allgemeineren Begriff.",
    nutrition: "Nährwerte pro 100 g", subscribe: "Nährwerte freischalten", subscribeNote: "Alle Werte mit einem monatlichen Test-Abo.",
    manage: "Abo verwalten", locked: "Mitglieder sehen alle Nährwerte", unknown: "Nicht verfügbar", energy: "Energie", fat: "Fett",
    saturatedFat: "Gesättigte Fettsäuren", carbohydrates: "Kohlenhydrate", sugars: "Zucker", protein: "Eiweiß", salt: "Salz",
    loading: "Regale werden durchsucht…", footer: "Produktdaten von Open Food Facts", error: "Etwas ist schiefgelaufen. Bitte erneut versuchen."
  },
  fr: {
    eyebrow: "Les données alimentaires, en clair", headlineA: "Sachez ce qu’il y a", headlineB: "dedans.",
    intro: "Recherchez parmi des milliers de produits. Consultez l’essentiel gratuitement et débloquez toutes les valeurs nutritionnelles.",
    placeholder: "Essayez « lait d’avoine »", search: "Rechercher", recent: "Recherches récentes", member: "Compte démo",
    free: "Formule gratuite", active: "Nutrition débloquée", results: "Résultats", products: "produits", emptyTitle: "Votre rayon est prêt",
    emptyBody: "Saisissez un produit ou une marque pour commencer.", noResults: "Aucun produit trouvé. Essayez une recherche plus large.",
    nutrition: "Valeurs pour 100 g", subscribe: "Débloquer la nutrition", subscribeNote: "Toutes les valeurs avec un abonnement test mensuel.",
    manage: "Gérer l’abonnement", locked: "Les membres voient le tableau nutritionnel complet", unknown: "Indisponible",
    energy: "Énergie", fat: "Matières grasses", saturatedFat: "Acides gras saturés", carbohydrates: "Glucides", sugars: "Sucres",
    protein: "Protéines", salt: "Sel", loading: "Recherche en cours…", footer: "Données produit : Open Food Facts",
    error: "Une erreur est survenue. Veuillez réessayer."
  }
} as const;

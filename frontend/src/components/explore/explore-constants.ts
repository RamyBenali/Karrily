// ═══════════════════════════════════════════════════════
// FILTRES SPÉCIFIQUES PAR CATÉGORIE
// ═══════════════════════════════════════════════════════
export interface FilterField {
  key: string;
  label: string;
  type: "select" | "range" | "checkbox" | "number";
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  unit?: string;
}

export const CATEGORY_FILTERS: Record<string, FilterField[]> = {
  immobilier: [
    {
      key: "rooms",
      label: "Nombre de pièces",
      type: "select",
      options: [
        { value: "1", label: "F1 / Studio" },
        { value: "2", label: "F2" },
        { value: "3", label: "F3" },
        { value: "4", label: "F4" },
        { value: "5", label: "F5+" },
      ],
    },
    {
      key: "surface",
      label: "Surface min (m²)",
      type: "number",
      min: 0,
      max: 1000,
      unit: "m²",
    },
    { key: "floor", label: "Étage", type: "number", min: 0, max: 30 },
    { key: "furnished", label: "Meublé", type: "checkbox" },
    { key: "parking", label: "Parking", type: "checkbox" },
    { key: "elevator", label: "Ascenseur", type: "checkbox" },
  ],
  vehicules: [
    {
      key: "brand",
      label: "Marque",
      type: "select",
      options: [
        { value: "toyota", label: "Toyota" },
        { value: "renault", label: "Renault" },
        { value: "hyundai", label: "Hyundai" },
        { value: "peugeot", label: "Peugeot" },
        { value: "volkswagen", label: "Volkswagen" },
        { value: "bmw", label: "BMW" },
        { value: "mercedes", label: "Mercedes" },
        { value: "kia", label: "Kia" },
        { value: "dacia", label: "Dacia" },
        { value: "suzuki", label: "Suzuki" },
      ],
    },
    { key: "year_min", label: "Année min", type: "number", min: 1990, max: 2026 },
    { key: "km_max", label: "Kilométrage max", type: "number", min: 0, max: 500000, unit: "km" },
    {
      key: "fuel",
      label: "Carburant",
      type: "select",
      options: [
        { value: "essence", label: "Essence" },
        { value: "diesel", label: "Diesel" },
        { value: "gpl", label: "GPL" },
        { value: "electrique", label: "Électrique" },
        { value: "hybride", label: "Hybride" },
      ],
    },
    {
      key: "gearbox",
      label: "Boîte de vitesse",
      type: "select",
      options: [
        { value: "manuelle", label: "Manuelle" },
        { value: "automatique", label: "Automatique" },
      ],
    },
  ],
  electronique: [
    {
      key: "brand",
      label: "Marque",
      type: "select",
      options: [
        { value: "apple", label: "Apple" },
        { value: "samsung", label: "Samsung" },
        { value: "sony", label: "Sony" },
        { value: "dell", label: "Dell" },
        { value: "hp", label: "HP" },
        { value: "lenovo", label: "Lenovo" },
        { value: "asus", label: "Asus" },
        { value: "canon", label: "Canon" },
        { value: "nikon", label: "Nikon" },
        { value: "xiaomi", label: "Xiaomi" },
      ],
    },
    {
      key: "storage",
      label: "Stockage",
      type: "select",
      options: [
        { value: "32", label: "32 Go" },
        { value: "64", label: "64 Go" },
        { value: "128", label: "128 Go" },
        { value: "256", label: "256 Go" },
        { value: "512", label: "512 Go" },
        { value: "1024", label: "1 To" },
      ],
    },
    { key: "screen_size", label: "Taille écran (pouces)", type: "number", min: 3, max: 85 },
  ],
  electromenager: [
    {
      key: "type",
      label: "Type",
      type: "select",
      options: [
        { value: "refrigerateur", label: "Réfrigérateur" },
        { value: "machine_laver", label: "Machine à laver" },
        { value: "climatiseur", label: "Climatiseur" },
        { value: "cuisiniere", label: "Cuisinière" },
        { value: "lave_vaisselle", label: "Lave-vaisselle" },
        { value: "four", label: "Four" },
      ],
    },
    {
      key: "energy_class",
      label: "Classe énergie",
      type: "select",
      options: [
        { value: "A+++", label: "A+++" },
        { value: "A++", label: "A++" },
        { value: "A+", label: "A+" },
        { value: "A", label: "A" },
        { value: "B", label: "B" },
      ],
    },
  ],
  evenementiel: [
    { key: "capacity", label: "Capacité min (personnes)", type: "number", min: 0, max: 5000 },
    {
      key: "event_type",
      label: "Type d'événement",
      type: "select",
      options: [
        { value: "mariage", label: "Mariage" },
        { value: "anniversaire", label: "Anniversaire" },
        { value: "conference", label: "Conférence" },
        { value: "fete", label: "Fête" },
        { value: "concert", label: "Concert" },
      ],
    },
    { key: "delivery", label: "Livraison incluse", type: "checkbox" },
  ],
  "sport-loisirs": [
    {
      key: "sport_type",
      label: "Sport",
      type: "select",
      options: [
        { value: "football", label: "Football" },
        { value: "randonnee", label: "Randonnée" },
        { value: "ski", label: "Ski" },
        { value: "natation", label: "Natation" },
        { value: "fitness", label: "Fitness" },
        { value: "camping", label: "Camping" },
      ],
    },
    {
      key: "size",
      label: "Taille",
      type: "select",
      options: [
        { value: "xs", label: "XS" },
        { value: "s", label: "S" },
        { value: "m", label: "M" },
        { value: "l", label: "L" },
        { value: "xl", label: "XL" },
        { value: "xxl", label: "XXL" },
      ],
    },
  ],
  "mode-accessoires": [
    {
      key: "gender",
      label: "Genre",
      type: "select",
      options: [
        { value: "homme", label: "Homme" },
        { value: "femme", label: "Femme" },
        { value: "unisexe", label: "Unisexe" },
      ],
    },
    {
      key: "size",
      label: "Taille",
      type: "select",
      options: [
        { value: "xs", label: "XS" },
        { value: "s", label: "S" },
        { value: "m", label: "M" },
        { value: "l", label: "L" },
        { value: "xl", label: "XL" },
        { value: "xxl", label: "XXL" },
        { value: "36", label: "36" },
        { value: "38", label: "38" },
        { value: "40", label: "40" },
        { value: "42", label: "42" },
        { value: "44", label: "44" },
      ],
    },
  ],
  outillage: [
    {
      key: "power_source",
      label: "Alimentation",
      type: "select",
      options: [
        { value: "electrique", label: "Électrique" },
        { value: "batterie", label: "Batterie" },
        { value: "thermique", label: "Thermique" },
        { value: "manuel", label: "Manuel" },
      ],
    },
    { key: "professional", label: "Usage professionnel", type: "checkbox" },
  ],
};

export const WILAYAS = [
  { code: 1, name: "Adrar" },
  { code: 2, name: "Chlef" },
  { code: 3, name: "Laghouat" },
  { code: 4, name: "Oum El Bouaghi" },
  { code: 5, name: "Batna" },
  { code: 6, name: "Béjaïa" },
  { code: 7, name: "Biskra" },
  { code: 8, name: "Béchar" },
  { code: 9, name: "Blida" },
  { code: 10, name: "Bouira" },
  { code: 11, name: "Tamanrasset" },
  { code: 12, name: "Tébessa" },
  { code: 13, name: "Tlemcen" },
  { code: 14, name: "Tiaret" },
  { code: 15, name: "Tizi Ouzou" },
  { code: 16, name: "Alger" },
  { code: 17, name: "Djelfa" },
  { code: 18, name: "Jijel" },
  { code: 19, name: "Sétif" },
  { code: 20, name: "Saïda" },
  { code: 21, name: "Skikda" },
  { code: 22, name: "Sidi Bel Abbès" },
  { code: 23, name: "Annaba" },
  { code: 24, name: "Guelma" },
  { code: 25, name: "Constantine" },
  { code: 26, name: "Médéa" },
  { code: 27, name: "Mostaganem" },
  { code: 28, name: "M'Sila" },
  { code: 29, name: "Mascara" },
  { code: 30, name: "Ouargla" },
  { code: 31, name: "Oran" },
  { code: 32, name: "El Bayadh" },
  { code: 33, name: "Illizi" },
  { code: 34, name: "Bordj Bou Arréridj" },
  { code: 35, name: "Boumerdès" },
  { code: 36, name: "El Tarf" },
  { code: 37, name: "Tindouf" },
  { code: 38, name: "Tissemsilt" },
  { code: 39, name: "El Oued" },
  { code: 40, name: "Khenchela" },
  { code: 41, name: "Souk Ahras" },
  { code: 42, name: "Tipaza" },
  { code: 43, name: "Mila" },
  { code: 44, name: "Aïn Defla" },
  { code: 45, name: "Naâma" },
  { code: 46, name: "Aïn Témouchent" },
  { code: 47, name: "Ghardaïa" },
  { code: 48, name: "Relizane" },
];

export const PRICE_RANGES = [
  { label: "Tous les prix", min: 0, max: Infinity },
  { label: "0 - 2 000 DA", min: 0, max: 2000 },
  { label: "2 000 - 5 000 DA", min: 2000, max: 5000 },
  { label: "5 000 - 15 000 DA", min: 5000, max: 15000 },
  { label: "15 000 - 50 000 DA", min: 15000, max: 50000 },
  { label: "50 000+ DA", min: 50000, max: Infinity },
];

export const SORT_OPTIONS = [
  { value: "recent", label: "Plus récents" },
  { value: "price_asc", label: "Prix croissant" },
  { value: "price_desc", label: "Prix décroissant" },
  { value: "rating", label: "Mieux notés" },
];

export const LISTING_TYPE_LABELS: Record<string, string> = {
  rent: "🏠 Location",
  sell: "🛒 Vente",
  troc: "🔄 Troc",
  rent_sell: "🏷️ Loc/Vente",
};

export const RATING_FILTER_OPTIONS = [
  { value: "", label: "Toutes les notes" },
  { value: "3", label: "3★ et plus" },
  { value: "4", label: "4★ et plus" },
  { value: "4.5", label: "4,5★ et plus" },
];

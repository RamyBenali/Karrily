const fs = require('fs');

const missingKeys = {
  fr: {
    "admin.roleUpdated": "Rôle mis à jour",
    "categories.sport": "Sport & Loisirs",
    "common.add": "Ajouter",
    "common.comingSoon": "Bientôt disponible",
    "common.day": "jour",
    "common.general": "Général",
    "common.location": "Localisation",
    "common.notSpecified": "Non spécifié",
    "common.prevStep": "Étape précédente",
    "common.updateError": "Erreur lors de la mise à jour",
    "common.user": "Utilisateur",
    "common.continue": "Continuer",
    "common.total": "Total",
    "common.update": "Mettre à jour",
    "dashboard.activity": "Activité",
    "dashboard.bio": "Bio",
    "dashboard.confirm": "Confirmer",
    "dashboard.date": "Date",
    "dashboard.language": "Langue",
    "dashboard.languageDesc": "Choisissez votre langue d'affichage préférée.",
    "dashboard.notifDesc": "Gérez vos préférences de notifications par email et SMS.",
    "dashboard.notifications": "Notifications",
    "dashboard.phone": "Téléphone",
    "dashboard.reviews": "Avis",
    "dashboard.sales": "Ventes",
    "dashboard.trades": "Échanges",
    "explore.location": "Localisation",
    "item.editListing": "Modifier l'annonce",
    "item.editListingSubtitle": "Mettez à jour les détails de votre annonce.",
    "item.noLongerExists": "Cette annonce n'existe plus.",
    "item.notFound": "Annonce introuvable",
    "lender.loyalClients": "Clients Fidèles",
    "lender.notAvailable": "N/A",
    "listingTypes.rent": "Location",
    "listingTypes.sell": "Vente",
    "listingTypes.troc": "Troc",
    "report.ignore": "Ignorer",
    "report.ignored": "Ignoré",
    "report.noDescription": "Pas de description",
    "report.pendingStatus": "En attente",
    "report.resolved": "Résolu"
  },
  en: {
    "admin.roleUpdated": "Role updated",
    "categories.sport": "Sports & Leisure",
    "common.add": "Add",
    "common.comingSoon": "Coming soon",
    "common.day": "day",
    "common.general": "General",
    "common.location": "Location",
    "common.notSpecified": "Not specified",
    "common.prevStep": "Previous step",
    "common.updateError": "Update error",
    "common.user": "User",
    "common.continue": "Continue",
    "common.total": "Total",
    "common.update": "Update",
    "dashboard.activity": "Activity",
    "dashboard.bio": "Bio",
    "dashboard.confirm": "Confirm",
    "dashboard.date": "Date",
    "dashboard.language": "Language",
    "dashboard.languageDesc": "Choose your preferred display language.",
    "dashboard.notifDesc": "Manage your email and SMS notification preferences.",
    "dashboard.notifications": "Notifications",
    "dashboard.phone": "Phone",
    "dashboard.reviews": "Reviews",
    "dashboard.sales": "Sales",
    "dashboard.trades": "Trades",
    "explore.location": "Location",
    "item.editListing": "Edit listing",
    "item.editListingSubtitle": "Update your listing details.",
    "item.noLongerExists": "This listing no longer exists.",
    "item.notFound": "Listing not found",
    "lender.loyalClients": "Loyal Clients",
    "lender.notAvailable": "N/A",
    "listingTypes.rent": "Rental",
    "listingTypes.sell": "Sale",
    "listingTypes.troc": "Trade",
    "report.ignore": "Ignore",
    "report.ignored": "Ignored",
    "report.noDescription": "No description",
    "report.pendingStatus": "Pending",
    "report.resolved": "Resolved"
  },
  ar: {
    "admin.roleUpdated": "تم تحديث الدور",
    "categories.sport": "رياضة وترفيه",
    "common.add": "إضافة",
    "common.comingSoon": "قريباً",
    "common.day": "يوم",
    "common.general": "عام",
    "common.location": "الموقع",
    "common.notSpecified": "غير محدد",
    "common.prevStep": "الخطوة السابقة",
    "common.updateError": "خطأ في التحديث",
    "common.user": "مستخدم",
    "common.continue": "متابعة",
    "common.total": "المجموع",
    "common.update": "تحديث",
    "dashboard.activity": "النشاط",
    "dashboard.bio": "نبذة",
    "dashboard.confirm": "تأكيد",
    "dashboard.date": "التاريخ",
    "dashboard.language": "اللغة",
    "dashboard.languageDesc": "اختر لغة العرض المفضلة لديك.",
    "dashboard.notifDesc": "إدارة تفضيلات الإشعارات عبر البريد والرسائل.",
    "dashboard.notifications": "الإشعارات",
    "dashboard.phone": "الهاتف",
    "dashboard.reviews": "التقييمات",
    "dashboard.sales": "المبيعات",
    "dashboard.trades": "المقايضات",
    "explore.location": "الموقع",
    "item.editListing": "تعديل الإعلان",
    "item.editListingSubtitle": "قم بتحديث تفاصيل إعلانك.",
    "item.noLongerExists": "هذا الإعلان لم يعد موجوداً.",
    "item.notFound": "إعلان غير موجود",
    "lender.loyalClients": "العملاء الأوفياء",
    "lender.notAvailable": "غ/م",
    "listingTypes.rent": "إيجار",
    "listingTypes.sell": "بيع",
    "listingTypes.troc": "مقايضة",
    "report.ignore": "تجاهل",
    "report.ignored": "تم التجاهل",
    "report.noDescription": "بدون وصف",
    "report.pendingStatus": "قيد الانتظار",
    "report.resolved": "تمت المعالجة"
  }
};

// Helper to set nested key
function setNested(obj, path, value) {
  const parts = path.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) current[parts[i]] = {};
    current = current[parts[i]];
  }
  // Only set if not already present
  if (current[parts[parts.length - 1]] === undefined) {
    current[parts[parts.length - 1]] = value;
  }
}

['fr', 'en', 'ar'].forEach(lang => {
  const filePath = 'frontend/src/i18n/' + lang + '.json';
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  let added = 0;
  Object.entries(missingKeys[lang]).forEach(([key, value]) => {
    const parts = key.split('.');
    let current = data;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!current[parts[i]]) current[parts[i]] = {};
      current = current[parts[i]];
    }
    if (current[parts[parts.length - 1]] === undefined) {
      current[parts[parts.length - 1]] = value;
      added++;
    }
  });
  
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log(lang + ': Added ' + added + ' missing keys');
});

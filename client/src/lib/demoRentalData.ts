const createdAt = "2026-08-01T09:00:00.000Z";

export const demoRentalData = {
  dashboard: {
    unitCount: 6,
    tenantCount: 4,
    activeContractCount: 4,
    outstandingAmount: 44500,
    overdueCount: 2,
    occupiedUnitCount: 4,
    availableUnitCount: 2,
    overdueCharges: [
      { id: 602, dueDate: "2026-08-05", tenantName: "Selin Kaya", unitNumber: "A-03", remaining: 26000 },
      { id: 604, dueDate: "2026-08-01", tenantName: "Derya Çetin", unitNumber: "B-03", remaining: 18500 },
    ],
    recentBackups: [],
  },
  portfolio: {
    sites: [{ id: 101, userId: 0, createdAt, updatedAt: createdAt, name: "Güneşli Yaşam Sitesi", address: "Ihlamur Caddesi No:24, Nilüfer / Bursa", notes: "2 blok, 6 bağımsız bölüm" }],
    buildings: [
      { id: 201, userId: 0, createdAt, updatedAt: createdAt, siteId: 101, name: "A Blok", block: "A", address: "Güneşli Yaşam Sitesi", notes: "Giriş ve 3 kat" },
      { id: 202, userId: 0, createdAt, updatedAt: createdAt, siteId: 101, name: "B Blok", block: "B", address: "Güneşli Yaşam Sitesi", notes: "Giriş ve 3 kat" },
    ],
    units: [
      { id: 301, userId: 0, createdAt, updatedAt: createdAt, buildingId: 201, unitNumber: "A-01", floor: "1", unitType: "2+1 Daire", grossArea: 95, status: "dolu", notes: "Balkonlu daire" },
      { id: 302, userId: 0, createdAt, updatedAt: createdAt, buildingId: 201, unitNumber: "A-02", floor: "2", unitType: "2+1 Daire", grossArea: 95, status: "bos", notes: "Boyası yenilendi" },
      { id: 303, userId: 0, createdAt, updatedAt: createdAt, buildingId: 201, unitNumber: "A-03", floor: "3", unitType: "3+1 Daire", grossArea: 120, status: "dolu", notes: "Kapalı otopark hakkı" },
      { id: 304, userId: 0, createdAt, updatedAt: createdAt, buildingId: 202, unitNumber: "B-01", floor: "1", unitType: "2+1 Daire", grossArea: 92, status: "dolu", notes: "Bahçe cepheli" },
      { id: 305, userId: 0, createdAt, updatedAt: createdAt, buildingId: 202, unitNumber: "B-02", floor: "2", unitType: "1+1 Daire", grossArea: 64, status: "bos", notes: "Kiralamaya hazır" },
      { id: 306, userId: 0, createdAt, updatedAt: createdAt, buildingId: 202, unitNumber: "B-03", floor: "3", unitType: "3+1 Daire", grossArea: 118, status: "dolu", notes: "Manzaralı daire" },
    ],
  },
  tenants: [
    { id: 401, userId: 0, createdAt, updatedAt: createdAt, fullName: "Ahmet Yılmaz", identityNumber: "***1234", phone: "0532 555 12 34", email: "ahmet.yilmaz@example.com", emergencyContact: "Zeynep Yılmaz · 0533 555 12 35", notes: "Ödemelerini düzenli yapıyor." },
    { id: 402, userId: 0, createdAt, updatedAt: createdAt, fullName: "Selin Kaya", identityNumber: "***2457", phone: "0536 410 28 90", email: "selin.kaya@example.com", emergencyContact: "Kerem Kaya · 0536 410 28 91", notes: "Sözleşme yenilemesi için görüşülecek." },
    { id: 403, userId: 0, createdAt, updatedAt: createdAt, fullName: "Mert Aydın", identityNumber: "***6789", phone: "0542 300 11 22", email: "mert.aydin@example.com", emergencyContact: "Ece Aydın · 0542 300 11 23", notes: "Otomatik ödeme talimatı var." },
    { id: 404, userId: 0, createdAt, updatedAt: createdAt, fullName: "Derya Çetin", identityNumber: "***9812", phone: "0506 812 44 55", email: "derya.cetin@example.com", emergencyContact: "Murat Çetin · 0506 812 44 56", notes: "Kısmi ödeme kaydı mevcut." },
  ],
  contracts: [
    { contract: { id: 501, userId: 0, createdAt, updatedAt: createdAt, unitId: 301, tenantId: 401, startDate: "2026-03-01", endDate: "2027-02-28", monthlyRent: "28500.00", increasePeriodMonths: 12, securityDeposit: "57000.00", paymentDay: 5, status: "aktif", notes: "Banka havalesi ile ödeme" }, tenantName: "Ahmet Yılmaz", unitNumber: "A-01", buildingName: "A Blok" },
    { contract: { id: 502, userId: 0, createdAt, updatedAt: createdAt, unitId: 303, tenantId: 402, startDate: "2025-09-13", endDate: "2026-09-12", monthlyRent: "26000.00", increasePeriodMonths: 12, securityDeposit: "52000.00", paymentDay: 5, status: "yaklasan", notes: "Yenileme görüşmesi planlanacak" }, tenantName: "Selin Kaya", unitNumber: "A-03", buildingName: "A Blok" },
    { contract: { id: 503, userId: 0, createdAt, updatedAt: createdAt, unitId: 304, tenantId: 403, startDate: "2026-01-01", endDate: "2026-12-31", monthlyRent: "31000.00", increasePeriodMonths: 12, securityDeposit: "62000.00", paymentDay: 3, status: "aktif", notes: "Otomatik ödeme talimatı" }, tenantName: "Mert Aydın", unitNumber: "B-01", buildingName: "B Blok" },
    { contract: { id: 504, userId: 0, createdAt, updatedAt: createdAt, unitId: 306, tenantId: 404, startDate: "2025-09-21", endDate: "2026-09-20", monthlyRent: "23500.00", increasePeriodMonths: 12, securityDeposit: "47000.00", paymentDay: 1, status: "yaklasan", notes: "Kısmi tahsilat takibi" }, tenantName: "Derya Çetin", unitNumber: "B-03", buildingName: "B Blok" },
  ],
  charges: [
    { charge: { id: 601, userId: 0, createdAt, updatedAt: createdAt, contractId: 501, period: "2026-08", dueDate: "2026-08-05", amount: "28500.00", paidAmount: "28500.00", paidAt: "2026-08-03", status: "odendi", notes: "Banka havalesi" }, tenantName: "Ahmet Yılmaz", unitNumber: "A-01" },
    { charge: { id: 602, userId: 0, createdAt, updatedAt: createdAt, contractId: 502, period: "2026-08", dueDate: "2026-08-05", amount: "26000.00", paidAmount: "0.00", paidAt: null, status: "gecikti", notes: "Hatırlatma gönderilecek" }, tenantName: "Selin Kaya", unitNumber: "A-03" },
    { charge: { id: 603, userId: 0, createdAt, updatedAt: createdAt, contractId: 503, period: "2026-08", dueDate: "2026-08-03", amount: "31000.00", paidAmount: "31000.00", paidAt: "2026-08-02", status: "odendi", notes: "Otomatik ödeme" }, tenantName: "Mert Aydın", unitNumber: "B-01" },
    { charge: { id: 604, userId: 0, createdAt, updatedAt: createdAt, contractId: 504, period: "2026-08", dueDate: "2026-08-01", amount: "23500.00", paidAmount: "5000.00", paidAt: "2026-08-01", status: "gecikti", notes: "Kalan tutar için takipte" }, tenantName: "Derya Çetin", unitNumber: "B-03" },
  ],
  finance: {
    records: [
      { id: 701, userId: 0, createdAt, updatedAt: createdAt, kind: "gelir", category: "Kira tahsilatı", recordDate: "2026-08-02", amount: "31000.00", unitId: 304, contractId: 503, description: "B-01 · Ağustos kira tahsilatı" },
      { id: 702, userId: 0, createdAt, updatedAt: createdAt, kind: "gelir", category: "Kira tahsilatı", recordDate: "2026-08-03", amount: "28500.00", unitId: 301, contractId: 501, description: "A-01 · Ağustos kira tahsilatı" },
      { id: 703, userId: 0, createdAt, updatedAt: createdAt, kind: "gelir", category: "Kısmi kira tahsilatı", recordDate: "2026-08-01", amount: "5000.00", unitId: 306, contractId: 504, description: "B-03 · Kısmi ödeme" },
      { id: 704, userId: 0, createdAt, updatedAt: createdAt, kind: "gider", category: "Ortak alan temizliği", recordDate: "2026-08-06", amount: "4800.00", unitId: null, contractId: null, description: "Ağustos hizmet faturası" },
      { id: 705, userId: 0, createdAt, updatedAt: createdAt, kind: "gider", category: "Asansör bakımı", recordDate: "2026-08-12", amount: "3250.00", unitId: null, contractId: null, description: "Periyodik bakım" },
      { id: 706, userId: 0, createdAt, updatedAt: createdAt, kind: "gider", category: "Su tesisatı", recordDate: "2026-08-18", amount: "6900.00", unitId: 304, contractId: null, description: "B-01 mutfak hattı onarımı" },
    ],
    summary: { gelir: 64500, gider: 14950, net: 49550 },
  },
  inventory: [
    { id: 801, userId: 0, createdAt, updatedAt: createdAt, unitId: 301, name: "Daikin klima", category: "İklimlendirme", acquisitionDate: "2024-06-15", cost: "26500.00", status: "aktif", notes: "Yıllık bakım tarihi: Haziran" },
    { id: 802, userId: 0, createdAt, updatedAt: createdAt, unitId: 303, name: "Ankastre set", category: "Mutfak", acquisitionDate: "2023-11-02", cost: "34200.00", status: "aktif", notes: "Fırın, ocak ve davlumbaz" },
    { id: 803, userId: 0, createdAt, updatedAt: createdAt, unitId: 304, name: "Kombi", category: "Isıtma", acquisitionDate: "2022-10-10", cost: "18000.00", status: "bakimda", notes: "Yıllık bakım planlandı" },
    { id: 804, userId: 0, createdAt, updatedAt: createdAt, unitId: 306, name: "Çelik kapı", category: "Güvenlik", acquisitionDate: "2021-05-19", cost: "9700.00", status: "aktif", notes: "Anahtar sayısı: 3" },
  ],
  archive: [
    { id: 901, userId: 0, createdAt, updatedAt: createdAt, title: "Ahmet Yılmaz kira sözleşmesi", category: "sozlesme", contractId: 501, unitId: 301, tenantId: 401, fileName: "ahmet-yilmaz-sozlesme.pdf", externalUrl: null, notes: "2026–2027 dönemi" },
    { id: 902, userId: 0, createdAt, updatedAt: createdAt, title: "Ağustos tahsilat dekontu", category: "tahsilat", contractId: 503, unitId: 304, tenantId: 403, fileName: "b01-agustos-dekont.pdf", externalUrl: null, notes: "Otomatik ödeme" },
    { id: 903, userId: 0, createdAt, updatedAt: createdAt, title: "Selin Kaya kimlik kaydı", category: "kimlik", contractId: 502, unitId: 303, tenantId: 402, fileName: "selin-kaya-kimlik.pdf", externalUrl: null, notes: "Güncelleme gerekebilir" },
  ],
  reminders: {
    today: "2026-08-24",
    charges: [
      { id: 602, dueDate: "2026-08-05", amount: "26000.00", paidAmount: "0.00", status: "gecikti", tenantName: "Selin Kaya", unitNumber: "A-03" },
      { id: 604, dueDate: "2026-08-01", amount: "23500.00", paidAmount: "5000.00", status: "gecikti", tenantName: "Derya Çetin", unitNumber: "B-03" },
    ],
    contracts: [
      { id: 502, endDate: "2026-09-12", tenantName: "Selin Kaya", unitNumber: "A-03" },
      { id: 504, endDate: "2026-09-20", tenantName: "Derya Çetin", unitNumber: "B-03" },
    ],
  },
  backups: [{ id: 1001, userId: 0, createdAt: "2026-08-20T08:30:00.000Z", updatedAt: "2026-08-20T08:30:00.000Z", label: "Ağustos portföy yedeği", scope: "Portföy ve finans kayıtları", recordCount: 31, status: "arsivlendi" }],
};

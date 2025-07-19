const admin = require("firebase-admin");
admin.initializeApp();

// Δηλώνουμε έναν-έναν τους "υπαλλήλους" μας από τα αρχεία τους
const { processSalesFile } = require("./src/processSalesFile");
const { populateBottleTypesFromInvoices } = require("./src/populateBottleTypes");
const { cleanupInvoiceNotes } = require("./src/cleanupInvoices");
const { processBalanceFile } = require("./src/processBalanceFile");
const { deduplicateBottleTypes } = require("./src/deduplicateCollections"); // ✅ Η ΝΕΑ ΠΡΟΣΘΗΚΗ
const { normalizeBottleInfo } = require("./src/normalizeData");
const { runAdvancedReport } = require("./src/runAdvancedReport");

// "Εξάγουμε" τους υπαλλήλους για να τους βρει το Firebase
exports.processSalesFile = processSalesFile;
exports.populateBottleTypesFromInvoices = populateBottleTypesFromInvoices;
exports.cleanupInvoiceNotes = cleanupInvoiceNotes;
exports.processBalanceFile = processBalanceFile;
exports.deduplicateBottleTypes = deduplicateBottleTypes; // ✅ Η ΝΕΑ ΠΡΟΣΘΗΚΗ
exports.normalizeBottleInfo = normalizeBottleInfo;
exports.runAdvancedReport = runAdvancedReport; 
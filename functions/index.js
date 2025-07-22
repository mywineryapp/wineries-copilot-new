const admin = require("firebase-admin");
admin.initializeApp();

// Import όλων των functions
const algoliaSync = require('./algoliaSync');
const cleanupInvoices = require('./cleanupInvoices');
const deduplicateCollections = require('./deduplicateCollections');
const normalizeData = require('./normalizeData');
const populateBottleTypes = require('./populateBottleTypes');
const processBalanceFile = require('./processBalanceFile');
const processSalesFile = require('./processSalesFile');
const runAdvancedReport = require('./runAdvancedReport');
// (Πρόσθεσε εδώ οποιοδήποτε άλλο αρχείο function έχεις)

// Export όλων των functions για να τις "δει" το Firebase
exports.onInvoiceCreated = algoliaSync.onInvoiceCreated;
exports.onInvoiceUpdated = algoliaSync.onInvoiceUpdated;
exports.onInvoiceDeleted = algoliaSync.onInvoiceDeleted;
exports.massIndexInvoices = algoliaSync.massIndexInvoices;

exports.cleanupInvoiceNotes = cleanupInvoices.cleanupInvoiceNotes;
exports.deduplicateBottleTypes = deduplicateCollections.deduplicateBottleTypes;
exports.normalizeBottleInfo = normalizeData.normalizeBottleInfo;
exports.populateBottleTypesFromInvoices = populateBottleTypes.populateBottleTypesFromInvoices;
exports.processBalanceFile = processBalanceFile.processBalanceFile;
exports.processSalesFile = processSalesFile.processSalesFile;
exports.runAdvancedReport = runAdvancedReport.runAdvancedReport;

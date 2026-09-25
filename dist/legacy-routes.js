"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.legacyRoutes = void 0;
const handler0 = __importStar(require("./legacy/admin/advertisement/[id]/route"));
const handler1 = __importStar(require("./legacy/admin/advertisement/route"));
const handler2 = __importStar(require("./legacy/admin/biding/route"));
const handler3 = __importStar(require("./legacy/admin/customers/[phone]/orders/route"));
const handler4 = __importStar(require("./legacy/admin/delivery/areas/[id]/route"));
const handler5 = __importStar(require("./legacy/admin/delivery/areas/route"));
const handler6 = __importStar(require("./legacy/admin/delivery/areas/unassigned/route"));
const handler7 = __importStar(require("./legacy/admin/delivery/cities/[id]/route"));
const handler8 = __importStar(require("./legacy/admin/delivery/cities/route"));
const handler9 = __importStar(require("./legacy/admin/delivery/delivery-boys/route"));
const handler10 = __importStar(require("./legacy/admin/delivery/delivery-codes/[id]/route"));
const handler11 = __importStar(require("./legacy/admin/delivery/delivery-codes/route"));
const handler12 = __importStar(require("./legacy/admin/delivery/delivery-codes/unassigned/route"));
const handler13 = __importStar(require("./legacy/admin/delivery/zones/[id]/route"));
const handler14 = __importStar(require("./legacy/admin/delivery/zones/route"));
const handler15 = __importStar(require("./legacy/admin/delivery-boy/earnings/route"));
const handler16 = __importStar(require("./legacy/admin/delivery-shipment/route"));
const handler17 = __importStar(require("./legacy/admin/dispatch/route"));
const handler18 = __importStar(require("./legacy/admin/home-sections/[id]/products/route"));
const handler19 = __importStar(require("./legacy/admin/home-sections/[id]/route"));
const handler20 = __importStar(require("./legacy/admin/home-sections/route"));
const handler21 = __importStar(require("./legacy/admin/marquee/[id]/route"));
const handler22 = __importStar(require("./legacy/admin/marquee/route"));
const handler23 = __importStar(require("./legacy/admin/orders/[id]/returns/route"));
const handler24 = __importStar(require("./legacy/admin/orders/[id]/route"));
const handler25 = __importStar(require("./legacy/admin/orders/route"));
const handler26 = __importStar(require("./legacy/admin/process-orders-by-time/route"));
const handler27 = __importStar(require("./legacy/admin/procurement/[id]/assign/route"));
const handler28 = __importStar(require("./legacy/admin/procurement/[id]/route"));
const handler29 = __importStar(require("./legacy/admin/procurement/bulk/route"));
const handler30 = __importStar(require("./legacy/admin/procurement/route"));
const handler31 = __importStar(require("./legacy/admin/products/[id]/route"));
const handler32 = __importStar(require("./legacy/admin/products/route"));
const handler33 = __importStar(require("./legacy/admin/products/search/route"));
const handler34 = __importStar(require("./legacy/admin/promotion-modal/[id]/route"));
const handler35 = __importStar(require("./legacy/admin/promotion-modal/route"));
const handler36 = __importStar(require("./legacy/admin/purchases/[id]/pay/route"));
const handler37 = __importStar(require("./legacy/admin/purchases/[id]/route"));
const handler38 = __importStar(require("./legacy/admin/purchases/route"));
const handler39 = __importStar(require("./legacy/admin/reset-store/route"));
const handler40 = __importStar(require("./legacy/admin/suppliers/route"));
const handler41 = __importStar(require("./legacy/advertisement/visible/route"));
const handler42 = __importStar(require("./legacy/brands/route"));
const handler43 = __importStar(require("./legacy/delivery/cash/summary/route"));
const handler44 = __importStar(require("./legacy/delivery/history/route"));
const handler45 = __importStar(require("./legacy/deliveryboy/earnings/route"));
const handler46 = __importStar(require("./legacy/deliveryboy/orders/[id]/deliver-with-missing/route"));
const handler47 = __importStar(require("./legacy/deliveryboy/orders/[id]/deliver-with-return/route"));
const handler48 = __importStar(require("./legacy/deliveryboy/orders/[id]/full-return/route"));
const handler49 = __importStar(require("./legacy/deliveryboy/orders/[id]/return/route"));
const handler50 = __importStar(require("./legacy/deliveryboy/orders/[id]/route"));
const handler51 = __importStar(require("./legacy/deliveryboy/orders/route"));
const handler52 = __importStar(require("./legacy/generate-description/route"));
const handler53 = __importStar(require("./legacy/generics/route"));
const handler54 = __importStar(require("./legacy/home-sections/route"));
const handler55 = __importStar(require("./legacy/marquee/visible/route"));
const handler56 = __importStar(require("./legacy/orders/[id]/route"));
const handler57 = __importStar(require("./legacy/orders/history/route"));
const handler58 = __importStar(require("./legacy/orders/route"));
const handler59 = __importStar(require("./legacy/products/route"));
const handler60 = __importStar(require("./legacy/products/search/route"));
const handler61 = __importStar(require("./legacy/products/search-suggestions/route"));
const handler62 = __importStar(require("./legacy/products-for-purchase/route"));
const handler63 = __importStar(require("./legacy/promotion-modal/route"));
const handler64 = __importStar(require("./legacy/public/areas/route"));
const handler65 = __importStar(require("./legacy/public/cities/route"));
const handler66 = __importStar(require("./legacy/public/zones/route"));
const handler67 = __importStar(require("./legacy/review/[orderId]/dismiss/route"));
const handler68 = __importStar(require("./legacy/review/[orderId]/submit/route"));
const handler69 = __importStar(require("./legacy/review/pending/route"));
const handler70 = __importStar(require("./legacy/settings/route"));
const handler71 = __importStar(require("./legacy/suppliers/biding/route"));
const handler72 = __importStar(require("./legacy/suppliers/orders/route"));
const handler73 = __importStar(require("./legacy/suppliers/route"));
const handler74 = __importStar(require("./legacy/track/route"));
exports.legacyRoutes = [
    { pattern: new RegExp("^/api/admin/advertisement/(?<id>[^/]+)$"), handlers: handler0 },
    { pattern: new RegExp("^/api/admin/advertisement$"), handlers: handler1 },
    { pattern: new RegExp("^/api/admin/biding$"), handlers: handler2 },
    { pattern: new RegExp("^/api/admin/customers/(?<phone>[^/]+)/orders$"), handlers: handler3 },
    { pattern: new RegExp("^/api/admin/delivery/areas/(?<id>[^/]+)$"), handlers: handler4 },
    { pattern: new RegExp("^/api/admin/delivery/areas$"), handlers: handler5 },
    { pattern: new RegExp("^/api/admin/delivery/areas/unassigned$"), handlers: handler6 },
    { pattern: new RegExp("^/api/admin/delivery/cities/(?<id>[^/]+)$"), handlers: handler7 },
    { pattern: new RegExp("^/api/admin/delivery/cities$"), handlers: handler8 },
    { pattern: new RegExp("^/api/admin/delivery/delivery\\-boys$"), handlers: handler9 },
    { pattern: new RegExp("^/api/admin/delivery/delivery\\-codes/(?<id>[^/]+)$"), handlers: handler10 },
    { pattern: new RegExp("^/api/admin/delivery/delivery\\-codes$"), handlers: handler11 },
    { pattern: new RegExp("^/api/admin/delivery/delivery\\-codes/unassigned$"), handlers: handler12 },
    { pattern: new RegExp("^/api/admin/delivery/zones/(?<id>[^/]+)$"), handlers: handler13 },
    { pattern: new RegExp("^/api/admin/delivery/zones$"), handlers: handler14 },
    { pattern: new RegExp("^/api/admin/delivery\\-boy/earnings$"), handlers: handler15 },
    { pattern: new RegExp("^/api/admin/delivery\\-shipment$"), handlers: handler16 },
    { pattern: new RegExp("^/api/admin/dispatch$"), handlers: handler17 },
    { pattern: new RegExp("^/api/admin/home\\-sections/(?<id>[^/]+)/products$"), handlers: handler18 },
    { pattern: new RegExp("^/api/admin/home\\-sections/(?<id>[^/]+)$"), handlers: handler19 },
    { pattern: new RegExp("^/api/admin/home\\-sections$"), handlers: handler20 },
    { pattern: new RegExp("^/api/admin/marquee/(?<id>[^/]+)$"), handlers: handler21 },
    { pattern: new RegExp("^/api/admin/marquee$"), handlers: handler22 },
    { pattern: new RegExp("^/api/admin/orders/(?<id>[^/]+)/returns$"), handlers: handler23 },
    { pattern: new RegExp("^/api/admin/orders/(?<id>[^/]+)$"), handlers: handler24 },
    { pattern: new RegExp("^/api/admin/orders$"), handlers: handler25 },
    { pattern: new RegExp("^/api/admin/process\\-orders\\-by\\-time$"), handlers: handler26 },
    { pattern: new RegExp("^/api/admin/procurement/(?<id>[^/]+)/assign$"), handlers: handler27 },
    { pattern: new RegExp("^/api/admin/procurement/(?<id>[^/]+)$"), handlers: handler28 },
    { pattern: new RegExp("^/api/admin/procurement/bulk$"), handlers: handler29 },
    { pattern: new RegExp("^/api/admin/procurement$"), handlers: handler30 },
    { pattern: new RegExp("^/api/admin/products/(?<id>[^/]+)$"), handlers: handler31 },
    { pattern: new RegExp("^/api/admin/products$"), handlers: handler32 },
    { pattern: new RegExp("^/api/admin/products/search$"), handlers: handler33 },
    { pattern: new RegExp("^/api/admin/promotion\\-modal/(?<id>[^/]+)$"), handlers: handler34 },
    { pattern: new RegExp("^/api/admin/promotion\\-modal$"), handlers: handler35 },
    { pattern: new RegExp("^/api/admin/purchases/(?<id>[^/]+)/pay$"), handlers: handler36 },
    { pattern: new RegExp("^/api/admin/purchases/(?<id>[^/]+)$"), handlers: handler37 },
    { pattern: new RegExp("^/api/admin/purchases$"), handlers: handler38 },
    { pattern: new RegExp("^/api/admin/reset\\-store$"), handlers: handler39 },
    { pattern: new RegExp("^/api/admin/suppliers$"), handlers: handler40 },
    { pattern: new RegExp("^/api/advertisement/visible$"), handlers: handler41 },
    { pattern: new RegExp("^/api/brands$"), handlers: handler42 },
    { pattern: new RegExp("^/api/delivery/cash/summary$"), handlers: handler43 },
    { pattern: new RegExp("^/api/delivery/history$"), handlers: handler44 },
    { pattern: new RegExp("^/api/deliveryboy/earnings$"), handlers: handler45 },
    { pattern: new RegExp("^/api/deliveryboy/orders/(?<id>[^/]+)/deliver\\-with\\-missing$"), handlers: handler46 },
    { pattern: new RegExp("^/api/deliveryboy/orders/(?<id>[^/]+)/deliver\\-with\\-return$"), handlers: handler47 },
    { pattern: new RegExp("^/api/deliveryboy/orders/(?<id>[^/]+)/full\\-return$"), handlers: handler48 },
    { pattern: new RegExp("^/api/deliveryboy/orders/(?<id>[^/]+)/return$"), handlers: handler49 },
    { pattern: new RegExp("^/api/deliveryboy/orders/(?<id>[^/]+)$"), handlers: handler50 },
    { pattern: new RegExp("^/api/deliveryboy/orders$"), handlers: handler51 },
    { pattern: new RegExp("^/api/generate\\-description$"), handlers: handler52 },
    { pattern: new RegExp("^/api/generics$"), handlers: handler53 },
    { pattern: new RegExp("^/api/home\\-sections$"), handlers: handler54 },
    { pattern: new RegExp("^/api/marquee/visible$"), handlers: handler55 },
    { pattern: new RegExp("^/api/orders/(?<id>[^/]+)$"), handlers: handler56 },
    { pattern: new RegExp("^/api/orders/history$"), handlers: handler57 },
    { pattern: new RegExp("^/api/orders$"), handlers: handler58 },
    { pattern: new RegExp("^/api/products$"), handlers: handler59 },
    { pattern: new RegExp("^/api/products/search$"), handlers: handler60 },
    { pattern: new RegExp("^/api/products/search\\-suggestions$"), handlers: handler61 },
    { pattern: new RegExp("^/api/products\\-for\\-purchase$"), handlers: handler62 },
    { pattern: new RegExp("^/api/promotion\\-modal$"), handlers: handler63 },
    { pattern: new RegExp("^/api/public/areas$"), handlers: handler64 },
    { pattern: new RegExp("^/api/public/cities$"), handlers: handler65 },
    { pattern: new RegExp("^/api/public/zones$"), handlers: handler66 },
    { pattern: new RegExp("^/api/review/(?<orderId>[^/]+)/dismiss$"), handlers: handler67 },
    { pattern: new RegExp("^/api/review/(?<orderId>[^/]+)/submit$"), handlers: handler68 },
    { pattern: new RegExp("^/api/review/pending$"), handlers: handler69 },
    { pattern: new RegExp("^/api/settings$"), handlers: handler70 },
    { pattern: new RegExp("^/api/suppliers/biding$"), handlers: handler71 },
    { pattern: new RegExp("^/api/suppliers/orders$"), handlers: handler72 },
    { pattern: new RegExp("^/api/suppliers$"), handlers: handler73 },
    { pattern: new RegExp("^/api/track$"), handlers: handler74 },
];

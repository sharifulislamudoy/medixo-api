import type { LegacyRoute } from "./compat/types";
import * as handler0 from "./legacy/admin/advertisement/[id]/route";
import * as handler1 from "./legacy/admin/advertisement/route";
import * as handler2 from "./legacy/admin/biding/route";
import * as handler3 from "./legacy/admin/customers/[phone]/orders/route";
import * as handler4 from "./legacy/admin/delivery/areas/[id]/route";
import * as handler5 from "./legacy/admin/delivery/areas/route";
import * as handler6 from "./legacy/admin/delivery/areas/unassigned/route";
import * as handler7 from "./legacy/admin/delivery/cities/[id]/route";
import * as handler8 from "./legacy/admin/delivery/cities/route";
import * as handler9 from "./legacy/admin/delivery/delivery-boys/route";
import * as handler10 from "./legacy/admin/delivery/delivery-codes/[id]/route";
import * as handler11 from "./legacy/admin/delivery/delivery-codes/route";
import * as handler12 from "./legacy/admin/delivery/delivery-codes/unassigned/route";
import * as handler13 from "./legacy/admin/delivery/zones/[id]/route";
import * as handler14 from "./legacy/admin/delivery/zones/route";
import * as handler15 from "./legacy/admin/delivery-boy/earnings/route";
import * as handler16 from "./legacy/admin/delivery-shipment/route";
import * as handler17 from "./legacy/admin/dispatch/route";
import * as handler18 from "./legacy/admin/home-sections/[id]/products/route";
import * as handler19 from "./legacy/admin/home-sections/[id]/route";
import * as handler20 from "./legacy/admin/home-sections/route";
import * as handler21 from "./legacy/admin/marquee/[id]/route";
import * as handler22 from "./legacy/admin/marquee/route";
import * as handler23 from "./legacy/admin/orders/[id]/returns/route";
import * as handler24 from "./legacy/admin/orders/[id]/route";
import * as handler25 from "./legacy/admin/orders/route";
import * as handler26 from "./legacy/admin/process-orders-by-time/route";
import * as handler27 from "./legacy/admin/procurement/[id]/assign/route";
import * as handler28 from "./legacy/admin/procurement/[id]/route";
import * as handler29 from "./legacy/admin/procurement/bulk/route";
import * as handler30 from "./legacy/admin/procurement/route";
import * as handler31 from "./legacy/admin/products/[id]/route";
import * as handler32 from "./legacy/admin/products/route";
import * as handler33 from "./legacy/admin/products/search/route";
import * as handler34 from "./legacy/admin/promotion-modal/[id]/route";
import * as handler35 from "./legacy/admin/promotion-modal/route";
import * as handler36 from "./legacy/admin/purchases/[id]/pay/route";
import * as handler37 from "./legacy/admin/purchases/[id]/route";
import * as handler38 from "./legacy/admin/purchases/route";
import * as handler39 from "./legacy/admin/reset-store/route";
import * as handler40 from "./legacy/admin/suppliers/route";
import * as handler41 from "./legacy/advertisement/visible/route";
import * as handler42 from "./legacy/brands/route";
import * as handler43 from "./legacy/delivery/cash/summary/route";
import * as handler44 from "./legacy/delivery/history/route";
import * as handler45 from "./legacy/deliveryboy/earnings/route";
import * as handler46 from "./legacy/deliveryboy/orders/[id]/deliver-with-missing/route";
import * as handler47 from "./legacy/deliveryboy/orders/[id]/deliver-with-return/route";
import * as handler48 from "./legacy/deliveryboy/orders/[id]/full-return/route";
import * as handler49 from "./legacy/deliveryboy/orders/[id]/return/route";
import * as handler50 from "./legacy/deliveryboy/orders/[id]/route";
import * as handler51 from "./legacy/deliveryboy/orders/route";
import * as handler52 from "./legacy/generate-description/route";
import * as handler53 from "./legacy/generics/route";
import * as handler54 from "./legacy/home-sections/route";
import * as handler55 from "./legacy/marquee/visible/route";
import * as handler56 from "./legacy/orders/[id]/route";
import * as handler57 from "./legacy/orders/history/route";
import * as handler58 from "./legacy/orders/route";
import * as handler59 from "./legacy/products/route";
import * as handler60 from "./legacy/products/search/route";
import * as handler61 from "./legacy/products/search-suggestions/route";
import * as handler62 from "./legacy/products-for-purchase/route";
import * as handler63 from "./legacy/promotion-modal/route";
import * as handler64 from "./legacy/public/areas/route";
import * as handler65 from "./legacy/public/cities/route";
import * as handler66 from "./legacy/public/zones/route";
import * as handler67 from "./legacy/review/[orderId]/dismiss/route";
import * as handler68 from "./legacy/review/[orderId]/submit/route";
import * as handler69 from "./legacy/review/pending/route";
import * as handler70 from "./legacy/settings/route";
import * as handler71 from "./legacy/suppliers/biding/route";
import * as handler72 from "./legacy/suppliers/orders/route";
import * as handler73 from "./legacy/suppliers/route";
import * as handler74 from "./legacy/track/route";

export const legacyRoutes: LegacyRoute[] = [
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

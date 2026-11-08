// Generated from test-data/api-v1-orders/cases
export interface ApiV1TestCase {
  id: string;
  group: string;
  title: string;
  why: string;
  request: {
    method: string;
    path: string;
    headers?: Record<string, string>;
    body?: any;
    raw_body?: string;
    repeat?: number;
    [key: string]: any;
  };
  expect?: any;
  contract?: any;
  gap?: string | null;
}

export const REPO_API_V1_CASES: ApiV1TestCase[] = [
  {
    "id": "V01",
    "group": "valid",
    "title": "Single pickup and delivery, tractor, pieces, weight, commodity, PO ref",
    "why": "The everyday order: one pickup, one delivery, a tractor, a PO number as ref.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "TEST-PO-1001",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+4}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts",
        "notes": "Dock 4. Call 30 minutes ahead."
      }
    },
    "expect": {
      "status": 201,
      "content_type": "application/json",
      "body": {
        "ref": "TEST-PO-1001",
        "status": "submitted",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+4}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts",
        "loads": []
      },
      "body_match": {
        "id": "^REQ-[0-9]+$",
        "created_at": "^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$"
      }
    },
    "contract": {
      "status": 400,
      "errors": [
        {
          "field": "hazmat",
          "code": "required"
        }
      ],
      "note": "The contract requires hazmat on every order (OrderInput.required). The code does not know the field, so it places this order. Every other order in this set that omits hazmat would draw the same error under the contract."
    },
    "gap": "contract-requires-hazmat"
  },
  {
    "id": "V02",
    "group": "valid",
    "title": "Straight truck, weight in kg, delivery date null",
    "why": "Metric shipper; delivery day left open for Moscoso to set.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "TEST-PO-1002",
        "pickup": {
          "address": "450 Placeholder Ave, Milwaukee, WI 53204",
          "date": "{{date:+2}}"
        },
        "delivery": {
          "address": "1500 Fictional Way, St. Louis, MO, 63110",
          "date": null
        },
        "equipment": "straight_truck",
        "pieces": 4,
        "weight": {
          "value": 900,
          "unit": "kg"
        },
        "commodity": "Display fixtures"
      }
    },
    "expect": {
      "status": 201,
      "content_type": "application/json",
      "body": {
        "ref": "TEST-PO-1002",
        "status": "submitted",
        "pickup": {
          "address": "450 Placeholder Ave, Milwaukee, WI 53204",
          "date": "{{date:+2}}"
        },
        "delivery": {
          "address": "1500 Fictional Way, St. Louis, MO, 63110",
          "date": null
        },
        "equipment": "straight_truck",
        "pieces": 4,
        "weight": {
          "value": 900,
          "unit": "kg"
        },
        "commodity": "Display fixtures",
        "loads": []
      },
      "body_match": {
        "id": "^REQ-[0-9]+$",
        "created_at": "^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$"
      }
    },
    "gap": null
  },
  {
    "id": "V03",
    "group": "valid",
    "title": "Minimal order: ref, pickup with date, delivery address only; full state name",
    "why": "Smallest body the code takes. Delivery address spells out \"Indiana\", which reads as an allowed state.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "TEST-PO-1003",
        "pickup": {
          "address": "15 Warehouse Row, Joliet, IL 60431",
          "date": "{{date:+1}}"
        },
        "delivery": {
          "address": "77 Test Industrial Dr, Indianapolis, Indiana 46241"
        }
      }
    },
    "expect": {
      "status": 201,
      "content_type": "application/json",
      "body": {
        "ref": "TEST-PO-1003",
        "status": "submitted",
        "pickup": {
          "address": "15 Warehouse Row, Joliet, IL 60431",
          "date": "{{date:+1}}"
        },
        "delivery": {
          "address": "77 Test Industrial Dr, Indianapolis, Indiana 46241",
          "date": null
        },
        "equipment": null,
        "pieces": null,
        "weight": null,
        "commodity": null,
        "loads": []
      },
      "body_match": {
        "id": "^REQ-[0-9]+$",
        "created_at": "^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$"
      }
    },
    "gap": null
  },
  {
    "id": "V04",
    "group": "valid",
    "title": "Sprinter, same-day delivery, address ending in USA, notes",
    "why": "Small expedited load; the window goes in notes because the code has no window fields yet.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "TEST-PO-1004",
        "pickup": {
          "address": "9000 Demo Blvd, Detroit, MI, 48201, USA",
          "date": "{{date:+5}}"
        },
        "delivery": {
          "address": "310 Mock Ln, Louisville, KY 40213",
          "date": "{{date:+5}}"
        },
        "equipment": "sprinter",
        "pieces": 2,
        "weight": {
          "value": 180,
          "unit": "lbs"
        },
        "commodity": "Medical supplies",
        "notes": "Liftgate needed at delivery. Receiving open 07:00-15:00."
      }
    },
    "expect": {
      "status": 201,
      "content_type": "application/json",
      "body": {
        "ref": "TEST-PO-1004",
        "status": "submitted",
        "pickup": {
          "address": "9000 Demo Blvd, Detroit, MI, 48201, USA",
          "date": "{{date:+5}}"
        },
        "delivery": {
          "address": "310 Mock Ln, Louisville, KY 40213",
          "date": "{{date:+5}}"
        },
        "equipment": "sprinter",
        "pieces": 2,
        "weight": {
          "value": 180,
          "unit": "lbs"
        },
        "commodity": "Medical supplies",
        "loads": []
      },
      "body_match": {
        "id": "^REQ-[0-9]+$",
        "created_at": "^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$"
      }
    },
    "gap": null
  },
  {
    "id": "V05",
    "group": "valid",
    "title": "Pickup today (US Central), no equipment named",
    "why": "Same-day pickup is the earliest date allowed; equipment is optional.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "TEST-PO-1005",
        "pickup": {
          "address": "640 Sample Ct, Des Moines, IA 50309",
          "date": "{{date:+0}}"
        },
        "delivery": {
          "address": "82 Example Loop, Minneapolis, MN, 55413",
          "date": "{{date:+1}}"
        },
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts"
      }
    },
    "expect": {
      "status": 201,
      "content_type": "application/json",
      "body": {
        "ref": "TEST-PO-1005",
        "status": "submitted",
        "pickup": {
          "address": "640 Sample Ct, Des Moines, IA 50309",
          "date": "{{date:+0}}"
        },
        "delivery": {
          "address": "82 Example Loop, Minneapolis, MN, 55413",
          "date": "{{date:+1}}"
        },
        "equipment": null,
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts",
        "loads": []
      },
      "body_match": {
        "id": "^REQ-[0-9]+$",
        "created_at": "^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$"
      }
    },
    "gap": null
  },
  {
    "id": "V06",
    "group": "valid",
    "title": "Pickup exactly 365 days out (the ceiling), delivery the day after",
    "why": "Boundary of ruling 12: pickup at most 365 days after today. Delivery has no ceiling.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "TEST-PO-1006",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+365}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+366}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts"
      }
    },
    "expect": {
      "status": 201,
      "content_type": "application/json",
      "body": {
        "ref": "TEST-PO-1006",
        "status": "submitted",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+365}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+366}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts",
        "loads": []
      },
      "body_match": {
        "id": "^REQ-[0-9]+$",
        "created_at": "^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$"
      }
    },
    "gap": null
  },
  {
    "id": "V07",
    "group": "valid",
    "title": "Pickup address with no readable state goes to review, not refused",
    "why": "A site name with no state. The zone rule never refuses on a guess, so it is placed for a person to check.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "TEST-PO-1007",
        "pickup": {
          "address": "Building 7, Gate B, Example Industrial Park",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+4}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts"
      }
    },
    "expect": {
      "status": 201,
      "content_type": "application/json",
      "body": {
        "ref": "TEST-PO-1007",
        "status": "submitted",
        "pickup": {
          "address": "Building 7, Gate B, Example Industrial Park",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+4}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts",
        "loads": []
      },
      "body_match": {
        "id": "^REQ-[0-9]+$",
        "created_at": "^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$"
      }
    },
    "gap": null
  },
  {
    "id": "V08",
    "group": "valid",
    "title": "Retry with the same Idempotency-Key and the same body (keys reordered) replays the order",
    "why": "A client times out and resends. The second call must return the first order, not a new one.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem:r}}"
      },
      "body": {
        "commodity": "Boxed machine parts",
        "weight": {
          "unit": "lbs",
          "value": 2400
        },
        "pieces": 12,
        "equipment": "tractor",
        "delivery": {
          "date": "{{date:+4}}",
          "address": "2200 Sample Rd, Columbus, OH, 43217"
        },
        "pickup": {
          "date": "{{date:+3}}",
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007"
        },
        "ref": "TEST-PO-1008"
      }
    },
    "expect": {
      "status": 200,
      "content_type": "application/json",
      "body": {
        "ref": "TEST-PO-1008",
        "status": "submitted",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+4}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts",
        "loads": [],
        "id": "{{saved:id}}"
      },
      "body_match": {
        "id": "^REQ-[0-9]+$",
        "created_at": "^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$"
      },
      "headers": {
        "Idempotency-Replayed": "true"
      }
    },
    "gap": null
  },
  {
    "id": "V09",
    "group": "valid",
    "title": "Read an order back by id",
    "why": "After placing, the client checks its status.",
    "request": {
      "method": "GET",
      "path": "/v1/orders/{{saved:id}}",
      "headers": {
        "Authorization": "Bearer {{key:live}}"
      }
    },
    "expect": {
      "status": 200,
      "content_type": "application/json",
      "body": {
        "id": "{{saved:id}}",
        "ref": "TEST-PO-1009",
        "status": "submitted",
        "loads": []
      }
    },
    "gap": null
  },
  {
    "id": "V10",
    "group": "valid",
    "title": "List submitted orders, 5 per page",
    "why": "A client polls its open orders.",
    "request": {
      "method": "GET",
      "path": "/v1/orders?status=submitted&limit=5",
      "headers": {
        "Authorization": "Bearer {{key:live}}"
      }
    },
    "expect": {
      "status": 200,
      "content_type": "application/json",
      "body_match": {
        "has_more": "^(true|false)$"
      },
      "body_types": {
        "data": "array",
        "has_more": "boolean"
      }
    },
    "gap": null
  },
  {
    "id": "V11",
    "group": "valid",
    "title": "Test key places an order",
    "why": "A client integrating for the first time uses its mx_test_ key.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:test}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "TEST-PO-1011",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+4}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts"
      }
    },
    "expect": {
      "status": 201,
      "content_type": "application/json",
      "body": {
        "ref": "TEST-PO-1011",
        "status": "submitted",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+4}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts",
        "loads": []
      },
      "body_match": {
        "id": "^REQ-[0-9]+$",
        "created_at": "^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$"
      }
    },
    "contract": {
      "status": 201,
      "body_match": {
        "id": "^TST-[0-9]+$"
      },
      "note": "Contract: a test-key order gets a TST- id, stays submitted and never enters Moscoso review. The code has no test keys (KEY_PREFIX is mx_live_ only), so a key stored as mx_test_ is a live key: the order gets a REQ- id and lands in Requests. Under the contract this body would also draw hazmat required (see V01)."
    },
    "gap": "test-keys-not-built"
  },
  {
    "id": "V12",
    "group": "valid",
    "title": "Test key reads /v1/me",
    "why": "The client checks which kind of key it holds.",
    "request": {
      "method": "GET",
      "path": "/v1/me",
      "headers": {
        "Authorization": "Bearer {{key:test}}"
      }
    },
    "expect": {
      "status": 200,
      "content_type": "application/json",
      "body": {
        "user": {
          "name": "Casey Example",
          "email": "casey.ops@example.com"
        },
        "client": {
          "code": "ZLW",
          "name": "Lakeshore Widget Supply (test)"
        }
      }
    },
    "contract": {
      "status": 200,
      "body": {
        "mode": "test"
      },
      "note": "Contract Account requires mode (live or test). The code returns no mode."
    },
    "gap": "test-keys-not-built"
  },
  {
    "id": "S01",
    "group": "contract-shape",
    "title": "Contract standard order: hazmat false, time windows, site contacts",
    "why": "Exactly what api/openapi.json tells a client to send (its \"standard\" example, with invented data).",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "TEST-PO-2001",
        "hazmat": false,
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+3}}",
          "window_start": "08:30",
          "window_end": "10:00",
          "time_type": "target",
          "contact": {
            "name": "Casey Example",
            "phone": "847-555-0142"
          }
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+4}}",
          "window_start": "10:00",
          "time_type": "appointment",
          "contact": {
            "name": "Robin Sample",
            "phone": "614-555-0118"
          }
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts",
        "notes": "Liftgate needed at delivery."
      }
    },
    "expect": {
      "status": 400,
      "content_type": "application/problem+json",
      "body": {
        "type": "about:blank",
        "title": "Bad request",
        "status": 400,
        "code": "bad_request",
        "detail": "The request body has 8 problems."
      },
      "errors": [
        {
          "field": "hazmat",
          "code": "unknown_field",
          "message": "hazmat is not a field of this API.",
          "fix": "Remove this field."
        },
        {
          "field": "pickup.window_start",
          "code": "unknown_field",
          "message": "pickup.window_start is not a field of this API.",
          "fix": "Remove this field."
        },
        {
          "field": "pickup.window_end",
          "code": "unknown_field",
          "message": "pickup.window_end is not a field of this API.",
          "fix": "Remove this field."
        },
        {
          "field": "pickup.time_type",
          "code": "unknown_field",
          "message": "pickup.time_type is not a field of this API.",
          "fix": "Remove this field."
        },
        {
          "field": "pickup.contact",
          "code": "unknown_field",
          "message": "pickup.contact is not a field of this API.",
          "fix": "Remove this field."
        },
        {
          "field": "delivery.window_start",
          "code": "unknown_field",
          "message": "delivery.window_start is not a field of this API.",
          "fix": "Remove this field."
        },
        {
          "field": "delivery.time_type",
          "code": "unknown_field",
          "message": "delivery.time_type is not a field of this API.",
          "fix": "Remove this field."
        },
        {
          "field": "delivery.contact",
          "code": "unknown_field",
          "message": "delivery.contact is not a field of this API.",
          "fix": "Remove this field."
        }
      ]
    },
    "contract": {
      "status": 201,
      "note": "Contract 1.0.0 on api-recut documents hazmat, window_start, window_end, time_type and contact. The validator (validateOrder, refuseUnknown) still allows only ref, pickup{address,date}, delivery{address,date}, equipment, pieces, weight, commodity, notes."
    },
    "gap": "contract-fields-not-built"
  },
  {
    "id": "S02",
    "group": "contract-shape",
    "title": "Contract hazmat order with hazmat_details",
    "why": "A hazmat shipper following the contract hazmat example.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "TEST-PO-2002",
        "hazmat": true,
        "hazmat_details": {
          "un_number": "UN1263",
          "hazard_class": "3",
          "weight": {
            "value": 500,
            "unit": "lbs"
          },
          "emergency_phone": "312-555-0199"
        },
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+4}}"
        },
        "equipment": "tractor",
        "pieces": 10,
        "weight": {
          "value": 500,
          "unit": "lbs"
        },
        "commodity": "Paint"
      }
    },
    "expect": {
      "status": 400,
      "content_type": "application/problem+json",
      "body": {
        "type": "about:blank",
        "title": "Bad request",
        "status": 400,
        "code": "bad_request",
        "detail": "The request body has 2 problems."
      },
      "errors": [
        {
          "field": "hazmat",
          "code": "unknown_field",
          "message": "hazmat is not a field of this API.",
          "fix": "Remove this field."
        },
        {
          "field": "hazmat_details",
          "code": "unknown_field",
          "message": "hazmat_details is not a field of this API.",
          "fix": "Remove this field."
        }
      ]
    },
    "contract": {
      "status": 201,
      "note": "Pre-launch item 1 (hazmat required, details when true) is in the contract, not in the code."
    },
    "gap": "contract-fields-not-built"
  },
  {
    "id": "S03",
    "group": "contract-shape",
    "title": "Plain order plus hazmat:false, nothing else new",
    "why": "The smallest contract-correct order. The code refuses it for the one field the contract requires.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "TEST-PO-2003",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+4}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts",
        "hazmat": false
      }
    },
    "expect": {
      "status": 400,
      "content_type": "application/problem+json",
      "body": {
        "type": "about:blank",
        "title": "Bad request",
        "status": 400,
        "code": "bad_request",
        "detail": "The request body has 1 problem."
      },
      "errors": [
        {
          "field": "hazmat",
          "code": "unknown_field",
          "message": "hazmat is not a field of this API.",
          "fix": "Remove this field."
        }
      ]
    },
    "contract": {
      "status": 201,
      "note": "With V01 this shows no order body passes both the contract and the code today: without hazmat the contract refuses it, with hazmat the code refuses it."
    },
    "gap": "contract-fields-not-built"
  },
  {
    "id": "S04",
    "group": "contract-shape",
    "title": "Multi-stop order as a stops array (one pickup, two deliveries)",
    "why": "Owner review 11-06: orders take an array of stops. Field names here are provisional; neither the contract nor the code has a stops array.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "TEST-PO-2004",
        "stops": [
          {
            "type": "pickup",
            "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
            "date": "{{date:+3}}"
          },
          {
            "type": "delivery",
            "address": "450 Placeholder Ave, Milwaukee, WI 53204",
            "date": "{{date:+3}}"
          },
          {
            "type": "delivery",
            "address": "15 Warehouse Row, Joliet, IL 60431",
            "date": "{{date:+4}}"
          }
        ],
        "equipment": "straight_truck",
        "pieces": 9,
        "weight": {
          "value": 3100,
          "unit": "lbs"
        },
        "commodity": "Retail fixtures"
      }
    },
    "expect": {
      "status": 400,
      "content_type": "application/problem+json",
      "body": {
        "type": "about:blank",
        "title": "Bad request",
        "status": 400,
        "code": "bad_request",
        "detail": "The request body has 3 problems."
      },
      "errors": [
        {
          "field": "stops",
          "code": "unknown_field",
          "message": "stops is not a field of this API.",
          "fix": "Remove this field."
        },
        {
          "field": "pickup",
          "code": "required",
          "message": "pickup is missing.",
          "fix": "Send pickup as an object."
        },
        {
          "field": "delivery",
          "code": "required",
          "message": "delivery is missing.",
          "fix": "Send delivery as an object."
        }
      ]
    },
    "contract": {
      "status": 400,
      "note": "Contract 1.0.0 also has no stops array (OrderInput is pickup + delivery, additionalProperties false), so code and contract agree. The gap is against the owner 11-06 load-shape review, which is not in the contract yet."
    },
    "gap": "ruled-shape-not-in-contract"
  },
  {
    "id": "S05",
    "group": "contract-shape",
    "title": "Any-of equipment: a list of acceptable truck types",
    "why": "Owner review 11-06: equipment on an order is a list of acceptable types. Provisional shape.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "TEST-PO-2005",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+4}}"
        },
        "equipment": [
          "tractor",
          "straight_truck"
        ],
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts"
      }
    },
    "expect": {
      "status": 400,
      "content_type": "application/problem+json",
      "body": {
        "type": "about:blank",
        "title": "Bad request",
        "status": 400,
        "code": "bad_request",
        "detail": "The request body has 1 problem."
      },
      "errors": [
        {
          "field": "equipment",
          "code": "wrong_type",
          "message": "equipment must be a string.",
          "fix": "Send equipment as one of tractor, straight_truck, sprinter."
        }
      ]
    },
    "contract": {
      "status": 400,
      "note": "Contract EquipmentType is a single string, so code and contract agree. Gap against the 11-06 review only."
    },
    "gap": "ruled-shape-not-in-contract"
  },
  {
    "id": "S06",
    "group": "contract-shape",
    "title": "Pieces as lines (8 pallets + 4 crates)",
    "why": "Owner 11-06 confirmed pieces lines. Provisional shape.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "TEST-PO-2006",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+4}}"
        },
        "equipment": "tractor",
        "pieces": [
          {
            "count": 8,
            "type": "pallet",
            "length_in": 48,
            "width_in": 40,
            "height_in": 50
          },
          {
            "count": 4,
            "type": "crate"
          }
        ],
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts"
      }
    },
    "expect": {
      "status": 400,
      "content_type": "application/problem+json",
      "body": {
        "type": "about:blank",
        "title": "Bad request",
        "status": 400,
        "code": "bad_request",
        "detail": "The request body has 1 problem."
      },
      "errors": [
        {
          "field": "pieces",
          "code": "wrong_type",
          "message": "pieces must be a number.",
          "fix": "Send pieces as a whole number from 0 to 100000."
        }
      ]
    },
    "contract": {
      "status": 400,
      "note": "Contract pieces is an integer, so code and contract agree. Gap against the 11-06 review only."
    },
    "gap": "ruled-shape-not-in-contract"
  },
  {
    "id": "S07",
    "group": "contract-shape",
    "title": "Cancel a submitted order with PUT /v1/orders/{id}/cancel",
    "why": "Ruling 17: cancel is PUT. Allowed while submitted or in_review.",
    "request": {
      "method": "PUT",
      "path": "/v1/orders/{{saved:id}}/cancel",
      "headers": {
        "Authorization": "Bearer {{key:live}}"
      }
    },
    "expect": {
      "status": 404,
      "content_type": "application/problem+json",
      "body": {
        "type": "about:blank",
        "title": "Not found",
        "status": 404,
        "code": "not_found",
        "detail": "Nothing was found for this key."
      },
      "no_errors": true
    },
    "contract": {
      "status": 200,
      "body": {
        "id": "{{saved:id}}",
        "status": "canceled"
      },
      "note": "Contract documents cancelOrder (200, 409 conflict). No route is built: the path falls through to 404 not_found. Its rate limit (20) is already counted."
    },
    "gap": "cancel-not-built"
  },
  {
    "id": "F01",
    "group": "failing",
    "title": "Empty JSON object",
    "why": "A client library sends {} when its order mapping fails.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {}
    },
    "expect": {
      "status": 400,
      "content_type": "application/problem+json",
      "body": {
        "type": "about:blank",
        "title": "Bad request",
        "status": 400,
        "code": "bad_request",
        "detail": "The request body has 3 problems."
      },
      "errors": [
        {
          "field": "ref",
          "code": "required",
          "message": "ref is missing.",
          "fix": "Send ref as a string of 1 to 100 characters."
        },
        {
          "field": "pickup",
          "code": "required",
          "message": "pickup is missing.",
          "fix": "Send pickup as an object."
        },
        {
          "field": "delivery",
          "code": "required",
          "message": "delivery is missing.",
          "fix": "Send delivery as an object."
        }
      ]
    },
    "gap": null
  },
  {
    "id": "F02",
    "group": "failing",
    "title": "Missing ref",
    "why": "Client forgot to map its PO number.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+4}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts"
      }
    },
    "expect": {
      "status": 400,
      "content_type": "application/problem+json",
      "body": {
        "type": "about:blank",
        "title": "Bad request",
        "status": 400,
        "code": "bad_request",
        "detail": "The request body has 1 problem."
      },
      "errors": [
        {
          "field": "ref",
          "code": "required",
          "message": "ref is missing.",
          "fix": "Send ref as a string of 1 to 100 characters."
        }
      ]
    },
    "gap": null
  },
  {
    "id": "F03",
    "group": "failing",
    "title": "Pickup without a date",
    "why": "Client sends a \"ready when you are\" pickup.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "TEST-PO-1001",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+4}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts"
      }
    },
    "expect": {
      "status": 400,
      "content_type": "application/problem+json",
      "body": {
        "type": "about:blank",
        "title": "Bad request",
        "status": 400,
        "code": "bad_request",
        "detail": "The request body has 1 problem."
      },
      "errors": [
        {
          "field": "pickup.date",
          "code": "required",
          "message": "pickup.date is missing.",
          "fix": "Send pickup.date as YYYY-MM-DD."
        }
      ]
    },
    "gap": null
  },
  {
    "id": "F04",
    "group": "failing",
    "title": "Wrong types: numeric ref, pieces and weight as strings",
    "why": "Client serializes everything from a CSV as text, and its PO number as a number.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": 1001,
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+4}}"
        },
        "equipment": "tractor",
        "pieces": "12",
        "weight": {
          "value": "2400",
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts"
      }
    },
    "expect": {
      "status": 400,
      "content_type": "application/problem+json",
      "body": {
        "type": "about:blank",
        "title": "Bad request",
        "status": 400,
        "code": "bad_request",
        "detail": "The request body has 3 problems."
      },
      "errors": [
        {
          "field": "ref",
          "code": "wrong_type",
          "message": "ref must be a string.",
          "fix": "Send ref as a string of 1 to 100 characters."
        },
        {
          "field": "pieces",
          "code": "wrong_type",
          "message": "pieces must be a number.",
          "fix": "Send pieces as a whole number from 0 to 100000."
        },
        {
          "field": "weight.value",
          "code": "wrong_type",
          "message": "weight.value must be a number.",
          "fix": "Send weight.value as a number from 0 to 1000000."
        }
      ]
    },
    "gap": null
  },
  {
    "id": "F05",
    "group": "failing",
    "title": "Fractional pieces (12.5)",
    "why": "Client averages pieces across lines.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "TEST-PO-1001",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+4}}"
        },
        "equipment": "tractor",
        "pieces": 12.5,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts"
      }
    },
    "expect": {
      "status": 400,
      "content_type": "application/problem+json",
      "body": {
        "type": "about:blank",
        "title": "Bad request",
        "status": 400,
        "code": "bad_request",
        "detail": "The request body has 1 problem."
      },
      "errors": [
        {
          "field": "pieces",
          "code": "wrong_type",
          "message": "pieces must be a whole number.",
          "fix": "Send pieces as a whole number from 0 to 100000."
        }
      ]
    },
    "gap": null
  },
  {
    "id": "F06",
    "group": "failing",
    "title": "Pieces and weight over the caps (100001 pieces, 1000001 lbs)",
    "why": "Ruling 12 caps: pieces 0 to 100000, weight up to 1000000. A unit mix-up (grams as lbs) blows past them.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "TEST-PO-1001",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+4}}"
        },
        "equipment": "tractor",
        "pieces": 100001,
        "weight": {
          "value": 1000001,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts"
      }
    },
    "expect": {
      "status": 400,
      "content_type": "application/problem+json",
      "body": {
        "type": "about:blank",
        "title": "Bad request",
        "status": 400,
        "code": "bad_request",
        "detail": "The request body has 2 problems."
      },
      "errors": [
        {
          "field": "pieces",
          "code": "invalid_value",
          "message": "pieces must be a whole number from 0 to 100000.",
          "fix": "Send pieces as a whole number from 0 to 100000."
        },
        {
          "field": "weight.value",
          "code": "invalid_value",
          "message": "weight.value must be a number from 0 to 1000000.",
          "fix": "Send weight.value as a number from 0 to 1000000."
        }
      ]
    },
    "gap": null
  },
  {
    "id": "F07",
    "group": "failing",
    "title": "Weight unit spelled out (\"pounds\")",
    "why": "Client uses its own unit label.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "TEST-PO-1001",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+4}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "pounds"
        },
        "commodity": "Boxed machine parts"
      }
    },
    "expect": {
      "status": 400,
      "content_type": "application/problem+json",
      "body": {
        "type": "about:blank",
        "title": "Bad request",
        "status": 400,
        "code": "bad_request",
        "detail": "The request body has 1 problem."
      },
      "errors": [
        {
          "field": "weight.unit",
          "code": "invalid_value",
          "message": "weight.unit is not an allowed value.",
          "fix": "Send weight.unit as one of lbs, kg."
        }
      ]
    },
    "gap": null
  },
  {
    "id": "F08",
    "group": "failing",
    "title": "US-style pickup date (11/12/2026)",
    "why": "Client sends the date as shown on its screen.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "TEST-PO-1001",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "11/12/2026"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+4}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts"
      }
    },
    "expect": {
      "status": 400,
      "content_type": "application/problem+json",
      "body": {
        "type": "about:blank",
        "title": "Bad request",
        "status": 400,
        "code": "bad_request",
        "detail": "The request body has 1 problem."
      },
      "errors": [
        {
          "field": "pickup.date",
          "code": "invalid_format",
          "message": "pickup.date is not a real date in YYYY-MM-DD form.",
          "fix": "Send pickup.date as YYYY-MM-DD."
        }
      ]
    },
    "gap": null
  },
  {
    "id": "F09",
    "group": "failing",
    "title": "Impossible delivery date (2027-02-30)",
    "why": "Client adds days to a date without a calendar.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "TEST-PO-1001",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "2027-02-30"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts"
      }
    },
    "expect": {
      "status": 400,
      "content_type": "application/problem+json",
      "body": {
        "type": "about:blank",
        "title": "Bad request",
        "status": 400,
        "code": "bad_request",
        "detail": "The request body has 1 problem."
      },
      "errors": [
        {
          "field": "delivery.date",
          "code": "invalid_format",
          "message": "delivery.date is not a real date in YYYY-MM-DD form.",
          "fix": "Send delivery.date as YYYY-MM-DD or null."
        }
      ]
    },
    "gap": null
  },
  {
    "id": "F10",
    "group": "failing",
    "title": "Malformed JSON (trailing comma)",
    "why": "Hand-built JSON string.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "raw_body": "{\"ref\":\"TEST-PO-1010\",\"pickup\":{\"address\":\"1200 Example Pkwy, Elk Grove Village, IL, 60007\",\"date\":\"{{date:+3}}\"},\"delivery\":{\"address\":\"2200 Sample Rd, Columbus, OH, 43217\"},}"
    },
    "expect": {
      "status": 400,
      "content_type": "application/problem+json",
      "body": {
        "title": "Bad request",
        "status": 400,
        "code": "bad_request",
        "detail": "The body is not valid JSON."
      },
      "no_errors": true
    },
    "gap": null
  },
  {
    "id": "F11",
    "group": "failing",
    "title": "Batch of two orders sent as a JSON array",
    "why": "Client tries to place several orders in one call.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": [
        {
          "ref": "TEST-PO-1101",
          "pickup": {
            "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
            "date": "{{date:+3}}"
          },
          "delivery": {
            "address": "2200 Sample Rd, Columbus, OH, 43217",
            "date": "{{date:+4}}"
          },
          "equipment": "tractor",
          "pieces": 12,
          "weight": {
            "value": 2400,
            "unit": "lbs"
          },
          "commodity": "Boxed machine parts"
        },
        {
          "ref": "TEST-PO-1102",
          "pickup": {
            "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
            "date": "{{date:+3}}"
          },
          "delivery": {
            "address": "2200 Sample Rd, Columbus, OH, 43217",
            "date": "{{date:+4}}"
          },
          "equipment": "tractor",
          "pieces": 12,
          "weight": {
            "value": 2400,
            "unit": "lbs"
          },
          "commodity": "Boxed machine parts"
        }
      ]
    },
    "expect": {
      "status": 400,
      "content_type": "application/problem+json",
      "body": {
        "title": "Bad request",
        "status": 400,
        "code": "bad_request",
        "detail": "The body must be a JSON object."
      },
      "no_errors": true
    },
    "gap": null
  },
  {
    "id": "F12",
    "group": "failing",
    "title": "Content-Type text/plain",
    "why": "HTTP library default when the body is a string.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "text/plain",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "TEST-PO-1001",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+4}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts"
      }
    },
    "expect": {
      "status": 415,
      "content_type": "application/problem+json",
      "body": {
        "type": "about:blank",
        "title": "Unsupported media type",
        "status": 415,
        "code": "unsupported_media_type",
        "detail": "The request body must be application/json."
      },
      "no_errors": true
    },
    "gap": null
  },
  {
    "id": "F13",
    "group": "failing",
    "title": "Form-encoded body",
    "why": "Client posts the order like a web form.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/x-www-form-urlencoded",
        "Idempotency-Key": "{{idem}}"
      },
      "raw_body": "ref=TEST-PO-1013&pickup_address=1200+Example+Pkwy%2C+Elk+Grove+Village%2C+IL%2C+60007&pickup_date={{date:+3}}"
    },
    "expect": {
      "status": 415,
      "content_type": "application/problem+json",
      "body": {
        "type": "about:blank",
        "title": "Unsupported media type",
        "status": 415,
        "code": "unsupported_media_type",
        "detail": "The request body must be application/json."
      },
      "no_errors": true
    },
    "gap": null
  },
  {
    "id": "F14",
    "group": "failing",
    "title": "No Idempotency-Key header",
    "why": "Client skips the header the docs require.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json"
      },
      "body": {
        "ref": "TEST-PO-1001",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+4}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts"
      }
    },
    "expect": {
      "status": 400,
      "content_type": "application/problem+json",
      "body": {
        "title": "Bad request",
        "status": 400,
        "code": "bad_request",
        "detail": "The Idempotency-Key header is required: 8 to 100 characters."
      },
      "no_errors": true
    },
    "gap": null
  },
  {
    "id": "F15",
    "group": "failing",
    "title": "Idempotency-Key too short (\"1015\")",
    "why": "Client reuses a short sequence number.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "1015"
      },
      "body": {
        "ref": "TEST-PO-1001",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+4}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts"
      }
    },
    "expect": {
      "status": 400,
      "content_type": "application/problem+json",
      "body": {
        "title": "Bad request",
        "status": 400,
        "code": "bad_request",
        "detail": "The Idempotency-Key header is required: 8 to 100 characters."
      },
      "no_errors": true
    },
    "gap": null
  },
  {
    "id": "F16",
    "group": "failing",
    "title": "Pickup date yesterday",
    "why": "Client resends a stale order from yesterday.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "TEST-PO-1016",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:-1}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+1}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts"
      }
    },
    "expect": {
      "status": 201,
      "content_type": "application/json",
      "body": {
        "ref": "TEST-PO-1016",
        "status": "submitted",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:-1}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+1}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts",
        "loads": []
      },
      "body_match": {
        "id": "^REQ-[0-9]+$",
        "created_at": "^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$"
      }
    },
    "contract": {
      "status": 400,
      "errors": [
        {
          "field": "pickup.date",
          "code": "date_in_past"
        }
      ],
      "note": "Contract and pre-launch item 4: a pickup before today (US Central) is refused with date_in_past. The code has no such check and places the order."
    },
    "gap": "accepts-what-it-should-refuse"
  },
  {
    "id": "F17",
    "group": "failing",
    "title": "Delivery date before pickup date",
    "why": "Client swaps the two dates.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "TEST-PO-1017",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+5}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+3}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts"
      }
    },
    "expect": {
      "status": 201,
      "content_type": "application/json",
      "body": {
        "ref": "TEST-PO-1017",
        "status": "submitted",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+5}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+3}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts",
        "loads": []
      },
      "body_match": {
        "id": "^REQ-[0-9]+$",
        "created_at": "^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$"
      }
    },
    "contract": {
      "status": 400,
      "errors": [
        {
          "field": "delivery.date",
          "code": "before_pickup"
        }
      ],
      "note": "Contract and pre-launch item 4: a delivery before the pickup is refused with before_pickup. The code places the order."
    },
    "gap": "accepts-what-it-should-refuse"
  },
  {
    "id": "F18",
    "group": "failing",
    "title": "Pickup 366 days out (one past the ceiling)",
    "why": "Client books next year's recurring load one day too early.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "TEST-PO-1018",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+366}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": null
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts"
      }
    },
    "expect": {
      "status": 400,
      "content_type": "application/problem+json",
      "body": {
        "type": "about:blank",
        "title": "Bad request",
        "status": 400,
        "code": "bad_request",
        "detail": "The request body has 1 problem."
      },
      "errors": [
        {
          "field": "pickup.date",
          "code": "invalid_value",
          "message": "pickup.date is more than 365 days after today.",
          "fix": "Send pickup.date as {{date:+365}} or earlier, using the US Central calendar date."
        }
      ]
    },
    "gap": null
  },
  {
    "id": "F19",
    "group": "failing",
    "title": "Delivery in Texas (outside the 9-state zone)",
    "why": "Client sends a lane Moscoso does not run.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "TEST-PO-1019",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "4100 Example Blvd, Dallas, TX, 75201",
          "date": "{{date:+5}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts"
      }
    },
    "expect": {
      "status": 400,
      "content_type": "application/problem+json",
      "body": {
        "type": "about:blank",
        "title": "Bad request",
        "status": 400,
        "code": "bad_request",
        "detail": "The request body has 1 problem."
      },
      "errors": [
        {
          "field": "delivery.address",
          "code": "outside_service_area",
          "message": "The delivery address is in TX, which is outside the Moscoso Express service area.",
          "fix": "This order was not placed; contact API@MoscosoExpress.com to ask about this lane."
        }
      ]
    },
    "gap": null
  },
  {
    "id": "F20",
    "group": "failing",
    "title": "Pickup in Pennsylvania (ruled out on 11-06)",
    "why": "PA has one lane on file but is not in the service area.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "TEST-PO-1020",
        "pickup": {
          "address": "300 Sample St, Pittsburgh, PA 15222",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+4}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts"
      }
    },
    "expect": {
      "status": 400,
      "content_type": "application/problem+json",
      "body": {
        "type": "about:blank",
        "title": "Bad request",
        "status": 400,
        "code": "bad_request",
        "detail": "The request body has 1 problem."
      },
      "errors": [
        {
          "field": "pickup.address",
          "code": "outside_service_area",
          "message": "The pickup address is in PA, which is outside the Moscoso Express service area.",
          "fix": "This order was not placed; contact API@MoscosoExpress.com to ask about this lane."
        }
      ]
    },
    "gap": null
  },
  {
    "id": "F21",
    "group": "failing",
    "title": "Both stops outside: California pickup, Ontario (Canada) delivery",
    "why": "Cross-border lane. Ruling 18: postal code in its own segment, then CA, reads Canada.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "TEST-PO-1021",
        "pickup": {
          "address": "18 Test Ave, Sacramento, CA 95814",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "100 Example St, Toronto, ON, M5V 2T6, CA",
          "date": "{{date:+6}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts"
      }
    },
    "expect": {
      "status": 400,
      "content_type": "application/problem+json",
      "body": {
        "type": "about:blank",
        "title": "Bad request",
        "status": 400,
        "code": "bad_request",
        "detail": "The request body has 2 problems."
      },
      "errors": [
        {
          "field": "pickup.address",
          "code": "outside_service_area",
          "message": "The pickup address is in CA, which is outside the Moscoso Express service area.",
          "fix": "This order was not placed; contact API@MoscosoExpress.com to ask about this lane."
        },
        {
          "field": "delivery.address",
          "code": "outside_service_area",
          "message": "The delivery address is in ON, CA, which is outside the Moscoso Express service area.",
          "fix": "This order was not placed; contact API@MoscosoExpress.com to ask about this lane."
        }
      ]
    },
    "gap": null
  },
  {
    "id": "F22",
    "group": "failing",
    "title": "Delivery in Nuevo Leon, Mexico",
    "why": "Ruling 15: CA and MX read only when certain, refused today.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "TEST-PO-1022",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "Av. Ejemplo 200, Monterrey, NL, 64000, MX",
          "date": "{{date:+6}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts"
      }
    },
    "expect": {
      "status": 400,
      "content_type": "application/problem+json",
      "body": {
        "type": "about:blank",
        "title": "Bad request",
        "status": 400,
        "code": "bad_request",
        "detail": "The request body has 1 problem."
      },
      "errors": [
        {
          "field": "delivery.address",
          "code": "outside_service_area",
          "message": "The delivery address is in NL, MX, which is outside the Moscoso Express service area.",
          "fix": "This order was not placed; contact API@MoscosoExpress.com to ask about this lane."
        }
      ]
    },
    "gap": null
  },
  {
    "id": "F23",
    "group": "failing",
    "title": "Out-of-zone state in lowercase (\"dallas, tx\")",
    "why": "Client lowercases addresses before sending.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "TEST-PO-1023",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "4100 Example Blvd, dallas, tx 75201",
          "date": "{{date:+5}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts"
      }
    },
    "expect": {
      "status": 201,
      "content_type": "application/json",
      "body": {
        "ref": "TEST-PO-1023",
        "status": "submitted",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "4100 Example Blvd, dallas, tx 75201",
          "date": "{{date:+5}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts",
        "loads": []
      },
      "body_match": {
        "id": "^REQ-[0-9]+$",
        "created_at": "^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$"
      }
    },
    "gap": "zone-slips-to-review"
  },
  {
    "id": "F24",
    "group": "failing",
    "title": "Out-of-zone state spelled out (\"Austin, Texas\")",
    "why": "Client writes full state names.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "TEST-PO-1024",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "55 Sample Ave, Austin, Texas 78701",
          "date": "{{date:+5}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts"
      }
    },
    "expect": {
      "status": 201,
      "content_type": "application/json",
      "body": {
        "ref": "TEST-PO-1024",
        "status": "submitted",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "55 Sample Ave, Austin, Texas 78701",
          "date": "{{date:+5}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts",
        "loads": []
      },
      "body_match": {
        "id": "^REQ-[0-9]+$",
        "created_at": "^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$"
      }
    },
    "gap": "zone-slips-to-review"
  },
  {
    "id": "F25",
    "group": "failing",
    "title": "Unknown state code (ZZ)",
    "why": "Typo or placeholder in the client address book.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "TEST-PO-1025",
        "pickup": {
          "address": "9 Placeholder Rd, Springfield, ZZ 62704",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+4}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts"
      }
    },
    "expect": {
      "status": 201,
      "content_type": "application/json",
      "body": {
        "ref": "TEST-PO-1025",
        "status": "submitted",
        "pickup": {
          "address": "9 Placeholder Rd, Springfield, ZZ 62704",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+4}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts",
        "loads": []
      },
      "body_match": {
        "id": "^REQ-[0-9]+$",
        "created_at": "^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$"
      }
    },
    "gap": null
  },
  {
    "id": "F26",
    "group": "failing",
    "title": "Unknown country code at the end (\", XX\")",
    "why": "Client appends its own country field.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "TEST-PO-1026",
        "pickup": {
          "address": "1200 Example Pkwy, Chicago, IL, 60601, XX",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+4}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts"
      }
    },
    "expect": {
      "status": 201,
      "content_type": "application/json",
      "body": {
        "ref": "TEST-PO-1026",
        "status": "submitted",
        "pickup": {
          "address": "1200 Example Pkwy, Chicago, IL, 60601, XX",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+4}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts",
        "loads": []
      },
      "body_match": {
        "id": "^REQ-[0-9]+$",
        "created_at": "^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$"
      }
    },
    "gap": null
  },
  {
    "id": "F27",
    "group": "failing",
    "title": "Equipment Moscoso does not run (\"reefer\")",
    "why": "Client asks for a refrigerated trailer.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "TEST-PO-1001",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+4}}"
        },
        "equipment": "reefer",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts"
      }
    },
    "expect": {
      "status": 400,
      "content_type": "application/problem+json",
      "body": {
        "type": "about:blank",
        "title": "Bad request",
        "status": 400,
        "code": "bad_request",
        "detail": "The request body has 1 problem."
      },
      "errors": [
        {
          "field": "equipment",
          "code": "invalid_value",
          "message": "equipment is not an allowed value.",
          "fix": "Send equipment as one of tractor, straight_truck, sprinter."
        }
      ]
    },
    "gap": null
  },
  {
    "id": "F28",
    "group": "failing",
    "title": "Equipment as a display label (\"Straight Truck\")",
    "why": "Client sends the label from the docs table instead of the code.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "TEST-PO-1001",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+4}}"
        },
        "equipment": "Straight Truck",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts"
      }
    },
    "expect": {
      "status": 400,
      "content_type": "application/problem+json",
      "body": {
        "type": "about:blank",
        "title": "Bad request",
        "status": 400,
        "code": "bad_request",
        "detail": "The request body has 1 problem."
      },
      "errors": [
        {
          "field": "equipment",
          "code": "invalid_value",
          "message": "equipment is not an allowed value.",
          "fix": "Send equipment as one of tractor, straight_truck, sprinter."
        }
      ]
    },
    "gap": null
  },
  {
    "id": "F29",
    "group": "failing",
    "title": "Too many stops: a 25-stop array beside pickup and delivery",
    "why": "A milk-run client sends its whole route.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "TEST-PO-1001",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+4}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts",
        "stops": [
          {
            "type": "pickup",
            "address": "15 Warehouse Row, Joliet, IL 60431",
            "date": "{{date:+3}}"
          },
          {
            "type": "delivery",
            "address": "15 Warehouse Row, Joliet, IL 60431",
            "date": "{{date:+3}}"
          },
          {
            "type": "delivery",
            "address": "15 Warehouse Row, Joliet, IL 60431",
            "date": "{{date:+3}}"
          },
          {
            "type": "delivery",
            "address": "15 Warehouse Row, Joliet, IL 60431",
            "date": "{{date:+3}}"
          },
          {
            "type": "delivery",
            "address": "15 Warehouse Row, Joliet, IL 60431",
            "date": "{{date:+3}}"
          },
          {
            "type": "delivery",
            "address": "15 Warehouse Row, Joliet, IL 60431",
            "date": "{{date:+3}}"
          },
          {
            "type": "delivery",
            "address": "15 Warehouse Row, Joliet, IL 60431",
            "date": "{{date:+3}}"
          },
          {
            "type": "delivery",
            "address": "15 Warehouse Row, Joliet, IL 60431",
            "date": "{{date:+3}}"
          },
          {
            "type": "delivery",
            "address": "15 Warehouse Row, Joliet, IL 60431",
            "date": "{{date:+3}}"
          },
          {
            "type": "delivery",
            "address": "15 Warehouse Row, Joliet, IL 60431",
            "date": "{{date:+3}}"
          },
          {
            "type": "delivery",
            "address": "15 Warehouse Row, Joliet, IL 60431",
            "date": "{{date:+3}}"
          },
          {
            "type": "delivery",
            "address": "15 Warehouse Row, Joliet, IL 60431",
            "date": "{{date:+3}}"
          },
          {
            "type": "delivery",
            "address": "15 Warehouse Row, Joliet, IL 60431",
            "date": "{{date:+3}}"
          },
          {
            "type": "delivery",
            "address": "15 Warehouse Row, Joliet, IL 60431",
            "date": "{{date:+3}}"
          },
          {
            "type": "delivery",
            "address": "15 Warehouse Row, Joliet, IL 60431",
            "date": "{{date:+3}}"
          },
          {
            "type": "delivery",
            "address": "15 Warehouse Row, Joliet, IL 60431",
            "date": "{{date:+3}}"
          },
          {
            "type": "delivery",
            "address": "15 Warehouse Row, Joliet, IL 60431",
            "date": "{{date:+3}}"
          },
          {
            "type": "delivery",
            "address": "15 Warehouse Row, Joliet, IL 60431",
            "date": "{{date:+3}}"
          },
          {
            "type": "delivery",
            "address": "15 Warehouse Row, Joliet, IL 60431",
            "date": "{{date:+3}}"
          },
          {
            "type": "delivery",
            "address": "15 Warehouse Row, Joliet, IL 60431",
            "date": "{{date:+3}}"
          },
          {
            "type": "delivery",
            "address": "15 Warehouse Row, Joliet, IL 60431",
            "date": "{{date:+3}}"
          },
          {
            "type": "delivery",
            "address": "15 Warehouse Row, Joliet, IL 60431",
            "date": "{{date:+3}}"
          },
          {
            "type": "delivery",
            "address": "15 Warehouse Row, Joliet, IL 60431",
            "date": "{{date:+3}}"
          },
          {
            "type": "delivery",
            "address": "15 Warehouse Row, Joliet, IL 60431",
            "date": "{{date:+3}}"
          },
          {
            "type": "delivery",
            "address": "15 Warehouse Row, Joliet, IL 60431",
            "date": "{{date:+3}}"
          }
        ]
      }
    },
    "expect": {
      "status": 400,
      "content_type": "application/problem+json",
      "body": {
        "type": "about:blank",
        "title": "Bad request",
        "status": 400,
        "code": "bad_request",
        "detail": "The request body has 1 problem."
      },
      "errors": [
        {
          "field": "stops",
          "code": "unknown_field",
          "message": "stops is not a field of this API.",
          "fix": "Remove this field."
        }
      ]
    },
    "gap": null
  },
  {
    "id": "F30",
    "group": "failing",
    "title": "Too many problems: 60 unknown fields from a TMS record dump",
    "why": "Client posts its whole internal record.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "TEST-PO-1001",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+4}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts",
        "custom_01": "x",
        "custom_02": "x",
        "custom_03": "x",
        "custom_04": "x",
        "custom_05": "x",
        "custom_06": "x",
        "custom_07": "x",
        "custom_08": "x",
        "custom_09": "x",
        "custom_10": "x",
        "custom_11": "x",
        "custom_12": "x",
        "custom_13": "x",
        "custom_14": "x",
        "custom_15": "x",
        "custom_16": "x",
        "custom_17": "x",
        "custom_18": "x",
        "custom_19": "x",
        "custom_20": "x",
        "custom_21": "x",
        "custom_22": "x",
        "custom_23": "x",
        "custom_24": "x",
        "custom_25": "x",
        "custom_26": "x",
        "custom_27": "x",
        "custom_28": "x",
        "custom_29": "x",
        "custom_30": "x",
        "custom_31": "x",
        "custom_32": "x",
        "custom_33": "x",
        "custom_34": "x",
        "custom_35": "x",
        "custom_36": "x",
        "custom_37": "x",
        "custom_38": "x",
        "custom_39": "x",
        "custom_40": "x",
        "custom_41": "x",
        "custom_42": "x",
        "custom_43": "x",
        "custom_44": "x",
        "custom_45": "x",
        "custom_46": "x",
        "custom_47": "x",
        "custom_48": "x",
        "custom_49": "x",
        "custom_50": "x",
        "custom_51": "x",
        "custom_52": "x",
        "custom_53": "x",
        "custom_54": "x",
        "custom_55": "x",
        "custom_56": "x",
        "custom_57": "x",
        "custom_58": "x",
        "custom_59": "x",
        "custom_60": "x"
      }
    },
    "expect": {
      "status": 400,
      "content_type": "application/problem+json",
      "body": {
        "code": "bad_request",
        "detail": "The request body has 60 problems. The first 50 are listed."
      },
      "errors_count": 50
    },
    "gap": null
  },
  {
    "id": "F31",
    "group": "failing",
    "title": "Oversize payload: notes of 70,000 characters",
    "why": "Client pastes an email thread into notes.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "TEST-PO-1001",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+4}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts",
        "notes": "{{fill:70000}}"
      }
    },
    "expect": {
      "status": 413,
      "content_type": "application/problem+json",
      "body": {
        "type": "about:blank",
        "title": "Payload too large",
        "status": 413,
        "code": "payload_too_large",
        "detail": "The request body is over 64 KB."
      },
      "no_errors": true
    },
    "gap": null
  },
  {
    "id": "F32",
    "group": "failing",
    "title": "Text fields too long: ref 101, commodity 301, notes 2001 characters",
    "why": "Client concatenates several refs and descriptions.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "{{fill:101}}",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+4}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "{{fill:301}}",
        "notes": "{{fill:2001}}"
      }
    },
    "expect": {
      "status": 400,
      "content_type": "application/problem+json",
      "body": {
        "type": "about:blank",
        "title": "Bad request",
        "status": 400,
        "code": "bad_request",
        "detail": "The request body has 3 problems."
      },
      "errors": [
        {
          "field": "ref",
          "code": "too_long",
          "message": "ref is too long.",
          "fix": "Send ref as a string of 1 to 100 characters."
        },
        {
          "field": "commodity",
          "code": "too_long",
          "message": "commodity is too long.",
          "fix": "Send commodity as a string of 0 to 300 characters."
        },
        {
          "field": "notes",
          "code": "too_long",
          "message": "notes is too long.",
          "fix": "Send notes as a string of 0 to 2000 characters."
        }
      ]
    },
    "gap": null
  },
  {
    "id": "F33",
    "group": "failing",
    "title": "Pickup address too short (\"IL\"), delivery address all spaces",
    "why": "Client sends only a state, and a blank padded field.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "TEST-PO-1001",
        "pickup": {
          "address": "IL",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "      ",
          "date": "{{date:+4}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts"
      }
    },
    "expect": {
      "status": 400,
      "content_type": "application/problem+json",
      "body": {
        "type": "about:blank",
        "title": "Bad request",
        "status": 400,
        "code": "bad_request",
        "detail": "The request body has 2 problems."
      },
      "errors": [
        {
          "field": "pickup.address",
          "code": "too_short",
          "message": "pickup.address is too short.",
          "fix": "Send pickup.address as a string of 5 to 300 characters."
        },
        {
          "field": "delivery.address",
          "code": "invalid_value",
          "message": "delivery.address is blank.",
          "fix": "Send delivery.address as the street address of this stop."
        }
      ]
    },
    "gap": null
  },
  {
    "id": "F34",
    "group": "failing",
    "title": "Spoofed client: client_id and client_code in the body",
    "why": "A platform tries to place an order for another client.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "TEST-PO-1001",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+4}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts",
        "client_id": "cli_fx_prai",
        "client_code": "ZPG"
      }
    },
    "expect": {
      "status": 400,
      "content_type": "application/problem+json",
      "body": {
        "type": "about:blank",
        "title": "Bad request",
        "status": 400,
        "code": "bad_request",
        "detail": "The request body has 2 problems."
      },
      "errors": [
        {
          "field": "client_id",
          "code": "unknown_field",
          "message": "client_id is not a field of this API.",
          "fix": "Remove this field."
        },
        {
          "field": "client_code",
          "code": "unknown_field",
          "message": "client_code is not a field of this API.",
          "fix": "Remove this field."
        }
      ]
    },
    "gap": null
  },
  {
    "id": "F35",
    "group": "failing",
    "title": "Guessed stop fields: pickup.time and delivery.appointment",
    "why": "Client guesses field names from another carrier's API.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "TEST-PO-1001",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+3}}",
          "time": "08:00"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+4}}",
          "appointment": true
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts"
      }
    },
    "expect": {
      "status": 400,
      "content_type": "application/problem+json",
      "body": {
        "type": "about:blank",
        "title": "Bad request",
        "status": 400,
        "code": "bad_request",
        "detail": "The request body has 2 problems."
      },
      "errors": [
        {
          "field": "pickup.time",
          "code": "unknown_field",
          "message": "pickup.time is not a field of this API.",
          "fix": "Remove this field."
        },
        {
          "field": "delivery.appointment",
          "code": "unknown_field",
          "message": "delivery.appointment is not a field of this API.",
          "fix": "Remove this field."
        }
      ]
    },
    "gap": null
  },
  {
    "id": "F36",
    "group": "failing",
    "title": "Same Idempotency-Key reused with a different body",
    "why": "Client reuses a key after editing the order.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem:dup}}"
      },
      "body": {
        "ref": "TEST-PO-1036",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+4}}"
        },
        "equipment": "tractor",
        "pieces": 14,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts"
      }
    },
    "expect": {
      "status": 409,
      "content_type": "application/problem+json",
      "body": {
        "type": "about:blank",
        "title": "Idempotency conflict",
        "status": 409,
        "code": "idempotency_conflict",
        "detail": "This Idempotency-Key was already used with a different body."
      },
      "no_errors": true
    },
    "gap": null
  },
  {
    "id": "F37",
    "group": "failing",
    "title": "Same client ref sent twice with fresh Idempotency-Keys",
    "why": "Client regenerates the key on every retry.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem:second}}"
      },
      "body": {
        "ref": "TEST-PO-1037",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+4}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts"
      }
    },
    "expect": {
      "status": 201,
      "content_type": "application/json",
      "body": {
        "ref": "TEST-PO-1037",
        "status": "submitted",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+4}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts",
        "loads": []
      },
      "body_match": {
        "id": "^REQ-[0-9]+$",
        "created_at": "^[0-9]{4}-[0-9]{2}-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}Z$"
      },
      "body_not": {
        "id": "{{saved:id}}"
      }
    },
    "gap": "duplicate-ref"
  },
  {
    "id": "F38",
    "group": "failing",
    "title": "DELETE /v1/orders",
    "why": "Client tries to clear its orders.",
    "request": {
      "method": "DELETE",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:live}}"
      }
    },
    "expect": {
      "status": 405,
      "content_type": "application/problem+json",
      "body": {
        "type": "about:blank",
        "title": "Method not allowed",
        "status": 405,
        "code": "method_not_allowed",
        "detail": "This path does not support that method."
      },
      "no_errors": true,
      "headers": {
        "Allow": "GET, POST"
      }
    },
    "gap": null
  },
  {
    "id": "F39",
    "group": "failing",
    "title": "PATCH /v1/orders/{id} to edit an order",
    "why": "Client tries to change the pickup date after placing.",
    "request": {
      "method": "PATCH",
      "path": "/v1/orders/{{saved:id}}",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json"
      },
      "body": {
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+6}}"
        }
      }
    },
    "expect": {
      "status": 405,
      "content_type": "application/problem+json",
      "body": {
        "type": "about:blank",
        "title": "Method not allowed",
        "status": 405,
        "code": "method_not_allowed",
        "detail": "This path does not support that method."
      },
      "no_errors": true,
      "headers": {
        "Allow": "GET"
      }
    },
    "gap": null
  },
  {
    "id": "F40",
    "group": "failing",
    "title": "Cancel with PATCH (the superseded ruling 9 verb)",
    "why": "Client built against the 11-06 docs.",
    "request": {
      "method": "PATCH",
      "path": "/v1/orders/{{saved:id}}/cancel",
      "headers": {
        "Authorization": "Bearer {{key:live}}"
      }
    },
    "expect": {
      "status": 404,
      "content_type": "application/problem+json",
      "body": {
        "type": "about:blank",
        "title": "Not found",
        "status": 404,
        "code": "not_found",
        "detail": "Nothing was found for this key."
      },
      "no_errors": true
    },
    "contract": {
      "status": 405,
      "headers": {
        "Allow": "PUT"
      },
      "note": "Contract documents 405 for this path. With no cancel route built, every method answers 404."
    },
    "gap": "cancel-not-built"
  },
  {
    "id": "F41",
    "group": "failing",
    "title": "No Authorization header",
    "why": "Client forgets to attach its key.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "TEST-PO-1001",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+4}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts"
      }
    },
    "expect": {
      "status": 401,
      "content_type": "application/problem+json",
      "body": {
        "type": "about:blank",
        "title": "Unauthorized",
        "status": 401,
        "code": "unauthorized",
        "detail": "A valid API key is required."
      },
      "no_errors": true,
      "headers": {
        "WWW-Authenticate": "Bearer"
      }
    },
    "gap": null
  },
  {
    "id": "F42",
    "group": "failing",
    "title": "Malformed Authorization (\"Token ...\")",
    "why": "Client uses another vendor's scheme.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Token {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "TEST-PO-1001",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+4}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts"
      }
    },
    "expect": {
      "status": 401,
      "content_type": "application/problem+json",
      "body": {
        "type": "about:blank",
        "title": "Unauthorized",
        "status": 401,
        "code": "unauthorized",
        "detail": "A valid API key is required."
      },
      "no_errors": true,
      "headers": {
        "WWW-Authenticate": "Bearer"
      }
    },
    "gap": null
  },
  {
    "id": "F43",
    "group": "failing",
    "title": "Revoked key",
    "why": "Client keeps using a key Moscoso revoked.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:revoked}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "TEST-PO-1001",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+4}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts"
      }
    },
    "expect": {
      "status": 401,
      "content_type": "application/problem+json",
      "body": {
        "type": "about:blank",
        "title": "Unauthorized",
        "status": 401,
        "code": "unauthorized",
        "detail": "A valid API key is required."
      },
      "no_errors": true,
      "headers": {
        "WWW-Authenticate": "Bearer"
      }
    },
    "gap": null
  },
  {
    "id": "F44",
    "group": "failing",
    "title": "Expired key",
    "why": "Key passed its expiry date.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:expired}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "TEST-PO-1001",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+4}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts"
      }
    },
    "expect": {
      "status": 401,
      "content_type": "application/problem+json",
      "body": {
        "type": "about:blank",
        "title": "Unauthorized",
        "status": 401,
        "code": "unauthorized",
        "detail": "A valid API key is required."
      },
      "no_errors": true,
      "headers": {
        "WWW-Authenticate": "Bearer"
      }
    },
    "gap": null
  },
  {
    "id": "F45",
    "group": "failing",
    "title": "Well-formed key that was never issued",
    "why": "Copy-paste error or a guessed key.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:unknown}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "TEST-PO-1001",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+4}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts"
      }
    },
    "expect": {
      "status": 401,
      "content_type": "application/problem+json",
      "body": {
        "type": "about:blank",
        "title": "Unauthorized",
        "status": 401,
        "code": "unauthorized",
        "detail": "A valid API key is required."
      },
      "no_errors": true,
      "headers": {
        "WWW-Authenticate": "Bearer"
      }
    },
    "gap": null
  },
  {
    "id": "F46",
    "group": "failing",
    "title": "Key sent in the query string",
    "why": "Client copies the habit from another carrier's API.",
    "request": {
      "method": "GET",
      "path": "/v1/orders?api_key={{key:live}}",
      "headers": {
        "Authorization": "Bearer {{key:live}}"
      }
    },
    "expect": {
      "status": 401,
      "content_type": "application/problem+json",
      "body": {
        "type": "about:blank",
        "title": "Unauthorized",
        "status": 401,
        "code": "unauthorized",
        "detail": "API keys are not accepted in a query string."
      },
      "no_errors": true,
      "headers": {
        "WWW-Authenticate": "Bearer"
      }
    },
    "gap": null
  },
  {
    "id": "F47",
    "group": "failing",
    "title": "Read-only key tries to place an order",
    "why": "Client uses its tracking key for orders.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:read_only}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "TEST-PO-1001",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+4}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts"
      }
    },
    "expect": {
      "status": 403,
      "content_type": "application/problem+json",
      "body": {
        "type": "about:blank",
        "title": "Forbidden",
        "status": 403,
        "code": "forbidden",
        "detail": "This key lacks the required scope."
      },
      "no_errors": true
    },
    "gap": null
  },
  {
    "id": "F48",
    "group": "failing",
    "title": "Key of an inactive client account",
    "why": "Client account was closed.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:inactive_client}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "TEST-PO-1001",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+4}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts"
      }
    },
    "expect": {
      "status": 403,
      "content_type": "application/problem+json",
      "body": {
        "type": "about:blank",
        "title": "Account inactive",
        "status": 403,
        "code": "account_inactive",
        "detail": "This client account is not active."
      },
      "no_errors": true
    },
    "gap": null
  },
  {
    "id": "F49",
    "group": "failing",
    "title": "Another client reads my order by id",
    "why": "Tenancy: a second client guesses REQ numbers.",
    "request": {
      "method": "GET",
      "path": "/v1/orders/{{saved:id}}",
      "headers": {
        "Authorization": "Bearer {{key:other_client}}"
      }
    },
    "expect": {
      "status": 404,
      "content_type": "application/problem+json",
      "body": {
        "type": "about:blank",
        "title": "Not found",
        "status": 404,
        "code": "not_found",
        "detail": "Nothing was found for this key."
      },
      "no_errors": true
    },
    "gap": null
  },
  {
    "id": "F50",
    "group": "failing",
    "title": "Test key reads a live order",
    "why": "Ruling 4 and the contract: a REQ- id answers 404 to a test key.",
    "request": {
      "method": "GET",
      "path": "/v1/orders/{{saved:id}}",
      "headers": {
        "Authorization": "Bearer {{key:test}}"
      }
    },
    "expect": {
      "status": 200,
      "content_type": "application/json",
      "body": {
        "id": "{{saved:id}}",
        "ref": "TEST-PO-1050"
      }
    },
    "contract": {
      "status": 404,
      "note": "Contract: a REQ- id answers 404 to a test key, and a test key never opens live tables. The code has no test mode, so the test key reads the live order."
    },
    "gap": "accepts-what-it-should-refuse"
  },
  {
    "id": "F51",
    "group": "failing",
    "title": "Order id that does not exist",
    "why": "Client mistypes the id.",
    "request": {
      "method": "GET",
      "path": "/v1/orders/REQ-999999999",
      "headers": {
        "Authorization": "Bearer {{key:live}}"
      }
    },
    "expect": {
      "status": 404,
      "content_type": "application/problem+json",
      "body": {
        "type": "about:blank",
        "title": "Not found",
        "status": 404,
        "code": "not_found",
        "detail": "Nothing was found for this key."
      },
      "no_errors": true
    },
    "gap": null
  },
  {
    "id": "F52",
    "group": "failing",
    "title": "List orders with an unknown status filter (\"pending\")",
    "why": "Client uses its own status word.",
    "request": {
      "method": "GET",
      "path": "/v1/orders?status=pending",
      "headers": {
        "Authorization": "Bearer {{key:live}}"
      }
    },
    "expect": {
      "status": 400,
      "content_type": "application/problem+json",
      "body": {
        "title": "Bad request",
        "status": 400,
        "code": "bad_request",
        "detail": "status is not an order status."
      },
      "no_errors": true
    },
    "gap": null
  },
  {
    "id": "F53",
    "group": "failing",
    "title": "List orders with page=2 instead of the cursor",
    "why": "Client assumes page-number paging.",
    "request": {
      "method": "GET",
      "path": "/v1/orders?page=2",
      "headers": {
        "Authorization": "Bearer {{key:live}}"
      }
    },
    "expect": {
      "status": 400,
      "content_type": "application/problem+json",
      "body": {
        "title": "Bad request",
        "status": 400,
        "code": "bad_request",
        "detail": "Unknown query parameter."
      },
      "no_errors": true
    },
    "gap": null
  },
  {
    "id": "F54",
    "group": "failing",
    "title": "POST /v1/orders?dry_run=true",
    "why": "Client hopes for a validate-only call (dropped from scope).",
    "request": {
      "method": "POST",
      "path": "/v1/orders?dry_run=true",
      "headers": {
        "Authorization": "Bearer {{key:live}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem}}"
      },
      "body": {
        "ref": "TEST-PO-1001",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+4}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts"
      }
    },
    "expect": {
      "status": 400,
      "content_type": "application/problem+json",
      "body": {
        "title": "Bad request",
        "status": 400,
        "code": "bad_request",
        "detail": "Unknown query parameter."
      },
      "no_errors": true
    },
    "gap": null
  },
  {
    "id": "F55",
    "group": "failing",
    "title": "Burst of 61 orders in under a minute on one key",
    "why": "Client flushes a backlog all at once. POST /v1/orders is limited to 60 a minute per key.",
    "request": {
      "method": "POST",
      "path": "/v1/orders",
      "headers": {
        "Authorization": "Bearer {{key:rate_burst}}",
        "Content-Type": "application/json",
        "Idempotency-Key": "{{idem:n{{n}}}}"
      },
      "body": {
        "ref": "TEST-PO-BURST-{{n}}",
        "pickup": {
          "address": "1200 Example Pkwy, Elk Grove Village, IL, 60007",
          "date": "{{date:+3}}"
        },
        "delivery": {
          "address": "2200 Sample Rd, Columbus, OH, 43217",
          "date": "{{date:+4}}"
        },
        "equipment": "tractor",
        "pieces": 12,
        "weight": {
          "value": 2400,
          "unit": "lbs"
        },
        "commodity": "Boxed machine parts"
      },
      "repeat": 61,
      "expect_each_before_last": {
        "status": 201
      }
    },
    "expect": {
      "status": 429,
      "content_type": "application/problem+json",
      "body": {
        "type": "about:blank",
        "title": "Too many requests",
        "status": 429,
        "code": "rate_limited",
        "detail": "Too many requests. Try again later."
      },
      "no_errors": true,
      "headers": {
        "Retry-After": "*"
      }
    },
    "gap": null
  }
];

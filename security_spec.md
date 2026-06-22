# Security Specification for Real Estate App (House Price Prediction & Valuation)

## 1. Data Invariants and Access Control Model
We enforce strict Attribute-Based Access Control (ABAC) and Zero-Trust policies across all Firestore paths:

1. **User Identity Isolation**: A user can only access, create, update, or delete records in their subcollections (`savedSearches`, `valuations`, `notifications`). Cross-user reading or writing is strictly blocked.
2. **Admins and Listings**: Real estate listings (`listings`) are publicly readable by authenticated users, but only authenticated Admins (users with records in the `/admins/` path) can write or alter listings.
3. **Temporal Invariants**: All write operations must enforce that timestamps (`createdAt`, `updatedAt`) are synced to `request.time` (rather than a client-provided time).
4. **State Transitions**: Notifications can only be updated by changing the `read` flag. Other fields are immutable.
5. **Denial of Wallet**: Every payload's parameters must have an upper size bound (e.g., string lengths) to prevent Denial of Wallet resource attacks.

---

## 2. The "Dirty Dozen" Malicious Payloads
These payloads attempt to exploit access gaps, escalate privileges, overwrite timestamps, or inject resource-draining inputs. All of these must be rejected with `PERMISSION_DENIED`.

### Case 1: Unauthenticated Listing Injection
* **Path**: `/listings/testListing`
* **Payload**: `{ "address": "123 Fraud Ave", "price": 10000000, "beds": 4, "baths": 3, "sqft": 5000, "neighborhood": "Downtown", "buildYear": 2020, "propertyType": "Condo", "status": "Active", "createdAt": "2026-06-03T08:31:00Z" }`
* **Attack Vector**: Tries to create a listing without being authenticated or an admin.

### Case 2: User Identity Spoofing (Creating Saved Search for other User)
* **Path**: `/users/victimUser/savedSearches/fraudSearch`
* **Auth**: Logged in as `attackerID`
* **Payload**: `{ "userId": "victimUser", "neighborhood": "Westside", "maxPrice": 800000, "minBeds": 2, "propertyType": "Single Family", "activeNotifications": true, "createdAt": "request.time" }`
* **Attack Vector**: Logged-in attacker attempts to inject a saved search on behalf of a victim.

### Case 3: Ghost Field Injection in Saved Search
* **Path**: `/users/attackerID/savedSearches/fraudSearch`
* **Auth**: Logged in as `attackerID`
* **Payload**: `{ "userId": "attackerID", "neighborhood": "Westside", "maxPrice": 800000, "minBeds": 2, "propertyType": "Single Family", "activeNotifications": true, "createdAt": "request.time", "secretSystemRole": "super_admin" }`
* **Attack Vector**: Attacker attempts to append an unauthorized "Ghost Field" (e.g. `secretSystemRole`) during a saved search creation.

### Case 4: Mutable Identity Hijacking during Update
* **Path**: `/users/attackerID/savedSearches/mySearch`
* **Auth**: Logged in as `attackerID`
* **Payload**: `{ "userId": "victimUser" }` (Updating `userId` of an existing record)
* **Attack Vector**: Attacker tries to transfer ownership of their search query to a victim.

### Case 5: Out-of-bounds Value Poisoning in Valuation
* **Path**: `/users/attackerID/valuations/fraudValuation`
* **Auth**: Logged in as `attackerID`
* **Payload**: `{ "userId": "attackerID", "neighborhood": "Westside", "beds": 9999999999, "baths": 5, "sqft": -500, "buildYear": 9999, "propertyType": "Condo", "condition": "Standard", "predictedPrice": 500000, "explanation": "Poison entry", "createdAt": "request.time" }`
* **Attack Vector**: User attempts to store extremely large or negative numeric features to crash prediction aggregates.

### Case 6: Client-Provided Valuation Decoupled from request.time
* **Path**: `/users/attackerID/valuations/val1`
* **Auth**: Logged in as `attackerID`
* **Payload**: `{ "userId": "attackerID", "neighborhood": "Westside", "beds": 3, "baths": 2, "sqft": 1500, "buildYear": 2005, "propertyType": "Condo", "condition": "Standard", "predictedPrice": 450000, "explanation": "Normal explanation", "createdAt": "1999-01-01T00:00:00Z" }`
* **Attack Vector**: User bypasses temporal controls by submitting a hand-crafted prehistoric `createdAt` timestamp.

### Case 7: Notification Integrity Breach (Overwriting Read-Only Field)
* **Path**: `/users/attackerID/notifications/notif1`
* **Auth**: Logged in as `attackerID`
* **Payload (Update)**: `{ "title": "System Administrator Message", "message": "You are actually hacked!", "read": true }`
* **Attack Vector**: User attempts to update the title or message of their own notification alert, changing the content.

### Case 8: Path Poisoning ID Resource Exhaustion
* **Path**: `/users/attackerID/savedSearches/` + `"a".repeat(2000)`
* **Auth**: Logged in as `attackerID`
* **Payload**: `{ "userId": "attackerID", "neighborhood": "Westside", "maxPrice": 800000, "minBeds": 2, "propertyType": "Single Family", "activeNotifications": true, "createdAt": "request.time" }`
* **Attack Vector**: A user tries to write to an extremely long, malicious document ID to cause storage bloated indices.

### Case 9: Email Spoofing Admin Attack
* **Path**: `/listings/fraudListing`
* **Auth**: Logged in with email `admin@realestateapp.com` but `email_verified` is `false`
* **Payload**: `{ "address": "123 Admin Rd", "price": 500000, "beds": 2, "baths": 1, "sqft": 1000, "neighborhood": "Downtown", "buildYear": 1995, "propertyType": "Condo", "status": "Active", "createdAt": "request.time" }`
* **Attack Vector**: Attacker registers an unverified account using the administrator's email is attempt.

### Case 10: Anonymous Write Infiltration
* **Path**: `/listings/anonHouse`
* **Auth**: Anonymous user session
* **Payload**: `{ "address": "123 Anon Way", "price": 250000, "beds": 3, "baths": 2, "sqft": 1200, "neighborhood": "Westside", "buildYear": 1980, "propertyType": "Single Family", "status": "Active", "createdAt": "request.time" }`
* **Attack Vector**: Writing data without proper verified credentials.

### Case 11: Market Trend Theft/Override
* **Path**: `/marketTrends/trend1`
* **Auth**: Logged in as `attackerID`
* **Payload**: `{ "neighborhood": "Downtown", "averagePricePerSqft": 2000, "growthRate": 0.5, "monthlyHistory": "[]" }`
* **Attack Vector**: Regular client writes to the global market trend database.

### Case 12: Blanket Reading Non-Owned Private Notifications
* **Path**: `/users/victimUser/notifications/notif1`
* **Auth**: Logged in as `attackerID`
* **Operation**: Read (get)
* **Attack Vector**: Tries to read private notifications of other users.

---

## 3. Test Runner
We will run and implement these checks in a standard mock system or via Client Firestore Rules directly.

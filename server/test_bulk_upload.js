import mongoose from "mongoose";
import dotenv from "dotenv";
import * as XLSX from "xlsx";
import jwt from "jsonwebtoken";

dotenv.config();

const API_BASE = "http://localhost:5000/api";

const runTests = async () => {
  console.log("==========================================================");
  console.log("   SHOPLOCAL BULK PRODUCT UPLOAD SYSTEM INTEGRATION TEST  ");
  console.log("==========================================================");

  await mongoose.connect(process.env.MONGO_URI);

  // Find approved sellers and shops
  const seller1 = await mongoose.connection.db
    .collection("sellers")
    .findOne({ email: "jenishvariyashop@gmail.com" });
  const seller2 = await mongoose.connection.db
    .collection("sellers")
    .findOne({ email: "sodashop@gmail.com" });

  const shop1 = await mongoose.connection.db
    .collection("shops")
    .findOne({ seller: seller1._id });
  const shop2 = await mongoose.connection.db
    .collection("shops")
    .findOne({ seller: seller2._id });

  const token1 = jwt.sign(
    { id: seller1._id.toString(), type: "seller" },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  const token2 = jwt.sign(
    { id: seller2._id.toString(), type: "seller" },
    process.env.JWT_SECRET,
    { expiresIn: "1d" },
  );

  console.log(`Seller 1: ${seller1.ownerName} (${shop1.name})`);
  console.log(`Seller 2: ${seller2.ownerName} (${shop2.name})`);

  let passed = 0;
  let failed = 0;

  const assert = (condition, name, details = "") => {
    if (condition) {
      console.log(`  ✓ PASS: ${name}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${name} - ${details}`);
      failed++;
    }
  };

  // -------------------------------------------------------------------------
  // TEST 1: Select Biscuits and download correct spreadsheet
  // -------------------------------------------------------------------------
  console.log("\n[Test 1] Downloading Category Template for Biscuits & Cookies...");
  const t1Res = await fetch(
    `${API_BASE}/products/bulk/template?categoryId=biscuits-cookies&format=xlsx`,
  );
  assert(t1Res.status === 200, "Template download returns HTTP 200");
  const t1Buffer = Buffer.from(await t1Res.arrayBuffer());
  const t1Workbook = XLSX.read(t1Buffer, { type: "buffer" });
  assert(
    t1Workbook.SheetNames.includes("Products") &&
      t1Workbook.SheetNames.includes("Instructions"),
    "Template contains 'Products' and 'Instructions' sheets",
  );
  const t1Rows = XLSX.utils.sheet_to_json(t1Workbook.Sheets["Products"]);
  assert(
    t1Rows.length >= 10 &&
      t1Rows.every((r) => r["Category ID (Do Not Change)"] === "biscuits-cookies"),
    "All rows belong strictly to biscuits-cookies category",
  );

  // -------------------------------------------------------------------------
  // TEST 2 & 3: Select some products (mark YES), mark others NO, and upload
  // -------------------------------------------------------------------------
  console.log("\n[Test 2 & 3] Editing spreadsheet with selective YES items...");
  // Mark 3 products YES, others NO
  const editedT1Rows = t1Rows.map((row, idx) => {
    if (idx === 0 || idx === 1 || idx === 2) {
      return {
        ...row,
        "Add to My Shop (YES/NO)": "YES",
        "My Selling Price (₹)": 42.5,
        "Stock Quantity": 25,
        "Available (YES/NO)": "YES",
      };
    }
    return {
      ...row,
      "Add to My Shop (YES/NO)": "NO",
      "My Selling Price (₹)": 0,
      "Stock Quantity": 0,
      "Available (YES/NO)": "NO",
    };
  });

  const editedWb = XLSX.utils.book_new();
  const editedSheet = XLSX.utils.json_to_sheet(editedT1Rows);
  XLSX.utils.book_append_sheet(editedWb, editedSheet, "Products");
  const editedBuffer = XLSX.write(editedWb, { type: "buffer", bookType: "xlsx" });

  const form3 = new FormData();
  form3.append(
    "file",
    new Blob([editedBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    "edited_biscuits.xlsx",
  );
  form3.append("categoryId", "biscuits-cookies");

  const t3Res = await fetch(`${API_BASE}/products/bulk/validate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token1}` },
    body: form3,
  });
  const t3Data = await t3Res.json();
  assert(t3Res.status === 200 && t3Data.success, "Validate endpoint returns HTTP 200");
  assert(
    t3Data.validProducts?.length === 3,
    "Only YES rows (exactly 3) are included in validProducts",
    `Got ${t3Data.validProducts?.length}`,
  );
  assert(
    t3Data.validProducts[0].sellingPrice === 42.5 &&
      t3Data.validProducts[0].stockQuantity === 25,
    "Correct custom selling price (42.5) and stock (25) parsed",
  );

  // -------------------------------------------------------------------------
  // TEST 4 & 5: Save products to shop inventory and verify in DB
  // -------------------------------------------------------------------------
  console.log("\n[Test 4 & 5] Modifying preview values and committing bulk import...");
  const modifiedPreview = t3Data.validProducts.map((p, idx) => ({
    ...p,
    sellingPrice: idx === 0 ? 49.0 : p.sellingPrice,
    stockQuantity: idx === 0 ? 30 : p.stockQuantity,
  }));

  const t5Res = await fetch(`${API_BASE}/products/bulk/confirm-import`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token1}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      products: modifiedPreview,
      duplicateStrategy: "update",
      categoryId: "biscuits-cookies",
    }),
  });
  const t5Data = await t5Res.json();
  assert(t5Res.status === 200 && t5Data.success, "Confirm import returns HTTP 200");

  const shop1Products = await mongoose.connection.db
    .collection("products")
    .find({ shop: shop1._id, catalogId: { $in: modifiedPreview.map((p) => p.catalogId) } })
    .toArray();
  assert(
    shop1Products.length === 3,
    "All 3 imported products exist in Shop 1 inventory",
  );
  const firstProdInDb = shop1Products.find(
    (p) => p.catalogId === modifiedPreview[0].catalogId,
  );
  assert(
    firstProdInDb?.price === 49.0 && firstProdInDb?.stock === 30,
    "Updated preview price (49) and stock (30) correctly saved in DB",
  );

  // -------------------------------------------------------------------------
  // TEST 6: Category Safety Rule - Upload Snacks sheet for Biscuits
  // -------------------------------------------------------------------------
  console.log("\n[Test 6] Category Safety Rule: Uploading Snacks sheet for Biscuits...");
  const snacksRes = await fetch(
    `${API_BASE}/products/bulk/template?categoryId=snacks-namkeen&format=xlsx`,
  );
  const snacksBuffer = Buffer.from(await snacksRes.arrayBuffer());
  const snacksWb = XLSX.read(snacksBuffer, { type: "buffer" });
  const snacksRows = XLSX.utils.sheet_to_json(snacksWb.Sheets["Products"]);
  const editedSnacksRows = snacksRows.map((r, i) => ({
    ...r,
    "Add to My Shop (YES/NO)": i === 0 ? "YES" : "NO",
  }));
  const editedSnacksWb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    editedSnacksWb,
    XLSX.utils.json_to_sheet(editedSnacksRows),
    "Products",
  );
  const editedSnacksBuf = XLSX.write(editedSnacksWb, {
    type: "buffer",
    bookType: "xlsx",
  });

  const form6 = new FormData();
  form6.append(
    "file",
    new Blob([editedSnacksBuf], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    "snacks_sheet.xlsx",
  );
  form6.append("categoryId", "biscuits-cookies"); // Mismatched category!

  const t6Res = await fetch(`${API_BASE}/products/bulk/validate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token1}` },
    body: form6,
  });
  const t6Data = await t6Res.json();
  assert(
    t6Res.status === 400 && t6Data.categoryMismatch === true,
    "Mismatched category rejected with HTTP 400 and categoryMismatch: true",
  );
  assert(
    t6Data.message.includes("Category Mismatch Error"),
    "Clear category mismatch error message returned",
  );

  // -------------------------------------------------------------------------
  // TEST 7: Tampered category name - Database is authoritative
  // -------------------------------------------------------------------------
  console.log("\n[Test 7] Tampering Category Name header to 'Biscuits & Cookies' with Snacks product IDs...");
  const tamperedRows = editedSnacksRows.map((r) => ({
    ...r,
    "Category Name": "Biscuits & Cookies",
    "Category ID (Do Not Change)": "biscuits-cookies",
  }));
  const tamperedWb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(
    tamperedWb,
    XLSX.utils.json_to_sheet(tamperedRows),
    "Products",
  );
  const tamperedBuf = XLSX.write(tamperedWb, { type: "buffer", bookType: "xlsx" });

  const form7 = new FormData();
  form7.append(
    "file",
    new Blob([tamperedBuf], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    "tampered.xlsx",
  );
  form7.append("categoryId", "biscuits-cookies");

  const t7Res = await fetch(`${API_BASE}/products/bulk/validate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token1}` },
    body: form7,
  });
  const t7Data = await t7Res.json();
  assert(
    t7Res.status === 400 && t7Data.categoryMismatch === true,
    "Database authoritative check detects real product category despite fake column value",
  );

  // -------------------------------------------------------------------------
  // TEST 8: Upload duplicate product rows in spreadsheet
  // -------------------------------------------------------------------------
  console.log("\n[Test 8] Uploading duplicate product rows within spreadsheet...");
  const dupRows = [
    {
      "Product ID (Do Not Change)": "CAT-BIS-001",
      "Category ID (Do Not Change)": "biscuits-cookies",
      "Product Name": "Parle-G",
      "Add to My Shop (YES/NO)": "YES",
      "My Selling Price (₹)": 80,
      "Stock Quantity": 10,
    },
    {
      "Product ID (Do Not Change)": "CAT-BIS-001", // Duplicate!
      "Category ID (Do Not Change)": "biscuits-cookies",
      "Product Name": "Parle-G Duplicate",
      "Add to My Shop (YES/NO)": "YES",
      "My Selling Price (₹)": 80,
      "Stock Quantity": 10,
    },
  ];
  const dupWb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(dupWb, XLSX.utils.json_to_sheet(dupRows), "Products");
  const dupBuf = XLSX.write(dupWb, { type: "buffer", bookType: "xlsx" });

  const form8 = new FormData();
  form8.append("file", new Blob([dupBuf]), "duplicate.xlsx");
  form8.append("categoryId", "biscuits-cookies");

  const t8Res = await fetch(`${API_BASE}/products/bulk/validate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token1}` },
    body: form8,
  });
  const t8Data = await t8Res.json();
  assert(
    t8Data.invalidRows?.some((r) => r.reason.includes("Duplicate row")),
    "Duplicate row flagged in invalidRows",
  );

  // -------------------------------------------------------------------------
  // TEST 9: Product already present in shop inventory
  // -------------------------------------------------------------------------
  console.log("\n[Test 9] Uploading product already present in shop inventory...");
  // CAT-BIS-001 is already in shop1 from Test 5
  const form9 = new FormData();
  form9.append("file", new Blob([editedBuffer]), "existing_check.xlsx");
  form9.append("categoryId", "biscuits-cookies");

  const t9Res = await fetch(`${API_BASE}/products/bulk/validate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token1}` },
    body: form9,
  });
  const t9Data = await t9Res.json();
  assert(
    t9Data.summary?.existingInShopCount >= 1 &&
      t9Data.validProducts.some((p) => p.isExistingInShop === true),
    "Existing inventory item flagged with isExistingInShop: true and existing price",
  );

  // -------------------------------------------------------------------------
  // TEST 10: Invalid prices, negative quantities, missing fields, malformed files
  // -------------------------------------------------------------------------
  console.log("\n[Test 10] Validating negative price, negative stock & malformed file...");
  const invalidRows = [
    {
      "Product ID (Do Not Change)": "CAT-BIS-002",
      "Category ID (Do Not Change)": "biscuits-cookies",
      "Product Name": "Parle-G 130g",
      "Add to My Shop (YES/NO)": "YES",
      "My Selling Price (₹)": -5, // Invalid negative price
      "Stock Quantity": -10, // Invalid negative stock
    },
  ];
  const invWb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(invWb, XLSX.utils.json_to_sheet(invalidRows), "Products");
  const invBuf = XLSX.write(invWb, { type: "buffer", bookType: "xlsx" });

  const form10 = new FormData();
  form10.append("file", new Blob([invBuf]), "invalid.xlsx");
  form10.append("categoryId", "biscuits-cookies");

  const t10Res = await fetch(`${API_BASE}/products/bulk/validate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token1}` },
    body: form10,
  });
  const t10Data = await t10Res.json();
  assert(
    t10Data.invalidRows?.length > 0 &&
      t10Data.invalidRows[0].reason.includes("greater than 0"),
    "Negative price rejected with clear row validation reason",
  );

  // Test malformed file
  const form10b = new FormData();
  form10b.append("file", new Blob([Buffer.from("random corrupted bytes")]), "bad.xlsx");
  form10b.append("categoryId", "biscuits-cookies");
  const t10bRes = await fetch(`${API_BASE}/products/bulk/validate`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token1}` },
    body: form10b,
  });
  assert(t10bRes.status === 400, "Corrupted file rejected with HTTP 400");

  // -------------------------------------------------------------------------
  // TEST 11: Supplier spreadsheet with different column names & auto-matching
  // -------------------------------------------------------------------------
  console.log("\n[Test 11] Supplier spreadsheet import & column mapping...");
  const supplierRows = [
    {
      "Particulars / Item Name": "Maggi 2-Minute Masala Instant Noodles",
      "Company": "Nestle",
      "Barcode / EAN": "8901058857211",
      "Rate": 54,
      "Closing Qty": 40,
    },
    {
      "Particulars / Item Name": "Local Special Namkeen Sev",
      "Company": "Desi Farsan",
      "Barcode / EAN": "",
      "Rate": 80,
      "Closing Qty": 15,
    },
  ];
  const supWb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(supWb, XLSX.utils.json_to_sheet(supplierRows), "Sheet1");
  const supBuf = XLSX.write(supWb, { type: "buffer", bookType: "xlsx" });

  const form11 = new FormData();
  form11.append("file", new Blob([supBuf]), "supplier_invoice.xlsx");

  const t11ParseRes = await fetch(`${API_BASE}/products/bulk/supplier-parse`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token1}` },
    body: form11,
  });
  const t11ParseData = await t11ParseRes.json();
  assert(
    t11ParseRes.status === 200 && t11ParseData.totalRows === 2,
    "Supplier spreadsheet parsed with headers and rows detected",
  );

  const t11MatchRes = await fetch(`${API_BASE}/products/bulk/supplier-match`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token1}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      rows: t11ParseData.allRows,
      mapping: {
        nameCol: "Particulars / Item Name",
        brandCol: "Company",
        barcodeCol: "Barcode / EAN",
        priceCol: "Rate",
        stockCol: "Closing Qty",
      },
    }),
  });
  const t11MatchData = await t11MatchRes.json();
  assert(
    t11MatchData.matchedProducts?.length === 1 &&
      t11MatchData.matchedProducts[0].productId === "CAT-NOO-001",
    "Maggi matched to catalog via barcode/name with verified image URL",
  );
  assert(
    t11MatchData.unmatchedProducts?.length === 1,
    "Unmatched local namkeen safely flagged as local custom product",
  );

  // -------------------------------------------------------------------------
  // TEST 12: Add a local product not found in the catalog
  // -------------------------------------------------------------------------
  console.log("\n[Test 12] Adding local / artisanal product not in catalog...");
  const t12Res = await fetch(`${API_BASE}/products/bulk/custom-product`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token1}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: "Fresh Neighborhood Nankhatai",
      brand: "City Bakery",
      category: "Bread & Bakery",
      packSize: "400g Box",
      price: 95,
      stock: 20,
      description: "Artisanal cardamom butter shortbread.",
    }),
  });
  const t12Data = await t12Res.json();
  assert(
    t12Res.status === 201 &&
      t12Data.product.isCustom === true &&
      t12Data.product.catalogId === null,
    "Local product added with isCustom: true and no fabricated catalog ID",
  );

  // -------------------------------------------------------------------------
  // TEST 13: Catalog images match correct product variants
  // -------------------------------------------------------------------------
  console.log("\n[Test 13] Verifying verified image URLs for catalog products...");
  const masterBiscuits = await mongoose.connection.db
    .collection("masterproducts")
    .find({ categoryId: "biscuits-cookies" })
    .toArray();
  assert(
    masterBiscuits.length >= 10 &&
      masterBiscuits.every((p) => typeof p.imageUrl === "string" && p.imageUrl.startsWith("http")),
    "Every master catalog product has a valid, non-placeholder image reference",
  );

  // -------------------------------------------------------------------------
  // TEST 14: Shop isolation - Shop 1 changes do not affect Shop 2
  // -------------------------------------------------------------------------
  console.log("\n[Test 14] Shop isolation verification...");
  const shop2Biscuits = await mongoose.connection.db
    .collection("products")
    .find({ shop: shop2._id, category: "Biscuits & Cookies" })
    .toArray();
  assert(
    shop2Biscuits.length === 0,
    "Shop 2 has 0 biscuit products (Shop 1 imports did not leak into Shop 2)",
  );

  // -------------------------------------------------------------------------
  // TEST 15: Existing manual product upload and listing still work
  // -------------------------------------------------------------------------
  console.log("\n[Test 15] Verifying existing manual product creation & listing...");
  const form15 = new FormData();
  form15.append("name", "Manual Test Product");
  form15.append("category", "Grocery");
  form15.append("price", "99");
  form15.append("stock", "5");

  const t15Res = await fetch(`${API_BASE}/products`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token1}` },
    body: form15,
  });
  const t15Data = await t15Res.json();
  assert(
    t15Res.status === 201 && t15Data.product?.name === "Manual Test Product",
    "Existing manual product creation (POST /api/products) works seamlessly",
  );

  const t15ListRes = await fetch(`${API_BASE}/products/seller`, {
    headers: { Authorization: `Bearer ${token1}` },
  });
  const t15ListData = await t15ListRes.json();
  assert(
    t15ListRes.status === 200 && t15ListData.products?.length >= 4,
    "Existing seller product listing (GET /api/products/seller) displays all items",
  );

  await mongoose.disconnect();

  console.log("\n==========================================================");
  console.log(`   TOTAL TESTS: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  console.log("==========================================================");

  if (failed > 0) {
    process.exit(1);
  }
};

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});

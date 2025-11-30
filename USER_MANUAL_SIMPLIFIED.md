# HARDWARE TECH - USER MANUAL

**Point of Sale and Inventory Management System**  
**Version 2.0**

---

## Table of Contents

1. **Introduction**
2. **Getting Started**
3. **Customer Guide**
4. **Cashier Guide**
5. **Admin Guide**
6. **FAQs**
7. **Troubleshooting**

---

## 1. Introduction

Hardware Tech is a web-based system for managing hardware store operations. It helps you:
- Track inventory and products
- Process sales and reservations
- View business analytics
- Manage customers and staff

### Who Uses This System?

**Customers**: Browse products, make reservations, track orders

**Cashiers**: Process sales, manage reservations, handle returns

**Admins**: Full access to inventory, analytics, users, and settings

---

## 2. Getting Started

### Sign Up

1. Click "Sign Up" in the top right
2. Enter your name, email, and password
3. Password must have: 8+ characters, uppercase, lowercase, number, special character
4. Check your email and click the verification link
5. **Or** sign up with Google (automatic verification)

### Log In

1. Click "Login" in the top right
2. Enter email and password
3. **Or** click "Sign in with Google"
4. You'll be redirected based on your role:
   - Admin → Dashboard
   - Cashier → POS page
   - Customer → Home page

### Forgot Password?

1. Click "Forgot Password?" on login page
2. Enter your email
3. Check email for reset link
4. Create new password

### Requirements

**Device**: Any computer, tablet, or phone with internet

**Browser**: Chrome, Firefox, Edge, Safari, or Opera (latest versions)

**Settings**: Enable JavaScript and cookies

---

## 3. Customer Guide

### Browse Products

1. Click "Products" in navigation
2. Use search bar to find products
3. Use category filter (left side) to narrow results
4. Click a product to see details and variants

### Add to Cart & Make Reservation

1. Click product → Select variant (if available)
2. Click "Add to Cart"
3. Adjust quantity in popup → Confirm
4. **Note**: You'll return to product list automatically
5. Click cart icon to view items
6. Review items → Add notes (optional)
7. Click "Reserve Items" → Confirm

**Cart Features**:
- Automatically updates when prices/stock change
- Mobile: Opens as centered popup
- Desktop: Slides in from right
- Removes items if product deleted

### View Reservations

1. Click "Reservations" in navigation
2. See all your reservations with status:
   - **Pending**: Waiting for store confirmation
   - **Confirmed**: Ready for pickup
   - **Completed**: Picked up
   - **Cancelled**: Cancelled
3. Click reservation to see details
4. Click "Cancel Reservation" to cancel (no alert shown)

### Update Profile

1. Click your profile icon (top right)
2. Select "Profile"
3. Click "Change Name" or "Change Password"
4. Follow prompts to update

---

## 4. Cashier Guide

### Process Reservations

1. Click "Reservations" in sidebar
2. See status cards: Pending, Confirmed, Completed, Cancelled
3. Click status card to filter
4. Use search bar to find specific reservations
5. Click reservation to see details
6. **To Complete**:
   - Click "Complete" button
   - Enter amount paid
   - System calculates change
   - Click "Process Payment"
   - Redirected to Sales page

### Use POS System

1. Click "POS" in sidebar (auto-redirects after login)
2. Search products or browse by category
3. Click product → Select variant → "Add to Cart"
4. **Note**: Stays on POS page after adding items
5. Click cart icon to manage items
6. Adjust quantities or remove items
7. Enter amount paid → Click "Process Sale"
8. Receipt generated automatically

### View Sales History

1. Click "Sales" in sidebar
2. See today's sales stats
3. Use filters:
   - Search: Sale ID, cashier, product name
   - Type: POS or Reservation
   - Status: Paid, Partial
   - Date range: Date From/To
4. Click sale to see details
5. Click "Export Sales" to download CSV
6. Click "Return" to return a sale

---

## 5. Admin Guide

### Dashboard Overview

**Sales Trends**: Line chart showing daily/monthly/yearly sales

**Supply vs Sales Analysis**: Compare costs vs revenue
- Filter: By Month, By Year, or Overall
- Shows: Supply Cost, Sales, Profit, Profit Margin

**Fast-Moving Products**: Top 5 most restocked items

**Product Sales Movement**: Top 5 best-selling products

**Stock Cards**: Low stock alerts, out of stock count, total products, total value

**Recent Supply History**: Latest inventory additions

### Manage Products

1. Click "Inventory" or "Products" in sidebar
2. Click "Add Product"
3. Enter: Name (required), Description, Category, Price, Image
4. Click "Save"
5. **Edit**: Click product → "Edit" → Update → "Save"
6. **Delete**: Click "Delete" → Confirm
   - **Note**: Product names in sales stay visible even after deletion

### Manage Variants

**Add Variant**:
1. Click product → "Add Variant"
2. Fill in:
   - **Size/Type** (left side, optional): e.g., "12", "Small"
   - **Unit** (right side, required): Select from dropdown
   - Dimension, Color (optional)
   - Supplier Price, Price, Quantity
3. **Conversion** (optional):
   - Check "Allow conversion from another variant"
   - Select source variant
   - Set conversion quantity
4. Click "Add Variant"
   - **Note**: Form clears automatically when opened

**Edit/Restock/Delete**: Use buttons on variant card

**Important**: 
- Deleting variant with conversions sets dependent variants to 0
- Variant names in sales are preserved

### Manage Reservations

1. Click "Reservations" in sidebar
2. Filter by status or search
3. Click reservation to see details
4. Update status: Pending → Confirmed → Completed
5. Click "Update Details" to modify items/prices
6. Click "Complete" to convert to sale

### Manage Supply History

1. Click "Supply History" in sidebar
2. See analytics cards:
   - Last 7 Days Spending
   - Total Stock
   - Total Money Spent
   - Lost Money (Total & Last 7 Days)
3. View entries with product names (preserved even if deleted)
4. **Pull Out Stock**:
   - Click "Pull Out" on entry
   - Enter quantity (max shown)
   - Confirm
5. Filter by date range or search

### Manage Users & Settings

1. Click "Settings" in sidebar

**User Management**:
- Click "Edit User"
- Assign roles: User, Cashier, Admin (can have multiple)
- Activate/deactivate users
- Delete accounts

**Category Management**:
- Click "Edit Categories"
- Add, edit, or delete categories
- Can't delete if products use it

**Data Management** (⚠️ Permanent):
- Delete Products Data
- Delete Reservations Data
- Delete Sales Data
- Delete Supply History

### View Sales Reports

1. Click "Sales" in sidebar
2. Use filters (search, type, status, date, cashier)
3. Click "Export Sales" for CSV download
4. Click sale to see details and receipt
5. Click "Return" to return items to inventory

---

## 6. Frequently Asked Questions

**Q1: How do I reset my password?**  
A: Click "Forgot Password?" on login page → Enter email → Check email → Click link → New password

**Q2: Why can't I make a reservation?**  
A: Verify your email first. Check email for verification link or click "Resend Verification Email"

**Q3: What happens if I delete a product with sales?**  
A: Product name in sales records stays visible (not "Unknown"). Historical data is preserved.

**Q4: What happens to supply history when I delete a product?**  
A: Supply history stays. Product names remain visible. Money spent calculations stay accurate.

**Q5: What is variant conversion?**  
A: One variant automatically converts from another. Example: "10 pieces" converts from "1 piece" (1 = 10). When source stock decreases, converted stock increases.

**Q6: What if I delete a variant that others convert from?**  
A: Dependent variants' quantities become 0 to prevent errors.

**Q7: How does cart auto-update work?**  
A: Cart syncs when products change. If item deleted, removed from cart. If stock low, quantity adjusts.

**Q8: Can I export sales data?**  
A: Yes. Admins/cashiers: Apply filters → Click "Export Sales" → CSV downloads

**Q9: Supply vs Sales Analysis filters?**  
A: 
- **By Month**: Shows weeks in selected month (4+ days in month)
- **By Year**: Shows all months in selected year
- **Overall**: Shows totals by year

**Q10: Why no success message when cancelling reservation?**  
A: By design for cleaner experience. Cancellation still works.

**Q11: How to pull out stock from supply?**  
A: Click "Pull Out" on supply entry → Enter quantity (max shown) → Confirm

**Q12: POS vs Reservation sales?**  
A: **POS** = Direct sale. **Reservation** = Sale from completed reservation.

**Q13: Sales trends periods?**  
A: **Daily** (last 14 days), **Monthly** (current year), **Yearly** (all years)

**Q14: Mobile cart?**  
A: Opens as centered popup on mobile. Slides from right on desktop.

**Q15: After adding to cart in POS?**  
A: Stays on POS page to continue selecting products.

**Q16: Filter products by category?**  
A: Use category filter (left side on desktop, top on mobile). Click category name.

**Q17: Dashboard shows?**  
A: Sales trends, supply vs sales analysis, fast-moving products, sales movement, stock status, recent supply history.

**Q18: View product variants?**  
A: Click product card → See all variants with size, unit, color, stock, price, conversion info.

**Q19: What is "Low Stock"?**  
A: Products with quantity less than 20. Shown on dashboard and product cards.

**Q20: Out of stock items?**  
A: Dashboard shows count. Inventory page marks them. Customers can't add to cart.

**Q21: Search works how?**  
A: 
- Products: Search by name/description
- Reservations: Search by customer, email, ID, product, date
- Sales: Search by ID, cashier, product
- Supply: Search by product name (works for deleted products)

**Q22: Size/Type vs Unit?**  
A: **Size/Type** (left, optional): "12", "Small". **Unit** (right, required): "ft", "kg", "pcs". Together: "12 ft"

**Q23: Add notes to reservation/sale?**  
A: Add notes in cart before processing. Saved with reservation/sale.

**Q24: Complete reservation?**  
A: Status → Completed, sale created, inventory reduced, payment recorded, redirected to Sales page.

**Q25: Update reservation?**  
A: Admins/cashiers: Click reservation → "Update Details" → Modify → Save. Customers can only cancel.

**Q26: Return a sale?**  
A: Sales page → Find sale → "Return" → Confirm → Items back to inventory, sale marked "Returned"

**Q27: Sales export includes?**  
A: Sale ID, date, cashier, type, status, items (names preserved), quantities, prices, totals, payment info.

**Q28: Restock variant?**  
A: Products page → Find variant → "Restock" → Enter quantity, supplier price, notes → "Restock"

**Q29: Pull-out purpose?**  
A: Track stock removal (damaged items, adjustments). Reduces available quantity, keeps history record.

**Q30: Filter sales by date?**  
A: Sales page → Set "Date From" and "Date To" → List filters automatically

**Q31: User roles?**  
A: **User/Customer**: Browse, reserve. **Cashier**: Process sales, reservations. **Admin**: Full access. Can have multiple roles.

**Q32: Assign roles?**  
A: Admins only: Settings → User Management → Find user → "Edit" → Select roles → Save

**Q33: Delete category?**  
A: Only if no products use it. Reassign products first or delete products.

**Q34: Upload product image?**  
A: Yes. When creating/editing product, upload image. Shows on product cards and detail pages.

**Q35: Supply vs Sales Analysis benefits?**  
A: See supply costs, sales revenue, profit, profit margin, best periods. Helps plan inventory and pricing.

**Q36: Fast-moving products?**  
A: Items restocked most frequently. Top 5 shown on dashboard. Helps identify popular items.

**Q37: Filter Supply vs Sales by month?**  
A: Dashboard → "Supply vs Sales Analysis" → Select "By Month" → Select year → Select month → See weeks in that month

**Q38: Sales trends difference?**  
A: **Daily** = 14 days (one day per point). **Monthly** = Current year (one month per point). **Yearly** = All years (one year per point).

**Q39: Account verified?**  
A: Admins/cashiers: Auto-verified. Customers: Check email for link or click "Resend Verification Email"

**Q40: Use on mobile?**  
A: Yes. Fully responsive. Menu becomes hamburger, cards stack, cart opens as popup, all features work.

**Q41: Add more than stock available?**  
A: System prevents it. Shows max available. Button disabled if insufficient. Cart auto-adjusts if stock decreases.

**Q42: See best-selling products?**  
A: Dashboard → "Product Sales Movement" chart → Filter by year/month/category → See top 5 → Click bars for details

**Q43: Delete product with supply history?**  
A: Supply history preserved. Product names visible. Variant details preserved. Money calculations accurate.

**Q44: Cancel own reservation?**  
A: Reservations page → Find reservation → Click → "Cancel Reservation" → Confirm → Stock released, status "Cancelled"

**Q45: Variant conversion notes?**  
A: Optional notes explaining conversion rules. Visible when viewing variant details.

**Q46: Know if variant auto-converts?**  
A: View variant details → See "Converts from" indicator, source variant, conversion quantity, notes.

**Q47: Delete variant that was sold?**  
A: Sales records preserved. Product names visible. Variant details visible. All data intact.

**Q48: Filter reservations by status?**  
A: Reservations page → Click status card (Pending, Confirmed, Completed, Cancelled) → List filters

**Q49: Amount Paid vs Change?**  
A: **Amount Paid** = Customer gave you. **Change** = Difference (auto-calculated). Negative = partial payment.

**Q50: View receipt?**  
A: Sales page → Find sale → Click to expand → "View Receipt" or "Print Receipt" → Printable receipt

**Q51: Real-time updates?**  
A: Uses WebSocket. Product changes, cart sync, reservation updates happen automatically. No refresh needed.

**Q52: WebSocket error?**  
A: Usually temporary. System auto-reconnects. Refresh if persists. Core features work without it.

**Q53: Delete account?**  
A: Profile page → "Delete Account" → Confirm → **Warning**: Permanent, deletes account and reservations

**Q54: "Include 'per' text" option?**  
A: Affects display: Checked = "1 per 30 m", Unchecked = "1 30 m". Clarifies conversion relationship.

**Q55: Weeks in monthly view?**  
A: Shows weeks with 4+ days in selected month. Each week shows date range and ISO week number.

**Q56: Profit margins by period?**  
A: Supply vs Sales Analysis → Select filter → Summary cards show: Total Profit, Profit Margin %, Average Profit

**Q57: Process sale with insufficient stock?**  
A: System prevents it. Cart auto-adjusts. Warnings shown. Items with zero stock removed. Check stock first.

**Q58: Total inventory value?**  
A: Dashboard → "Total Stock Value" card → Shows total monetary value of all inventory

**Q59: Create new product needs?**  
A: **Required**: Name, Category, Unit (for first variant). **Optional**: Description, Image, Variant details, Prices

---

## 7. Troubleshooting

**Can't log in after password reset?**  
→ Use new password, check caps lock, clear browser cache, try reset again

**No verification email?**  
→ Check spam folder, verify email address, click "Resend", wait a few minutes

**Products not showing in search?**  
→ Clear filters, check category filter (set to "All"), verify spelling, refresh page

**Cart not updating?**  
→ Refresh page, check internet, clear cache, close/reopen cart

**Can't add to cart?**  
→ Check stock, verify logged in, select variant (if needed), refresh, try different browser

**Dashboard charts not loading?**  
→ Check internet, refresh, clear cache, check console for errors, try different browser

**Can't export sales?**  
→ Verify admin/cashier role, check filters aren't too restrictive, allow downloads, try different browser

**Variant conversion not working?**  
→ Verify source has stock, check conversion quantity, ensure "Allow conversion" checked, verify source selected

**Real-time updates not working?**  
→ Check internet, verify WebSocket connection, refresh, check firewall, try different network

---

## Quick Reference

### Password Requirements
- 8+ characters
- Uppercase letter
- Lowercase letter
- Number
- Special character

### Reservation Statuses
- **Pending**: Waiting for confirmation
- **Confirmed**: Ready for pickup
- **Completed**: Picked up (converted to sale)
- **Cancelled**: Cancelled

### Sale Statuses
- **Paid**: Full payment
- **Partial**: Partial payment
- **Returned**: Returned to inventory

### Sale Types
- **POS**: Direct sale
- **Reservation**: From completed reservation

### Supported Units
pcs, kg, g, lb, m, cm, ft, set, W, V, amphere, gang, box, pack, roll, Wey

---

## Important Notes

✅ **Data Preservation**: Product names in sales and supply history are preserved even after deletion

✅ **Historical Records**: Sales and supply records never deleted, always visible

✅ **Financial Accuracy**: Money spent calculations unaffected by product/variant deletion

✅ **Variant Conversion**: Deleting source variant sets dependent variants to 0

✅ **Cart Sync**: Automatically updates when products change

✅ **Mobile Friendly**: All features work on mobile devices

⚠️ **Permanent Deletion**: Product/variant deletion cannot be undone

⚠️ **Data Export**: CSV format, compatible with Excel

---

**End of Manual**

*For support, contact your system administrator.*


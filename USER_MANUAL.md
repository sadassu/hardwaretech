# Hardware Tech - User Manual

## Table of Contents
1. [Introduction](#introduction)
2. [Getting Started](#getting-started)
3. [User Roles](#user-roles)
4. [Dashboard](#dashboard)
5. [Product Management](#product-management)
6. [Inventory Management](#inventory-management)
7. [Sales & Point of Sale (POS)](#sales--point-of-sale-pos)
8. [Reservations](#reservations)
9. [Supply History](#supply-history)
10. [Notifications](#notifications)
11. [User Profile](#user-profile)
12. [Adding System Screenshots](#adding-system-screenshots)

---

## Introduction

Hardware Tech is a comprehensive inventory and sales management system designed for hardware stores. The system helps manage products, track inventory, process sales, handle customer reservations, and monitor business performance.

---

## Getting Started

### Login
1. Navigate to the login page
2. Enter your email and password
3. Click "Login"
4. If you don't have an account, click "Sign Up" to create one

### Navigation
- **Desktop**: Use the top navigation bar to access different sections
- **Mobile**: Tap the menu icon (☰) to access the navigation menu
- **Shopping Cart**: Click the cart icon in the navigation bar
- **Notifications**: Click the bell icon to view reservation updates

---

## User Roles

The system supports three user roles:

### 1. Admin
- Full access to all features
- Can manage products, variants, and inventory
- Can process sales and manage reservations
- Access to dashboard and analytics
- Can update reservation statuses and details

### 2. Cashier
- Can process sales through Point of Sale (POS)
- Can view products and inventory
- Can manage reservations (update status, edit details)
- Access to sales history

### 3. Regular User (Customer)
- Can browse products
- Can create reservations
- Can view their reservation history
- Receives notifications for reservation updates
- Can cancel their own reservations

---

## Dashboard

The dashboard provides an overview of your business performance.

### Key Metrics
- **Total Sales**: Overall sales revenue
- **Low Stock Items**: Products with quantity ≤ 50
- **Out of Stock Items**: Products with zero quantity
- **Recent Supply History**: Latest inventory additions

### Sales Trends
- View sales data by day, month, or year
- Period summary showing:
  - Highest sale
  - Lowest sale
  - Total sales
  - Average sales per period

### Supply vs Sales Analysis
- Compare supply and sales data
- Filter by:
  - **Week**: View weekly data
  - **Month**: View all weeks in the selected month
  - **Year**: View all months in the selected year
  - **Overall**: View total aggregated data

---

## Product Management

### Viewing Products
1. Navigate to "Products" from the menu
2. Browse products by category
3. Use the search bar to find specific products
4. Click on a product to view details and variants

### Adding Products (Admin Only)
1. Go to Products page
2. Click "Add Product" button
3. Fill in the form:
   - Product name
   - Category
   - Description
   - Upload product image
4. Click "Create Product"

### Updating Products (Admin Only)
1. Click the edit icon on a product
2. Modify the product details
3. Click "Update Product"

### Product Variants
Each product can have multiple variants with different:
- Size/Type
- Unit
- Color
- Price
- Quantity

#### Adding Variants (Admin Only)
1. Open a product
2. Click "Add Variant"
3. Fill in:
   - Size/Type (e.g., "12")
   - Unit (e.g., "ft")
   - Color (optional)
   - Price
   - Quantity
4. Click "Add Variant"

#### Updating Variants (Admin Only)
1. Click the edit icon on a variant
2. Modify the variant details
3. Click "Update Variant"

#### Variant Conversion
- Enable "Allow this variant to convert from another variant" to automatically convert stock
- Useful for products that transform (e.g., raw materials to finished products)

---

## Inventory Management

### Stock Status
- **Green**: Stock available (quantity > 50)
- **Yellow/Amber**: Low stock (quantity ≤ 50)
- **Red**: Out of stock (quantity = 0)

### Restocking (Admin Only)
1. Go to the variant you want to restock
2. Click "Restock"
3. Enter:
   - Quantity to add
   - Supplier price
   - Notes (optional)
4. Click "Add Stock"

### Pull Out Stock (Admin Only)
1. Go to Supply History
2. Find the supply record
3. Click "Pull Out"
4. Enter the quantity to pull out
5. Click "Confirm"

---

## Sales & Point of Sale (POS)

### Processing a Sale (Admin/Cashier)
1. Navigate to "Point of Sale" (POS)
2. Browse or search for products
3. Click "Add to Cart" on desired products
4. Review items in the cart
5. Click "Checkout"
6. Enter payment details:
   - Amount paid
   - Notes (optional)
7. Click "Complete Sale"
8. Print or view receipt

### Viewing Sales History
1. Navigate to "Sales" from the menu
2. View all completed sales
3. Filter by date range
4. Export sales data if needed

### Sales Receipt
- Contains:
  - Sale date and time
  - Items purchased
  - Quantities and prices
  - Subtotal and total
  - Payment information

---

## Reservations

### Creating a Reservation (Customers)
1. Browse products
2. Select desired products and variants
3. Click "Add to Cart"
4. Click the cart icon
5. Review items
6. Click "Create Reservation"
7. Add remarks (optional)
8. Confirm reservation

### Viewing Reservations

#### For Customers
1. Click "My Reservations" in the menu
2. View all your reservations
3. Filter by status (All, Pending, Confirmed, Cancelled, Completed)
4. Click on a reservation to view details
5. Cancel reservation if needed (pending reservations only)

#### For Admin/Cashier
1. Navigate to "Reservations" from the dashboard
2. View all customer reservations
3. Filter by status or search by customer
4. Update reservation status:
   - **Pending**: Awaiting confirmation
   - **Confirmed**: Approved and ready for pickup
   - **Cancelled**: Reservation cancelled
   - **Failed**: Reservation failed
   - **Completed**: Reservation fulfilled

### Updating Reservations (Admin/Cashier)
1. Click "Edit" on a reservation
2. Modify:
   - Product items and quantities
   - Remarks
3. Click "Update Reservation"
4. Customer will be notified of the update

### Completing Reservations (Admin/Cashier)
1. Click "Complete" on a confirmed reservation
2. System automatically:
   - Creates a sale record
   - Deducts inventory
   - Updates reservation status to "Completed"
3. Customer receives notification

---

## Supply History

### Viewing Supply History (Admin Only)
1. Navigate to "Supply History" from the menu
2. View all inventory additions
3. See:
   - Product and variant details
   - Quantity added
   - Supplier price
   - Total cost
   - Date supplied
   - Notes

### Money Spent Analysis
- **Last 7 Days**: Total money spent on supplies in the past week
- **Total**: Overall money spent on supplies
- Based on supplier prices

---

## Notifications

### Reservation Updates (Customers Only)
- Receive notifications when:
  - Reservation status changes (confirmed, cancelled, completed)
  - Reservation details are updated
  - Remarks are added to your reservation
- Click the bell icon to view notifications
- Notifications include:
  - Update message
  - Reservation details (products, quantities, prices)
  - Remarks (if any)
  - Total price
  - Date of update

### Viewing Notifications
1. Click the bell icon in the navigation bar
2. View all unread notifications
3. Click on a notification to go to reservations page
4. Notifications are automatically marked as read when opened

---

## User Profile

### Viewing Profile
1. Click your profile icon/avatar in the navigation bar
2. View your account information

### Updating Profile
1. Go to your profile page
2. Click "Edit Profile"
3. Update:
   - Name
   - Email
   - Avatar/Profile picture
4. Click "Update Profile"

---

## Adding System Screenshots

To add screenshots to this manual:

### Image Location
Place all system screenshots in the following directory:
```
frontend/public/assets/screenshots/
```

### Recommended Screenshot Locations
1. **Dashboard Overview**: `dashboard-overview.png`
2. **Product List**: `product-list.png`
3. **Product Details**: `product-details.png`
4. **POS Interface**: `pos-interface.png`
5. **Reservation List**: `reservation-list.png`
6. **Sales History**: `sales-history.png`
7. **Supply History**: `supply-history.png`
8. **Notifications**: `notifications.png`

### Adding Images to Manual
After placing images in the directory, reference them in this manual using:
```markdown
![Description](assets/screenshots/filename.png)
```

### Image Guidelines
- Use PNG format for screenshots
- Recommended size: 1920x1080 or smaller
- Ensure screenshots are clear and readable
- Crop unnecessary browser chrome if needed
- Name files descriptively (e.g., `dashboard-main-view.png`)

---

## Tips & Best Practices

### For Admins
- Regularly check low stock items
- Update inventory after receiving supplies
- Review sales trends to identify popular products
- Keep product information up to date
- Monitor supply costs for better pricing

### For Cashiers
- Verify product quantities before completing sales
- Add notes for special transactions
- Check reservation status before processing
- Review sales receipts for accuracy

### For Customers
- Check reservation status regularly
- Review notifications for updates
- Add remarks when creating reservations for special requests
- Cancel reservations early if plans change

---

## Troubleshooting

### Can't Login
- Verify email and password are correct
- Check if account exists
- Contact admin if account is locked

### Products Not Showing
- Check if you're logged in
- Verify product is not out of stock
- Try refreshing the page

### Reservation Not Updating
- Check internet connection
- Refresh the page
- Contact support if issue persists

### Notifications Not Appearing
- Ensure you're logged in as a customer
- Check if reservation was actually updated
- Refresh the page

---

## Support

For technical support or questions:
- Contact your system administrator
- Check the dashboard for system status
- Review this manual for common issues

---

**Last Updated**: November 2025
**Version**: 1.0


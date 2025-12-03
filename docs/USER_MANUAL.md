# ERMA System - Complete User Manual

**Equipment and Resource Management Application**  
_Version 1.0 | Last Updated: December 1, 2025_

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Getting Started](#2-getting-started)
3. [User Roles and Permissions](#3-user-roles-and-permissions)
4. [Registration and Login](#4-registration-and-login)
5. [Dashboard Overview](#5-dashboard-overview)
6. [Managing Equipment](#6-managing-equipment)
7. [Managing Facilities](#7-managing-facilities)
8. [Managing Supplies](#8-managing-supplies)
9. [Request Management](#9-request-management)
10. [My Requests](#10-my-requests)
11. [Monitoring Resources](#11-monitoring-resources)
12. [User Account Management](#12-user-account-management)
13. [Notifications](#13-notifications)
14. [Profile Settings](#14-profile-settings)
15. [Troubleshooting](#15-troubleshooting)
16. [FAQ](#16-faq)

---

## 1. Introduction

### What is ERMA?

ERMA (Equipment and Resource Management Application) is a comprehensive web-based platform designed to streamline the management of equipment, facilities, and supplies within an organization. The system provides efficient request handling, real-time monitoring, and administrative tools for resource management.

### Key Features

- **Equipment Management**: Browse, request, and track equipment borrowing
- **Facility Booking**: Reserve facilities for meetings, classes, and events
- **Supply Acquisition**: Request and manage office and laboratory supplies
- **Request Tracking**: Monitor the status of all your requests in real-time
- **Admin Dashboard**: Comprehensive analytics and request management
- **Role-Based Access**: Different permissions for Super Admin, Admin, Staff, and Faculty
- **Notification System**: Real-time updates on request status changes
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### System Requirements

- **Browser**: Latest version of Chrome, Firefox, Safari, or Edge (auto-updates recommended)
- **Internet Connection**: Stable broadband connection (minimum 5 Mbps recommended)
- **Screen Resolution**: Minimum 1024x768 (fully responsive for mobile, tablet, and desktop)
- **JavaScript**: Must be enabled in browser settings
- **Cookies**: Must be enabled for authentication
- **HTTPS**: Secure connection required (automatic)
- **Account**: Institutional email address required for registration

---

## 2. Getting Started

### Accessing the System

1. Open your web browser
2. Navigate to your organization's ERMA portal URL (e.g., `https://csu-erma.vercel.app`)
3. You will see the ERMA landing page with login and registration options

### First-Time Access

#### For New Users:

1. Navigate to your organization's ERMA portal
2. Click on "Register" button on the homepage
3. Fill out the registration form with your institutional details
4. Wait for admin approval (typically 1-2 business days)
5. Check your institutional email for approval notification
6. Once approved, log in with your credentials

#### For Existing Users:

1. Navigate to the ERMA portal
2. Click "Login"
3. Enter your registered email and password
4. You'll be redirected to your personalized dashboard

---

## 3. User Roles and Permissions

### Role Hierarchy

#### 1. **Super Admin** (Highest Privileges)

- **Who**: CCIS Dean, Lab Technician, Comlab Adviser
- **Can**:
  - Access all system features
  - Approve/reject all types of requests
  - Manage users, equipment, facilities, and supplies
  - View comprehensive analytics
  - Delete requests and resources
  - Access all monitoring dashboards

#### 2. **Admin**

- **Who**: Department Chairperson, Associate Dean
- **Can**:
  - Approve/reject requests within their department
  - View analytics and reports
  - Manage resources
  - Access monitoring features

#### 3. **Staff**

- **Who**: College Clerk, Student Assistant
- **Can**:
  - Process routine requests
  - Update resource availability
  - View assigned resources
  - Generate basic reports

#### 4. **Faculty**

- **Who**: Lecturer, Instructor
- **Can**:
  - Browse equipment, facilities, and supplies
  - Submit borrowing, booking, and acquiring requests
  - Track personal requests
  - Receive notifications

---

## 4. Registration and Login

### Registration Process

1. **Access Registration Page**

   - Click "Register" on the homepage
   - Or navigate to `/register`

2. **Fill Out the Form**

   - **Email**: Use your institutional email
   - **Password**: Create a strong password (min. 8 characters)
   - **First Name**: Your legal first name
   - **Last Name**: Your legal last name
   - **Department**: Select your department (BSIT, BSCS, BSIS)
   - **Role**: Select your position

3. **Submit Registration**

   - Click "Register" button
   - You'll see a confirmation message
   - Wait for admin approval

4. **Account Approval**
   - System administrators review your request within 1-2 business days
   - You'll receive an email notification when your account is approved
   - Login credentials will be activated automatically upon approval
   - If rejected, you'll receive an email with the reason and next steps

### Login Process

1. **Navigate to Login**

   - Click "Login" on homepage
   - Or go to `/login`

2. **Enter Credentials**

   - Email: Your registered email
   - Password: Your password
   - Click the eye icon to show/hide password

3. **Submit**

   - Click "Login" button
   - You'll be redirected to the homepage

4. **Session Management**
   - Sessions automatically expire after 30 minutes of inactivity for security
   - You'll receive a warning before session timeout
   - You'll be prompted to log in again after expiration
   - All unsaved work is preserved and can be recovered after re-login
   - For security, always logout when using shared computers

### Forgot Password

1. Click "Forgot Password?" on the login page
2. Enter your registered institutional email address
3. Check your email inbox for a password reset link (may take 1-5 minutes)
4. Click the link in the email (valid for 24 hours)
5. Create a new secure password (minimum 8 characters with letters and numbers)
6. Confirm your new password
7. You'll be redirected to the login page
8. Login with your new credentials

**Note**: If you don't receive the email within 10 minutes, check your spam folder or contact support.

---

## 5. Dashboard Overview

### Navigation

The dashboard provides quick access to all system features:

#### Top Navigation Bar

- **Logo**: Click to return to homepage
- **Search**: Quick search for resources
- **Notifications**: Bell icon with unread count
- **Profile**: Access account settings
- **Logout**: Sign out of the system

#### Sidebar Menu (Admin/Staff)

- Dashboard
- Equipment
- Facilities
- Supplies
- Requests
- Users (Admin only)
- Profile
- Settings

#### Main Dashboard Cards

**For Faculty Users:**

1. **Equipment**: Browse and borrow equipment
2. **Facilities**: Book rooms and labs
3. **Supplies**: Request office supplies
4. **My Requests**: Track all your requests

**For Admin Users:**

1. **Dashboard Statistics**: Overview of all resources
2. **Pending Requests**: Requests awaiting approval
3. **User Management**: Manage user accounts
4. **Resource Analytics**: Charts and graphs

---

## 6. Managing Equipment

### Browsing Equipment

1. **Navigate to Equipment**

   - Click "Equipment" in the sidebar
   - Or visit `/equipment`

2. **View Equipment Catalog**

   - See all available equipment
   - Filter by:
     - Facility location
     - Category
     - Availability status
   - Search by name or description

3. **Equipment Details**
   - Equipment name and image
   - Category and description
   - Current status: Working, In Use, For Repair
   - Person liable
   - Facility location
   - Brand and model
   - Date acquired
   - Remarks

### Borrowing Equipment

1. **Select Equipment**

   - Click on the equipment card
   - Review availability and details

2. **Click "Borrow"**

   - Fill out the borrowing form:
     - **Purpose**: State reason for borrowing
     - **Start Date**: When you need it
     - **End Date**: When you'll return it
     - **Return Date**: Expected return date

3. **Submit Request**

   - Click "Submit Request"
   - Wait for admin approval
   - Track status in "My Requests"

4. **Request Status**
   - **Pending**: Awaiting approval
   - **Approved**: Ready to collect
   - **Rejected**: Request denied
   - **Returned**: Item returned

### Returning Equipment

1. **Navigate to "My Requests"**
2. **Select Borrowing Tab**
3. **Find Your Active Borrowing**
4. **Click "Mark as Returned"**
5. **Enter Receiver Name** (person receiving the equipment)
6. **Confirm**
   - This notifies admin to confirm the return
   - Status updates when admin confirms

---

## 7. Managing Facilities

### Browsing Facilities

1. **Navigate to Facilities**

   - Click "Facilities" in sidebar
   - Or visit `/facilities`

2. **View Available Facilities**

   - Computer Labs: CL1-CL11
   - Specialized Labs: MSIT LAB, NET LAB, AIR LAB
   - Offices: DEANS OFFICE, FACULTY OFFICE
   - Other: MULTIMEDIA LAB, REPAIR ROOM, NAVIGATU

3. **Facility Information**
   - Facility name
   - Capacity
   - Available equipment
   - Operating hours
   - Current status

### Booking Facilities

1. **Select Facility**

   - Click on desired facility card

2. **Fill Booking Form**

   - **Purpose**: Event or activity description
   - **Start Date**: Booking start date and time
   - **End Date**: Booking end date and time
   - **Number of Participants**: Expected attendees

3. **Submit Booking**

   - Review your details
   - Click "Submit Booking Request"
   - Receive confirmation message

4. **Booking Approval**
   - Admin reviews your request
   - Check status in "My Requests"
   - Approved bookings show in your schedule

### Completing a Booking

1. **After Event Completion**
2. **Go to "My Requests" > Booking Tab**
3. **Click "Mark as Done"**
4. **Add Completion Notes** (optional)
5. **Submit**
   - Notifies admin
   - Facility becomes available

---

## 8. Managing Supplies

### Browsing Supplies

1. **Navigate to Supplies**

   - Click "Supplies" in sidebar
   - Or visit `/supplies`

2. **Filter Supplies**

   - By facility location
   - By category (office, cleaning, lab, etc.)
   - By availability

3. **Supply Information**
   - Supply name and image
   - Category
   - Quantity available
   - Stocking point (minimum quantity)
   - Stock unit (pieces, boxes, sets)
   - Facility location
   - Remarks

### Requesting Supplies

1. **Select Supply**

   - Click on supply card
   - Check available quantity

2. **Fill Acquire Form**

   - **Quantity**: Number of units needed
   - **Purpose**: Reason for request

3. **Validation**

   - System checks if quantity is available
   - Cannot exceed available stock
   - Must be positive number

4. **Submit Request**

   - Click "Submit Request"
   - System creates acquiring request
   - Track in "My Requests"

5. **Request Processing**
   - Admin reviews request
   - Supply deducted when approved
   - Rejected if insufficient stock

---

## 9. Request Management

### For Regular Users

#### Viewing Your Requests

1. **Navigate to "My Requests"**
2. **Select Request Type**:

   - Borrowing (Equipment)
   - Booking (Facilities)
   - Acquiring (Supplies)

3. **Request Information Shows**:
   - Request ID
   - Item/Facility/Supply name
   - Purpose
   - Dates
   - Status
   - Created date

#### Request Actions

- **Mark as Returned** (Borrowing only)
- **Mark as Done** (Booking only)
- **Delete Request** (if pending)
- **Select Multiple** for bulk actions

### For Admin Users

#### Dashboard Request Management

1. **Navigate to "Dashboard Requests"**

   - View all system requests
   - Switch between types using dropdown

2. **Request Details**:

   - Requester information
   - Item/facility details
   - Purpose and dates
   - Current status

3. **Available Actions**:
   - **Approve**: Grant the request
   - **Reject**: Deny the request
   - **Delete**: Remove request permanently
   - **View Details**: See full information

#### Bulk Operations

1. **Select Multiple Requests**

   - Use checkboxes
   - Or "Select All"

2. **Choose Action**:

   - Approve Selected
   - Reject Selected
   - Delete Selected

3. **Confirm Action**
   - Review selected items
   - Confirm bulk operation

#### Notifications Management

**Return Notifications** (Borrowing):

- User marks item as returned
- Admin receives notification
- Admin confirms return
- Equipment status updates

**Done Notifications** (Booking):

- User marks booking complete
- Admin receives notification
- Admin confirms completion
- Facility becomes available

---

## 10. My Requests

### Overview

The "My Requests" page shows all your submitted requests in one place.

### Features

#### 1. Request Type Selector

- Toggle between Borrowing, Booking, and Acquiring
- Each type shows relevant information

#### 2. Action Buttons

- **Refresh**: Update request list
- **Mark as Returned/Done**: Complete active requests
- **Delete**: Remove unwanted requests

#### 3. Request Tables

**Borrowing Requests**:

- Equipment name
- Quantity
- Borrow date
- Expected return date
- Purpose
- Status
- Receiver name (if returned)

**Booking Requests**:

- Facility name
- Booking date
- Start time
- End time
- Purpose
- Status

**Acquiring Requests**:

- Supply name
- Quantity
- Request date
- Purpose
- Status

#### 4. Pagination

- 10 requests per page
- Navigate with Previous/Next buttons
- Shows current page and total pages

### Using My Requests

1. **Track Request Status**

   - Pending: Waiting for approval
   - Approved: Request granted
   - Rejected: Request denied

2. **Manage Active Requests**

   - Mark borrowed items as returned
   - Complete facility bookings
   - Cancel pending requests

3. **Bulk Delete**
   - Select multiple requests
   - Click "Delete Selected"
   - Confirm deletion

---

## 11. Monitoring Resources

### For Admin Users Only

#### Monitor Equipment

1. **Navigate to "Monitor Equipment"**

   - View all equipment in system
   - Real-time status updates

2. **Information Displayed**:

   - Equipment name and image
   - Category
   - Status (Working, In Use, For Repair)
   - Person liable
   - Facility location
   - Brand and model
   - Date acquired

3. **Filters Available**:

   - By facility
   - By status
   - By category
   - Search by name

4. **Actions**:
   - Edit equipment details
   - Update status
   - Delete equipment
   - View borrowing history

#### Monitor Facilities

1. **Navigate to "Monitor Facilities"**

   - Overview of all facilities
   - Booking calendar view

2. **Features**:

   - Current occupancy status
   - Upcoming bookings
   - Facility utilization charts
   - Maintenance schedules

3. **Actions**:
   - Edit facility details
   - Block/unblock facilities
   - View booking history
   - Generate reports

#### Monitor Supplies

1. **Navigate to "Monitor Supplies"**

   - Real-time inventory tracking
   - Low stock alerts

2. **Information Shown**:

   - Supply name and category
   - Current quantity
   - Stocking point
   - Facility location
   - Recent acquisitions

3. **Actions**:
   - Update quantities
   - Edit supply details
   - Delete supplies
   - View acquisition history
   - Generate inventory reports

---

## 12. User Account Management

### For Admin Users

#### Managing User Requests

1. **Navigate to "Requests" or "Users"**

   - View pending account requests
   - See user details

2. **User Information**:

   - Name and email
   - Department
   - Requested role
   - Registration date

3. **Approval Actions**:
   - **Approve**: Grant access
   - **Reject**: Deny request
   - **Delete**: Remove request

#### User List Management

1. **View All Users**

   - Filter by department
   - Filter by role
   - Search by name or email

2. **User Actions**:
   - Edit user details
   - Change user role
   - Deactivate account
   - View user activity

### For Regular Users

#### Managing Your Profile

1. **Navigate to Profile**

   - Click profile icon
   - Or go to `/profile`

2. **View Your Information**:

   - Name and email
   - Department and role
   - Account status
   - Registration date

3. **Edit Profile**:
   - Update personal information
   - Change password
   - Update preferences

---

## 13. Notifications

### Notification System

#### Notification Bell

- Located in top navigation bar
- Shows red badge with unread count
- Click to view notifications

#### Notification Types

1. **Request Status Updates**:

   - Request approved
   - Request rejected
   - Request deleted by admin

2. **Action Required**:

   - Return confirmation needed
   - Booking completion needed
   - Approval needed (admins)

3. **System Alerts**:
   - Low stock warnings
   - Overdue returns
   - Upcoming bookings

#### Managing Notifications

1. **View Notifications**

   - Click notification bell
   - Dropdown shows recent notifications

2. **Notification Details**:

   - Type (borrowing, booking, acquiring)
   - Item/facility name
   - Requester name
   - Purpose
   - Status
   - Timestamp

3. **Actions**:
   - Click to view details
   - Mark as read
   - Clear all notifications

---

## 14. Profile Settings

### Accessing Profile

1. Click profile icon in top-right
2. Select "Profile" from dropdown
3. Or navigate to `/profile`

### Profile Information

**Personal Details**:

- First Name
- Last Name
- Email Address
- Department
- Role/Position

**Account Details**:

- User ID
- Registration Date
- Account Status
- Last Login

### Updating Profile

1. **Edit Information**

   - Click "Edit Profile"
   - Update desired fields
   - Click "Save Changes"

2. **Change Password**

   - Click "Change Password"
   - Enter current password
   - Enter new password
   - Confirm new password
   - Click "Update Password"

3. **Preferences**
   - Email notifications: On/Off
   - Dark mode: On/Off
   - Language preference
   - Time zone

---

## 15. Troubleshooting

### Common Issues

#### Cannot Login

**Problem**: Error message when logging in

**Solutions**:

1. Check email and password spelling
2. Ensure Caps Lock is off
3. Verify account is approved
4. Clear browser cache
5. Try password reset
6. Contact admin if account locked

#### Requests Not Showing

**Problem**: My requests page is empty

**Solutions**:

1. Check selected request type (tab)
2. Click refresh button
3. Verify you're logged in
4. Check if requests were deleted
5. Clear browser cache
6. Try logging out and back in

#### Cannot Submit Request

**Problem**: Submit button doesn't work

**Solutions**:

1. Fill all required fields
2. Check date/quantity validations
3. Ensure resource is available
4. Check internet connection
5. Try refreshing the page
6. Contact support if persists

#### Slow Performance

**Problem**: Pages load slowly

**Solutions**:

1. Check internet connection
2. Close unnecessary browser tabs
3. Clear browser cache
4. Try different browser
5. Check server status
6. Contact IT support

### Error Messages

#### "Unauthorized Access"

- **Cause**: Not logged in or session expired
- **Fix**: Log in again

#### "Insufficient Quantity"

- **Cause**: Requested quantity exceeds available stock
- **Fix**: Reduce quantity or choose different supply

#### "Invalid Date Range"

- **Cause**: End date before start date
- **Fix**: Correct date selection

#### "Resource Not Available"

- **Cause**: Equipment/facility already booked
- **Fix**: Choose different dates or resource

### Getting Help

1. **Check FAQ Section** in this manual
2. **Contact System Administrator**:
   - Email: erma.support@yourorganization.edu
   - Support Portal: Available within the ERMA system
   - Phone: Contact your IT Help Desk
   - Office Hours: Monday-Friday, 8:00 AM - 5:00 PM
3. **Submit Support Ticket** through the ERMA Help menu
4. **Check Documentation** at your organization's ERMA documentation portal
5. **Live Chat Support** (available during office hours via the help icon)

---

## 16. FAQ

### General Questions

**Q: Who can use the ERMA system?**  
A: All faculty, staff, and authorized personnel with approved accounts.

**Q: Is the system available 24/7?**  
A: Yes, the ERMA portal is accessible 24/7. However, request approvals and administrative actions are processed during regular office hours (Monday-Friday, 8:00 AM - 5:00 PM). You can submit requests anytime, and they will be reviewed during business hours.

**Q: Can I access ERMA from mobile?**  
A: Yes, ERMA is fully responsive and optimized for all devices including smartphones, tablets, laptops, and desktop computers. You can access the system from anywhere with an internet connection using the same URL.

**Q: How long does approval take?**  
A: Account registration and resource request approvals typically take 1-2 business days. During peak periods (start of semester, exam weeks), approval may take up to 3 business days. Urgent requests can be expedited by contacting the administrator directly with justification.

### Account Questions

**Q: How do I create an account?**  
A: Click "Register" on the homepage and fill out the form. Wait for admin approval.

**Q: I forgot my password. What do I do?**  
A: Click "Forgot Password" on login page and follow the reset instructions.

**Q: Can I change my role?**  
A: No, roles are assigned by administrators based on your position.

**Q: How do I update my email?**  
A: Contact an administrator to update your email address.

### Equipment Questions

**Q: How long can I borrow equipment?**  
A: Duration depends on equipment type and availability. Specify dates in your request.

**Q: What if equipment is damaged?**  
A: Report immediately to the person liable or lab technician.

**Q: Can I extend my borrowing period?**  
A: Contact admin to request an extension before the return date.

**Q: How many items can I borrow at once?**  
A: No strict limit, but requests are reviewed based on need and availability.

### Facility Questions

**Q: How far in advance can I book?**  
A: You can book facilities up to 30 days in advance.

**Q: Can I cancel a booking?**  
A: Yes, go to "My Requests" and delete the booking before the scheduled time.

**Q: What if I need the facility longer?**  
A: Submit a new booking request or contact admin to extend.

**Q: Are there booking restrictions?**  
A: Yes, academic use has priority. Check facility policies.

### Supply Questions

**Q: What if a supply is out of stock?**  
A: Check back later or contact admin for restock timeline.

**Q: Can I request custom supplies?**  
A: Contact admin to request items not in the catalog.

**Q: How do I return unused supplies?**  
A: Coordinate with the supply officer at the facility.

**Q: Are there quantity limits?**  
A: Requests are reviewed based on need and available stock.

### Request Questions

**Q: Can I edit a submitted request?**  
A: No, delete and submit a new request instead.

**Q: Why was my request rejected?**  
A: Check notification message or contact admin for details.

**Q: Can I prioritize my request?**  
A: Contact admin directly for urgent needs.

**Q: How do I track multiple requests?**  
A: Use "My Requests" page to view all requests in one place.

### Technical Questions

**Q: Which browsers are supported?**  
A: Chrome, Firefox, Safari, and Edge (latest versions).

**Q: Is my data secure?**  
A: Yes, ERMA uses industry-standard security measures including HTTPS encryption for all data transmission, secure authentication tokens, encrypted password storage, and regular security audits. All data is stored on secure institutional servers with regular backups. Your personal information is protected according to institutional privacy policies.

**Q: Can I export my request history?**  
A: Contact admin to request data export.

**Q: What if I encounter a bug?**  
A: Report bugs through the "Report Issue" option in the Help menu, or email erma.support@yourorganization.edu with:

- Description of the issue
- Steps to reproduce
- Screenshots (if applicable)
- Browser and device information
- Date and time of occurrence

The support team will investigate and respond within 1-2 business days.

---

## Quick Reference Guide

### Common Tasks

| Task                     | Steps                                            |
| ------------------------ | ------------------------------------------------ |
| **Borrow Equipment**     | Equipment → Select Item → Fill Form → Submit     |
| **Book Facility**        | Facilities → Select Room → Fill Form → Submit    |
| **Request Supplies**     | Supplies → Select Item → Enter Quantity → Submit |
| **Check Request Status** | My Requests → Select Tab → View Status           |
| **Return Equipment**     | My Requests → Borrowing → Mark as Returned       |
| **Complete Booking**     | My Requests → Booking → Mark as Done             |
| **Delete Request**       | My Requests → Select Request → Delete            |
| **View Notifications**   | Click Bell Icon → View List                      |

### Keyboard Shortcuts

| Shortcut   | Action               |
| ---------- | -------------------- |
| `Ctrl + K` | Quick search         |
| `Ctrl + R` | Refresh page         |
| `Esc`      | Close modal          |
| `Tab`      | Navigate form fields |
| `Enter`    | Submit form          |

### Status Colors

| Status     | Color  | Meaning                |
| ---------- | ------ | ---------------------- |
| Pending    | Yellow | Awaiting approval      |
| Approved   | Green  | Request granted        |
| Rejected   | Red    | Request denied         |
| Working    | Green  | Equipment operational  |
| In Use     | Blue   | Equipment borrowed     |
| For Repair | Red    | Equipment needs fixing |

---

## System Architecture

### Tech Stack

**Frontend**:

- Next.js 15.4.5
- React 19.1.0
- TypeScript
- Tailwind CSS
- Zustand (State Management)

**Backend**:

- FastAPI (Python)
- PostgreSQL Database
- JWT Authentication

**Additional Libraries**:

- Lucide React (Icons)
- Recharts (Analytics)
- React Router DOM

---

## Support and Contact

### Technical Support

- **Email**: erma.support@yourorganization.edu
- **Support Portal**: Access through ERMA Help menu
- **Phone**: Contact your institutional IT Help Desk
- **Hours**: Monday-Friday, 8:00 AM - 5:00 PM
- **Live Chat**: Available within ERMA during office hours
- **Emergency**: For critical system issues, contact IT Help Desk

### Administrator Contact

- **Lab Technician**: Available in Computer Labs during office hours
- **CCIS Dean's Office**: For policy and access inquiries
- **Email**: erma.admin@yourorganization.edu
- **Office Hours**: Monday-Friday, 8:00 AM - 5:00 PM

### Feedback and Suggestions

We value your feedback! Submit suggestions through:

- **Feedback Form**: Available in ERMA Profile menu
- **Email**: erma.feedback@yourorganization.edu
- **User Surveys**: Periodic surveys sent via email

---

## Version History

| Version | Date        | Changes         |
| ------- | ----------- | --------------- |
| 1.0     | Dec 1, 2025 | Initial release |

---

## Legal and Compliance

### Terms of Use

By using ERMA, you agree to:

- Provide accurate information
- Use resources responsibly
- Return items on time
- Report issues promptly
- Follow institutional policies

### Privacy Policy

- All user data is encrypted and stored securely on institutional servers
- Information is used solely for resource management and administrative purposes
- Data is not shared with third parties without explicit consent
- You can request data export or deletion through your Profile settings
- Session data is automatically cleared after logout or timeout
- System administrators may access data for troubleshooting and auditing purposes
- Complies with institutional data protection policies and applicable regulations
- Regular security audits and backups are performed to ensure data integrity

### Acceptable Use

ERMA is for institutional purposes only. Prohibited activities include:

- Unauthorized access attempts
- Sharing credentials
- Submitting false requests
- System abuse or misuse

---

**Thank you for using ERMA!**  
_Making resource management simple and efficient._

For the latest updates and documentation:

- **User Portal**: Access through your ERMA account
- **Documentation**: Available in the Help section
- **Training Materials**: Contact your administrator for workshops and guides
- **System Updates**: Check the announcements section in your dashboard

---

**Document Information**  
Last Updated: December 1, 2025  
Version: 1.0  
Authors: ERMA Development Team  
Contact: erma.support@yourorganization.edu  
Institution: College of Computing and Information Sciences (CCIS)  
System Status: Production - Fully Deployed

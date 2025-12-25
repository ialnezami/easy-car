# Easy Car - Product Requirements Document

## Overview
Easy Car is a multi-tenant car rental platform built with Next.js, MongoDB, and deployed on Vercel. The platform allows multiple car rental agencies to manage their own inventory, pricing, and reservations through dedicated subdomains/paths.

## Technology Stack
- **Frontend/Backend**: Next.js (App Router)
- **Database**: MongoDB
- **Deployment**: Vercel
- **Authentication**: TBD (NextAuth.js recommended)

## Core Features

### 1. Multi-Tenant Architecture
- Each car rental agency has its own dedicated page/route
- URL structure: `easy-car.com/{agency-slug}`
  - Example: `easy-car.com/agence1`
  - Example: `easy-car.com/agence2`
- Each agency operates independently with isolated data

### 2. Agency Management Dashboard
Each agency has a manager/admin interface to:
- **Vehicle Management**
  - Add new vehicles with detailed information
  - Edit vehicle details (make, model, year, color, features, etc.)
  - Upload vehicle images
  - Set vehicle availability status
  - Remove/deactivate vehicles

- **Pricing Management**
  - Set base prices for different rental periods:
    - Daily rate
    - Weekly rate
    - Monthly rate
  - Configure custom pricing rules
  - Apply discounts:
    - Percentage-based discounts
    - Fixed amount discounts
    - Promotional codes
    - Seasonal pricing adjustments

### 3. Reservation System
- **Rental Period Options**
  - One day
  - One week
  - One month
  - Custom date ranges
- **Dynamic Pricing**
  - Price calculation based on selected rental period
  - Automatic discount application
  - Transparent pricing display

### 4. Customer Features
- Browse available vehicles by agency
- View vehicle details and images
- Check availability for specific dates
- Make reservations
- View booking history

## Technical Requirements

### Database Schema
- **Agencies Collection**
  - Agency ID, name, slug, contact info, settings
- **Vehicles Collection**
  - Vehicle details, agency reference, pricing, availability
- **Reservations Collection**
  - Customer info, vehicle reference, dates, pricing, status
- **Users Collection**
  - Agency managers/admins, customers (if user accounts required)

### Security & Access Control
- Agency managers can only access their own agency's data
- Secure authentication for agency managers
- Public access for browsing vehicles and making reservations

### Performance Requirements
- Fast page load times (< 2s)
- Optimized images and assets
- Efficient database queries with proper indexing

## Future Enhancements (Out of Scope for MVP)
- Customer user accounts
- Payment integration
- Reviews and ratings
- Advanced search and filtering
- Email notifications
- Analytics dashboard

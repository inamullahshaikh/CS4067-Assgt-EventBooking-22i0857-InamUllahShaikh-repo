# Online Event Booking Platform - Microservices Architecture

## Project Overview

The Online Event Booking Platform is a microservices-based application designed to enable users to browse, book, and manage events online. The system is built using microservices architecture to ensure scalability, flexibility, and easy maintenance. The platform includes features such as event browsing, user authentication, booking, payment processing, and event management.

## Features

- **Event Browsing**: View a list of events and filter by categories, dates, and location.
- **User Authentication**: Secure login and registration for users.
- **Booking**: Ability to book tickets for events.
- **Payment Integration**: Payment gateway integration for processing bookings.
- **Event Management**: Admin interface to create, update, and delete events.
- **Microservices**: Each feature is a standalone microservice interacting via RESTful APIs.

## Architecture

The platform is designed using microservices architecture, where each feature of the platform is encapsulated in its own microservice. Below is a high-level overview of the microservices:

1. **User Service**: Manages user registration, authentication, and profile management.
2. **Event Service**: Handles event details, categories, and event listings.
3. **Booking Service**: Manages booking requests and ticket reservations.
4. **Payment Service**: Handles payments for event bookings.
5. **Admin Service**: Provides event management functionality for administrators.

All services communicate with each other via HTTP REST APIs, and the application is built using technologies such as **Spring Boot** and **Docker** for containerization.

## Tech Stack

- **Backend**: 
  - Java (Spring Boot)
  - REST APIs
- **Database**:
  - MySQL/PostgreSQL for persistent storage
- **Microservices**:
  - Spring Cloud for service discovery and load balancing
  - Docker for containerization
  - Kubernetes for orchestration (optional)
- **Authentication**:
  - JWT (JSON Web Tokens)
- **Payment Integration**:
  - Stripe API / PayPal API (optional)
- **API Documentation**:
  - Swagger for API documentation

## Installation

### Prerequisites

Make sure you have the following installed:

- JDK 11 or above
- Maven or Gradle
- Docker
- Docker Compose (for local setup)
- MySQL/PostgreSQL (or Docker for local database)

### Setting Up the Project

1. Clone the repository:

   ```bash
   git clone [https://github.com/inamullahshaikh/CS4067-Assgt-EventBooking-22i0857-InamUllahShaikh-repo.git]
   cd event-booking-platform

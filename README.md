# Project Plan for Backend and Frontend Integration with Blockchain

## Introduction
This document outlines the initial plan for the first iteration of our project, focusing on integrating a backend server, frontend interface, and the foundational steps towards blockchain integration. Our goal is to enable secure and efficient user interactions with our system through well-defined components.

## Goals for Iteration 1

### Objective
Build a system where users can:
- Log in to their accounts.
- View orders, pending rebates, and total rebates.
- Track updates in rebate counts upon checkout.

Additionally, affiliates should be able to:
- Log in with admin credentials.
- View all users and their individual profiles.
- Access transaction history.

### Deployment
- Implement continuous deployment with a CI/CD pipeline that automates testing and deployment processes.

## Project Components

### Backend Server (Elixir)
- **Alex**: Manages user authentication and session management.
- Responsible for handling data storage for orders, rebates, and user profiles.
- Provides APIs for the frontend to retrieve and update user-specific information.

### Frontend (React)
- **Tem & Geonwoo**: Develop the user-friendly interface for account login and data visualization.
- Display user orders, rebates, and transaction history.
- Ensure integration with the backend for real-time data accuracy.

### Blockchain Development (Research Phase)
- **Gaberial & shivam** Initial research into blockchain technologies suitable for tracking and managing transactions securely.
- Evaluation of programming languages for blockchain development: C++, Go, Rust, and potentially Zig.

## First Week of Iteration 1 & Vertical Slicing

### Responsibilities
- **Gabriel Costa Y3 ICL DOC** and **Shivam ICL DOC Y3**: Conduct in-depth research into blockchain technologies and potential frameworks suitable for our application. Results: a comprehensive examination of the cryto tech we need to build our coin, and how long it will take.

### Research Materials
- Preliminary language consideration for blockchain development, with a focus on Rust for its safety and concurrency features.
- Reference for in-depth blockchain understanding: "Building a Blockchain" (specific book details to be included).

## Dev work vertical slice to Work On 

## CI/CD Pipeline
- Set up a continuous integration and continuous deployment pipeline using GitHub Actions.
- Automate tests for backend, frontend, and later, blockchain components to ensure code integrity and functionality before deployment.

## First Week Iteration: Vertical Slicing

For the first week of iteration, we will concentrate on establishing foundational user interactions with the system by setting up user profile viewing capabilities. 

### Backend Tasks (Elixir)
- **User Authentication Setup**: Develop the user login and session management. This involves creating the authentication APIs needed for users to log in and maintain their session.
- **User Profile API**: Develop APIs that retrieve user profile data from the backend. This will include securing the API to ensure that only authenticated users can access their profiles.
- 
### Frontend Tasks (React)
- **User & admin Profile Display**: Design and implement the user profile viewing functionality. This will involve fetching the user data from the backend and rendering it in the user interface.
- **Data Handling and State Management**: Set up state management to handle and display user data fetched from the backend APIs. Ensure that the data is updated in real-time as the backend sends new information.
- **Login Page**

### Integration Tasks
- **Ensure Seamless Data Flow**: Verify that the frontend (React) can seamlessly manage and display data coming from the (Elixir) backend.
- **Testing**: Set up testing framework for Both react and Elixir

## Conclusion
This document outlines the foundational steps and responsibilities for the first iteration. We aim to establish a robust and scalable system with clear separation of concerns between the backend, frontend, and blockchain components. Further details and adjustments will be discussed and implemented based on the research findings and development progress in the upcoming weeks.

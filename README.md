# Multi-Cloud Infrastructure Platform

A modern web platform that visualizes and optimizes infrastructure across multiple cloud providers.
The application provides a unified interface to observe resources and simulate optimization across **AWS, Microsoft Azure, and Google Cloud Platform**.

The goal of this project is to demonstrate how multi-cloud infrastructure can be managed and visualized through a single intelligent interface.

---

## Live Demo

https://cloud-platform-dun.vercel.app/

---

## Features

### Multi-Cloud Visualization

* Unified interface for AWS, Azure, and Google Cloud
* Animated infrastructure connections
* Provider-to-engine workflow representation

### Optimization Engine

* Central system representing workload orchestration
* Simulated infrastructure balancing across providers
* Visual metrics such as uptime and latency

### Resource Monitoring

The platform displays simulated infrastructure components:

* CPU
* GPU
* RAM
* Network

Each resource includes:

* Cost per hour
* Efficiency metrics
* Animated usage bars

### Dynamic Data Handling

* API based data fetching
* Resource data caching using `sessionStorage`
* Skeleton loading UI
* Error handling for API failures

### Modern UI Design

* Responsive interface
* Smooth animations
* Glass-style cloud provider cards
* Gradient UI elements

---

## Tech Stack

### Frontend

* React
* Vite
* JavaScript (ES6)

### UI & Animations

* Custom CSS design tokens
* SVG based cloud icons
* Intersection Observer API
* CSS animations

### Deployment

* Vercel

### API

* DummyJSON API (used for simulated cloud resource data)

---

## Project Structure

src

App.jsx
main.jsx
index.css

Components included:

HeroSection
Landing section introducing the platform.

CloudSection
Main visualization section showing provider integration.

CloudProvider
Displays AWS, Azure, and Google Cloud cards.

OptimizationEngine
Represents the central orchestration engine.

ResourceIcons
Shows CPU, GPU, RAM and Network resources.

---

## Installation

Clone the repository

git clone https://github.com/trisharaj11/cloudPlatform.git

Navigate into the project

cd cloudPlatform

Install dependencies

npm install

Run development server

npm run dev

Build the project

npm run build

Preview production build

npm run preview

---

## Deployment

The application is deployed using **Vercel**.

Deployment steps:

1. Push code to GitHub
2. Import repository into Vercel
3. Vercel automatically detects the **Vite framework**
4. Deploy

Build configuration used:

Framework: Vite
Build Command: npm run build
Output Directory: dist

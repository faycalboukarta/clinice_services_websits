# Marketing Clinic Website

Marketing Clinic is a professional digital agency website designed to offer web design and digital marketing solutions, specifically tailored for the Algerian market. This project serves as the online presence for the agency, showcasing services, packages, and a portfolio of work.

![Marketing Clinic](public/hero_image.png)

## Features

- **Responsive Design:** Fully responsive layout ensuring a seamless experience across desktop, tablet, and mobile devices.
- **Service Showcase:** Detailed presentation of services including Web Design, Digital Marketing, and Brand Identity.
- **Packages & Pricing:** Clear display of service packages to help clients choose the right plan.
- **Portfolio Section:** A gallery to showcase previous client projects.
- **WhatsApp Integration:** Direct floating button for quick communication via WhatsApp.
- **RTL Support:** Native Arabic language support with Right-to-Left (RTL) layout.

## Technologies Used

- **HTML5:** Semantic markup for page structure.
- **CSS3:** Custom styling with CSS variables and responsive media queries.
- **JavaScript (ES6+):** Interactive elements and mobile navigation logic.
- **Vite:** Next Generation Frontend Tooling for fast development and building.

## Project Structure

```
clinic_services_website/
├── src/                # Source files
├── public/             # Static assets (images, icons)
├── index.html          # Homepage
├── services.html       # Services page
├── packages.html       # Pricing packages page
├── portfolio.html      # Portfolio page
├── contact.html        # Contact page
├── style.css           # Global styles
├── responsive.css      # Responsive adjustments
├── main.js             # Main JavaScript entry point
└── package.json        # Project dependencies and scripts
```

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (Node Package Manager)
- MongoDB (Running locally or connection string)

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```bash
   cd clinic_services_website
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Configure Environment (Optional):
   Create a `.env` file to customize your MongoDB URI or Port.
   ```
   MONGODB_URI=mongodb://localhost:27017/clinic_services
   PORT=3000
   ```

### Running the Application

To start the full-stack application (Frontend + Backend):

```bash
npm start
```

The website will be available at `http://localhost:3000`.

### Admin Dashboard (CMS)

Access the dashboard at `http://localhost:3000/admin`.
- **Messages:** View and manage contact form submissions.
- **Portfolio:** Upload new projects (Image + Title + Description).
- **Packages:** Update package prices and view details.
- **Settings:** Create new admin accounts.

**Default Credentials:**
- Username: `admin`
- Password: `admin123`


## License

This project is proprietary and all rights are reserved.

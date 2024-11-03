# Whatsapp Business Messaging Web App

This project is a contract-based proof of concept developed for **Mulltiply**, demonstrating efficient integration with the Meta API to facilitate bulk messaging through WhatsApp Business.

## Project Overview
The web app allows users to log in with Facebook, input multiple phone numbers, select a message template, customize it, and send messages seamlessly. It’s designed for businesses looking to enhance their communication strategies.

## Features
- **Facebook Authentication**: Secure user login using `next-auth`.
- **Multi-Number Input**: Easily add and manage multiple phone numbers.
- **Template Selection**: Choose from a list of pre-defined templates.
- **Variable Customization**: Edit variables in the message for personalization.
- **WhatsApp Business Messaging**: Send messages via the Meta API with high reliability.

## Technologies Used
- **Next.js**: Framework for building the app with server-side rendering.
- **Tailwind CSS**: Utility-first CSS framework for a responsive and modern design.
- **Axios**: For handling API requests.
- **Next-Auth**: Authentication library for Facebook login.
- **Meta API**: For integrating WhatsApp Business messaging.

## Setup Instructions

### Prerequisites
- Node.js installed on your machine.
- A WhatsApp Business API setup with Meta credentials.

### Installation
1. Clone the repository:
   ```bash
   git clone [repository URL]
   ```
2. Navigate to the project directory:
   ```bash
   cd WA-business
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

### Running the App
1. Start the development server:
   ```bash
   npm run dev
   ```
2. Visit [http://localhost:3000](http://localhost:3000) to see the app.

### Configuration
1. Setup next-auth for facebook login using custom facebook app [[Documentation](https://next-auth.js.org/providers/facebook)]
2. Set up environment variables in a `.env` file:
  ```plaintext
  FACEBOOK_CLIENT_ID=your-facebook-client-id
  FACEBOOK_CLIENT_SECRET=your-facebook-client-secret
  NEXTAUTH_URL=http://localhost:3000
  NEXTAUTH_SECRET=a-secure-secret-for-next-auth
  META_API_KEY=your-meta-api-key
  ```

## Future Improvements
- Expanded API integration for more messaging features.
- Detailed analytics for message delivery and performance.
- A user-friendly dashboard for managing templates and recipients.

## Acknowledgments
This project was developed for **[Mulltiply](https://mulltiply.com)** as part of a contract assignment, demonstrating the potential of WhatsApp Business for efficient communication.

## License
This project is licensed under the MIT License.

# WiFinder Frontend

WiFinder is a web application that helps users discover and share WiFi hotspots. Built with React and Firebase, it features an interactive map, secure authentication, and encrypted password storage.

## Features

- 🔐 Secure authentication with Firebase
- 🗺️ Interactive map with Google Maps integration
- 📍 WiFi hotspot management
- 🔒 Encrypted password storage
- 📱 QR code generation for easy sharing
- ⭐ User reviews and ratings

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- npm (v6 or higher)
- A Firebase project
- A Google Maps API key

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/wifinder-frontend.git
cd wifinder-frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
REACT_APP_FIREBASE_API_KEY=your-firebase-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=your-firebase-auth-domain
REACT_APP_FIREBASE_PROJECT_ID=your-firebase-project-id
REACT_APP_FIREBASE_STORAGE_BUCKET=your-firebase-storage-bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-firebase-messaging-sender-id
REACT_APP_FIREBASE_APP_ID=your-firebase-app-id
REACT_APP_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

> **Note:** Never commit your `.env.local` file to version control.

### 4. Start the Development Server

```bash
npm start
```

The application will open in your default browser at [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
├── components/     # React components
├── context/       # React context providers
├── firebase/      # Firebase configuration
├── utils/         # Utility functions
└── App.js         # Main application component
```

## Usage

1. **Sign In**: Use your Google account to sign in
2. **Browse Hotspots**: View WiFi spots on the interactive map
3. **Add Hotspots**: Click the "Add WiFi Spot" button to contribute new locations
4. **Share WiFi**: Generate QR codes for easy password sharing
5. **Rate and Review**: Leave feedback on WiFi spots

## Deployment

### Using Vercel

```bash
npm install -g vercel
vercel
```

### Using Firebase Hosting

```bash
npm install -g firebase-tools
firebase login
firebase init
npm run build
firebase deploy
```

## Security Notes

- All WiFi passwords are encrypted before storage
- API keys are stored in environment variables
- Firebase Security Rules are implemented to protect data
- User authentication is required for all write operations

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, email [ravsanovsanzhar@gmail.com] or open an issue in the repository.

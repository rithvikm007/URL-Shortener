# URL Shortener 

A URL shortener backend built with Node.js, Express, and MongoDB. This project enables users to shorten URLs, track usage statistics, enforce daily request limits, and more.

## Features

- **Shorten URLs**: Convert long URLs into short, shareable links.
- **Redirection**: Automatically redirect to the original URL when a short link is accessed.
- **Daily Request Limits**: Enforce a configurable daily request limit for individual short URLs. (Note: The daily hit count resets every day at UTC.)
- **Analytics**:
  - Total and daily hit counts for each URL.
  - Track the most accessed URLs.
- **Ad Redirection**: Redirect to an ad every 10th visit to a short URL.
- **Top URLs**: Retrieve the top N most accessed URLs.
- **URL Details**: View detailed statistics for any URL.

## Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Utilities**: Environment variables with `dotenv`, async error handling with `wrapAsync`

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and configure the following variables:

   ```env
   BACKEND_URL=http://localhost:3000  # Replace with your backend URL
   DAILY_REQUEST_LIMIT=100           # Adjust as needed
   MONGO_URI=mongodb://localhost:27017/urlShortener
   SESSION_SECRET=your_secret_key    # Secret key for session management
   ```

4. Start the server:

   ```bash
   npm start
   ```

5. Access the application at [http://localhost:8080](http://localhost:8080).

## Endpoints

### **GET /shorten**
Render the page for creating a shortened URL.

### **POST /shorten**
Create a new shortened URL.

- **Request Body**:
  ```json
  {
    "longUrl": "<URL to shorten>"
  }
  ```

- **Response**:
  ```json
  {
    "shortUrl": "<Generated short URL>"
  }
  ```

### **GET /show**
Render a page displaying all shortened URLs.

### **GET /redirect/:shortUrl** or **GET /:shortUrl**
Redirect to the original URL for a given short URL.

### **GET /details/:url**
Get details (long URL, short URL, hit counts) for a specific URL.

- **Response**:
  ```json
  {
    "longUrl": "<Original URL>",
    "shortUrl": "<Short URL>",
    "hitCount": <Total hit count>
  }
  ```

### **GET /top/:number**
Retrieve the top N most accessed URLs.

- **Response**:
  ```json
  [
    {
      "longUrl": "<Original URL>",
      "shortUrl": "<Short URL>",
      "hitCount": <Hit count>
    }
  ]
  ```

## Project Structure

```
├── models/
│   └── url.js           # Mongoose schema for URL data
├── routes/
│   └── urls.js          # All URL-related routes
├── utils/
│   ├── generateShortUrl.js # Logic for generating unique short URLs
│   └── wrapAsync.js        # Async error handling utility
├── views/
│   ├── url/             # Templates for URL pages
├── app.js               # Express app setup
├── package.json         # Dependencies and scripts
├── .env                 # Environment variables
└── README.md            # Project documentation
```

## Future Enhancements

- **User Authentication**: Allow users to manage their own shortened URLs.
- **Custom Short URLs**: Enable users to specify custom short URLs.
- **Admin Dashboard**: Provide an interface to monitor and manage URLs.
- **Advanced Analytics**: Include geolocation and device-based usage stats.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Acknowledgments

- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [dotenv](https://github.com/motdotla/dotenv)

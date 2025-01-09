# Node JS and Mongo DB

I created an API in Node JS and Mongo DB for user authentication, user profile, social network posts, and media upload.  
It allows you to design the frontend as you want. All the APIs are provided; you just need to call them and render it in the design of your choice.

## Installation

Run the following commands in the "api" folder:

```bash
npm update
npm install nodemon
nodemon index.js
```

Paste the "nodejs-mongodb" folder in your "htdocs" folder if you are using XAMPP or MAMP, or in "www" folder if you are using WAMP.
Project can be accessed from: `http://localhost/nodejs-mongodb/web/index.html`

## API Documentation

**Base URL:** `http://localhost:3000`

### User Authentication & Profile

<details>
  <summary><b>POST /register</b></summary>

  **Description:** Register a new user.

  ### Arguments
  - **name** (string): Required. Name of the user.
  - **email** (string): Required. Email of the user.
  - **password** (string): Required. Password of the user.

  ### Example Request
  ```bash
  curl -X POST http://localhost:3000/register \
  -d "name=Adnan&email=adnan@gmail.com&password=adnan"
```

### Status Codes

- **200 OK:** Request successful.

### Response

```json
{
    "status": "success",
    "message": "Account has been registered. You can login now."
}
```

### Response (in case of error)

```json
{
    "status": "error",
    "message": "Email already exists."
}
```
</details>

<br />

Complete documentation: https://adnan-tech.com/api-docs/nodejs-mongodb.html

<br />

<p>For any help, contact: support@adnan-tech.com</p>
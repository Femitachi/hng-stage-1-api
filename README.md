# HNG Stage 1 API

A REST API built with Express and MongoDB that generates a profile from a person's name using three external APIs:

* Gender prediction from Genderize
* Age prediction from Agify
* Nationality prediction from Nationalize

The generated profile is stored in MongoDB and can be retrieved or deleted later.

---

# Features

* Create a profile from a name
* Predict gender, age, age group, and nationality
* Store profiles in MongoDB
* Retrieve all saved profiles
* Retrieve a single profile by ID
* Delete a profile by ID

---

# Tech Stack

* Node.js
* Express
* MongoDB + Mongoose
* CORS
* node-fetch
* UUID v7
* dotenv

---

# Installation

Clone the repository:

```bash
git clone https://github.com/your-username/hng-stage-1-api.git
cd hng-stage-1-api
```

Install dependencies:

```bash
npm install
```

---

# Environment Variables

Create a `.env` file in the root directory and add:

```env
MONG_URI=your_mongodb_connection_string
PORT=4000
```

---

# Running the Project

Start the server:

```bash
npm start
```

Or if you use nodemon:

```bash
npm run dev
```

The server will run at:

```text
http://localhost:4000
```

---

# API Endpoints

## Create Profile

`POST /api/profiles`

### Request Body

```json
{
  "name": "Joh
```


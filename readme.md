### **HARDWARE TECH - POS AND INVENTORY SYSTEM**

This project is a Point of Sale (POS) and inventory management system built using the MERN stack. It stands for **MongoDB**, **Express**, **React**, and **Node.js**—a popular set of technologies for building full-stack web applications.

![MERN](https://img.shields.io/badge/MERN-3C3C3C?style=flat&logo=stackshare&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat&logo=mongodb&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat&logo=express&logoColor=white)
![React](https://img.shields.io/badge/React-61DAFB?style=flat&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat&logo=node.js&logoColor=white)

---

#### **Backend Setup Instructions**

1. **Open your terminal and navigate to the backend directory:**
    ```sh
    cd backend
    ```

2. **Copy the example environment file:**
    ```sh
    cp .env.example .env
    ```

3. **Generate a JWT secret key for authentication and authorization:**
    ```sh
    npm run key:generate
    ```
    *JWT (JSON Web Token) is a standard for securely transmitting information between parties as a JSON object. It's commonly used for authentication.*

4. **Configure your `.env` file:**  
   Edit the newly created `.env` file and add the required environment variables.

5. **Install backend dependencies:**
    ```sh
    npm install
    ```
    *This command downloads and installs all the packages your backend needs to run.*

---

#### **Frontend Setup Instructions**

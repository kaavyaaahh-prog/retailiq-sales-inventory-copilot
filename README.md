RetailIQ – Sales & Inventory Management System

📌 Project Description

RetailIQ is a web-based Sales and Inventory Management System developed to help store managers manage products, inventory, sales, and restocking activities digitally.

The system allows users to manage product information, monitor stock levels, view sales performance, identify low-stock products, and receive smart restocking recommendations.

This project is developed as a college-level mini project to demonstrate web development, CRUD operations, backend programming, database management, REST API integration, and AI-based recommendations.


🎯 Objectives

- To manage product information digitally.
- To maintain accurate inventory records.
- To reduce manual inventory management.
- To monitor product stock levels.
- To track sales and product performance.
- To identify low-stock and out-of-stock products.
- To provide smart restocking recommendations.
- To provide an easy-to-use web interface.
- To demonstrate the integration of frontend, backend, and database.


🛠️ Technologies Used

Frontend

- React
- TypeScript
- HTML
- CSS

Backend

- Python
- Django REST Framework

Database

- SQLite

AI Integration

- Gemini API

API Testing

- Postman

Development Tool

- Visual Studio Code

Version Control

- Git
- GitHub


✨ Features

- 🏪 Retail management dashboard
- 🔐 User login authentication
- 📦 Product management
- 📊 Inventory management
- 💰 Sales tracking
- ⚠️ Low-stock and out-of-stock alerts
- 🔍 Product search and filtering
- 📈 Sales analytics
- 🔄 Restocking management
- 🤖 AI-powered recommendations
- 💬 AI Copilot for business insights
- 💻 Simple and user-friendly interface


📁 Project Structure

RetailIQ/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
├── backend/
│   ├── manage.py
│   ├── requirements.txt
│   └── ...
│
├── database/
│   └── db.sqlite3
│
├── .env.example
├── .gitignore
├── README.md
└── package.json


⚙️ Installation and Setup

Step 1: Install Python

Make sure Python is installed on your computer.

Check the Python version:

python --version


Step 2: Open the Project

Open the RetailIQ project folder in Visual Studio Code.


Step 3: Create Virtual Environment

Run:

python -m venv venv


Step 4: Activate Virtual Environment

Windows:

venv\Scripts\activate


Step 5: Install Backend Dependencies

Run:

pip install -r requirements.txt


Step 6: Install Frontend Dependencies

Run:

npm install


▶️ Running the Project

Step 1: Start the Backend

Run:

python manage.py runserver

The Django server will start at:

http://127.0.0.1:8000


Step 2: Start the Frontend

Open another terminal and run:

npm run dev

The frontend will start at the Vite development URL shown in the terminal.


🏪 How to Use the System

1. Login Page

The user can log in using valid credentials to access the RetailIQ dashboard.


2. Dashboard

The dashboard displays:

- Total products
- Total stock
- Sales value
- Units sold
- Low-stock alerts
- Inventory status
- Sales charts


3. Product Management

The user can:

- Add a new product.
- View product details.
- Update product information.
- Delete a product.
- Search for products.
- Filter products.


4. Inventory Management

The inventory section allows users to:

- View current stock.
- Monitor stock levels.
- Identify low-stock products.
- Check reorder levels.


5. Sales Management

The sales module allows users to:

- Record sales.
- View sales records.
- Track units sold.
- View sales performance.


6. AI Copilot

The AI Copilot provides:

- Business insights.
- Restocking recommendations.
- Inventory-related assistance.


🔄 CRUD Operations

C – Create
R – Read
U – Update
D – Delete

The system supports CRUD operations for product and inventory management.


🧪 Testing

- Test product creation.
- Test product viewing.
- Test product updating.
- Test product deletion.
- Test search and filtering.
- Test invalid inputs.


🚀 Future Enhancements

- Supplier management.
- Multiple store management.
- Sales forecasting.
- Mobile application.
- Automated stock alerts.

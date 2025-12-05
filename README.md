# AMFSA Price Forecast Dashboard

A modern dashboard for visualizing oil price forecasts, fundamental analysis, and technical analysis. Built with Next.js and Python.

## Features
- **Interactive Price Chart**: Historical data and 10-day forecast.
- **Analytics Page**: Fundamental and Technical analysis cards.
- **News Feed**: Latest relevant news updates.
- **Responsive Design**: Works on desktop and mobile.
- **Light/Dark Mode**: Defaults to Light mode.

## Prerequisites for Deployment
1.  **GitHub Account**: To host the repository.
2.  **Azure Account**: To create the Static Web App resource.

## Deployment Guide: Azure Static Web Apps

Follow these steps to deploy the application as an Azure Static Web App.

### 1. Push Code to GitHub
If you haven't already, push your code to a new GitHub repository.
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

### 2. Create Static Web App Resource
1.  Log in to the [Azure Portal](https://portal.azure.com).
2.  Search for **Static Web Apps** and click **Create**.
3.  **Basics Tab**:
    *   **Subscription**: Select your subscription.
    *   **Resource Group**: Create new or select existing.
    *   **Name**: Enter a name (e.g., `amfsa-dashboard`).
    *   **Plan Type**: Select **Free** (for hobby/personal use) or **Standard**.
    *   **Deployment details**: Select **GitHub**.
    *   **Authorize**: Click to authorize Azure to access your GitHub account.
    *   **Organization/Repository/Branch**: Select the repo you just pushed.
4.  **Build Details**:
    *   **Build Presets**: Select **Next.js**.
    *   **App location**: `/`
    *   **Api location**: (Leave empty)
    *   **Output location**: (Leave empty)
5.  Click **Review + create**, then **Create**.

### 3. Configure Environment Variables
Your application requires specific environment variables to fetch data (Azure credentials).
1.  Once the deployment is complete, go to the **Resource** in Azure Portal.
2.  In the left menu, select **Configuration** (under Settings).
3.  Add the following **Application settings**:
    *   `AZURE_TENANT_ID`
    *   `AZURE_CLIENT_ID`
### 3. Configure Environment Variables
Your application requires specific environment variables to fetch data (Azure credentials).
1.  Once the deployment is complete, go to the **Resource** in Azure Portal.
2.  In the left menu, select **Configuration** (under Settings).
3.  Add the following **Application settings**:
    *   `AZURE_TENANT_ID`
    *   `AZURE_CLIENT_ID`
    *   `AZURE_CLIENT_SECRET`
    *   `WORKSPACE_NAME`
    *   `LAKEHOUSE_NAME`
4.  Click **Save**.

### ⚠️ CRITICAL NOTE: Python Runtime Support
This application uses a **hybrid architecture**: a Next.js frontend that spawns a Python script (`fetch_data.py`) via `child_process` to fetch data.

**Standard Azure Static Web Apps (Next.js preset) run in a Node.js environment and DO NOT have Python installed by default.**

If you deploy this directly as a Static Web App, the page will load, but the **data fetching will fail** because the server cannot find `python3`.

#### Recommended Solution: Azure Web App for Containers
To make this specific architecture work in the cloud without code changes, it is recommended to deploy as a **Docker Container** on **Azure App Service**.

1.  **Create a `Dockerfile`** in your project root:
    ```dockerfile
    FROM node:18-slim

    # Install Python and dependencies
    RUN apt-get update && apt-get install -y python3 python3-pip python3-venv
    
    WORKDIR /app
    
    # Install Python packages
    COPY requirements.txt .
    RUN python3 -m venv .venv && \
        . .venv/bin/activate && \
        pip install -r requirements.txt

    # Install Node dependencies and build
    COPY package*.json ./
    RUN npm install
    COPY . .
    RUN npm run build

    # Start the app
    EXPOSE 3000
    CMD ["npm", "start"]
    ```
2.  Build and push this image to **Azure Container Registry (ACR)**.
3.  Create an **Azure Web App** resource, select **Docker Container**, and point it to your image.
4.  Set the environment variables in the Web App's **Configuration** settings.

# 🚀 hiCousins Setup Guide

Follow these steps to get your environment ready.

## 0. Prerequisite: Install Node.js (Windows)

You need Node.js version **20.9.0** or later.

1.  **Download the Installer**:
    - Go to [nodejs.org/en/download](https://nodejs.org/en/download).
    - **Ignore the Docker instructions.**
    - Look for the **"Prebuilt Installer"** tab.
    - Click the button that says **"Download Node.js (LTS)"** (it should download a `.msi` file).

2.  **Run the Installer**:
    - Open the downloaded `.msi` file.
    - Click **Next** through the setup wizard.
    - Accept the license agreement.
    - Keep the default settings.
    - Click **Install**.

3.  **Verify Installation**:
    - **Restart VS Code** (close it completely and open it again) to refresh your path.
    - Open a new terminal (`Ctrl + ` `).
    - Type `node -v` and press Enter.
    - You should see a version number like `v20.x.x` or `v22.x.x`.

---

## 1. Configure Environment Variables

1.  **Create the file**:
    - In your VS Code file explorer (left sidebar), right-click in the empty space of the root folder.
    - Select **New File**.
    - Name it `.env.local`.

2.  **Get Clerk Keys**:
    - Go to your [Clerk Dashboard](https://dashboard.clerk.com/).
    - Select your application.
    - Go to **API Keys** in the sidebar.
    - Copy the **Publishable Key** and **Secret Key**.

3.  **Get Neon Database URL**:
    - Go to your [Neon Console](https://console.neon.tech/).
    - Select your project.
    - On the **Dashboard**, look for **Connection Details**.
    - Copy the connection string (it looks like `postgresql://user:password@...`).

4.  **Paste into `.env.local`**:
    - Open your new `.env.local` file.
    - Paste the values in this format:

    ```env
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
    CLERK_SECRET_KEY=sk_test_...
    DATABASE_URL="postgresql://..."
    ```

## 2. Setup Database Tables

1.  **Open the Schema**:
    - In VS Code, open the file `schema.sql` (I created this for you earlier).
    - Select all the text (`Ctrl+A`) and copy it (`Ctrl+C`).

2.  **Run in Neon**:
    - Go back to your [Neon Console](https://console.neon.tech/).
    - Click on **SQL Editor** in the sidebar.
    - Paste the code into the editor.
    - Click the **Run** button.
    - You should see "Success" messages.

## 3. Run the Application

1.  **Open Terminal**:
    - In VS Code, press `` Ctrl + ` `` (backtick) to open the terminal.
    - Or go to **Terminal > New Terminal** in the top menu.

2.  **Start the Server**:
    - Type `npm run dev` and press Enter.

3.  **View in Browser**:
    - Ctrl+Click the link that appears (usually `http://localhost:3000`).
    - You should see the hiCousins landing page!

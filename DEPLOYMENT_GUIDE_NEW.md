# 🚀 MedDesk Dual Deployment Guide (Vercel + Render)

Setting up MedDesk for a real-world scenario involves hosting the Backend (Node/Express API) on a constant server like **Render**, and the Next.js Frontend on **Vercel**.

## 1. Prepare your GitHub Repository
Make sure all your latest code is pushed to your GitHub repository before starting.

## 2. Deploy the Backend (Render)
Render is perfect for Node.js servers, allowing cron jobs to run smoothly 24/7 without timing out.

1.  Go to [Render.com](https://render.com/) and sign up with GitHub.
2.  Click **New +** and select **Blueprint**.
3.  Connect your MedDesk GitHub repository. Render will automatically detect the `backend/render.yaml` file we just created.
4.  Wait for the deployment to finish. 
5.  In the Render Dashboard for your new web service, go to the **Environment** tab and add all the variables from your `backend/.env` file. These include:
    *   `DATABASE_URL` (Your Neon connection string)
    *   `JWT_SECRET` (A strong random string)
    *   `FRONTEND_URL` (We'll update this after Vercel deployment)
    *   (Optional) Twilio and OpenAI keys.
6.  Copy your new Render **Web Service URL** (e.g., `https://meddesk-backend-xxx.onrender.com`).
    *   *Test:* Open `[Your_Render_URL]/health` in a browser to see if the server is alive!

## 3. Deploy the Frontend (Vercel)
Vercel provides lightning-fast edge hosting for your Next.js app.

1.  Go to [Vercel.com](https://vercel.com/) and sign in with GitHub.
2.  Click **Add New...** -> **Project**.
3.  Import your MedDesk repository.
4.  In the configuration block, open the **Environment Variables** section. Add:
    *   **Name:** `NEXT_PUBLIC_API_URL`
    *   **Value:** `[Your_Render_URL]/api` (Make sure to include `/api` at the end!)
5.  Click **Deploy**.

## 4. Final Connection
Now that both are live, tell the backend to trust the frontend!

1.  Copy your new Vercel Frontend URL (e.g., `https://meddesk-xxx.vercel.app`).
2.  Go back to your **Render Dashboard** -> Environment tab.
3.  Add/Update the `FRONTEND_URL` variable to your new Vercel URL.
4.  This fixes any CORS errors when the frontend tries to fetch data.

🎉 **You're Done! Your robust clinic management system is live!**

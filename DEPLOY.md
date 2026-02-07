# Deployment Guide: ENCRYPT Privacy Suite

To make this app accessible on multiple devices and laptops, you need to deploy it to a web host.

## Recommended: Vercel (Fastest)

1.  **Push to GitHub**: Create a repository and push your code.
2.  **Connect to Vercel**:
    - Go to [vercel.com](https://vercel.com).
    - Import your GitHub repository.
    - Click **Deploy**.
3.  **Share**: Once deployed, you'll get a URL like `https://encryption-suite.vercel.app`. Send this URL to the other users!

## Alternative: Netlify

1.  Drag and drop the `dist` folder to [Netlify Drop](https://app.netlify.com/drop).
2.  To get the `dist` folder, run:
    ```powershell
    npm run build
    ```

## Multi-Device Sharing Flow
1.  **Laptop A**: Opens the deployed URL, types a message, and clicks **"Shareable Link"**.
2.  **Laptop B**: Opens the link received from Laptop A.
3.  **Laptop B**: The secret message is automatically visible!

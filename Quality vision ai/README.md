# QualityVision AI

main file is 

QualityVision AI is a web-based application designed for real-time quality control on assembly lines. It leverages powerful AI vision models to identify products, detect manufacturing defects, and verify product dimensions by comparing items against a set of "golden standard" reference images.

## Features

- **Live & Upload-Based Inspection:** Analyze products using a live camera feed or by uploading a pre-recorded video.
- **AI-Powered Product Identification:** Automatically identifies the type of product under inspection.
- **Multi-Image Reference Training:** Use one or more "golden standard" images to train the AI on what a perfect product looks like.
- **Defect Detection:** The AI strictly compares the scanned product to reference images to identify physical flaws like scratches, dents, and discoloration.
- **Dimension Analysis:** The AI measures the product in the image and flags any size deviations from the reference standard.
- **Dynamic Controls:** Adjust environmental parameters and detection thresholds to fine-tune the quality control process.
- **Dashboard & Logging:** View real-time statistics and a log of all recent inspections.

## Technology Stack

- **Framework:** [Next.js](https://nextjs.org/) (React)
- **Language:** [TypeScript](https://www.typescriptlang.org/)
- **AI Integration:** [Genkit](https://firebase.google.com/docs/genkit)
- **AI Model:** [Google Gemini 2.5 Pro](https://deepmind.google/technologies/gemini/)
- **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **Icons:** [Lucide React](https://lucide.dev/)

## Prerequisites

Before you begin, ensure you have the following installed on your system:
- [Node.js](https://nodejs.org/) (v20.x or later)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)

You will also need a **Google AI API Key** to use the Gemini model.
1.  Go to [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  Click **"Create API key"** and copy the generated key.

## Setup

1.  **Clone the repository or download the source code.**

2.  **Install dependencies:**
    Open your terminal in the project's root directory and run:
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a new file named `.env` in the root of the project. Add your Google AI API key to this file:
    ```
    GEMINI_API_KEY=YOUR_API_KEY_HERE
    ```
    Replace `YOUR_API_KEY_HERE` with the key you obtained from Google AI Studio.

## Running the Application

Once the setup is complete, you can start the development server.

1.  **Start the server:**
    Run the following command in your terminal:
    ```bash
    npm run dev
    ```

2.  **Open the application:**
    Open your web browser and navigate to [http://localhost:9002](http://localhost:9002).

The application should now be running, and you can begin using it.

## How to Use QualityVision AI

1.  **Grant Camera Permission:** The first time you use the "Live Camera" tab, your browser will ask for permission to use your camera. Please allow it.
2.  **Add Reference Images:** Before you can inspect a product, you must provide the AI with at least one "golden standard" image of a perfect product.
    - **From Camera/Video:** Position a perfect product in front of the camera (or play it in the uploaded video) and click the **"Add Reference Image"** button.
    - **From File:** Click the **"Upload"** button in the "Reference Images" card on the right to select an image file from your computer.
3.  **Scan a Product:**
    - Position a new product in the video feed.
    - Click the **"Scan Product"** button.
4.  **Review Results:** The AI will analyze the product. The results of the identification, defect check, and dimension analysis will appear below the video feed.

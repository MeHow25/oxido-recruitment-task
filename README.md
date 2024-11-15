# Oxido Recruitment Task

A Node.js application that converts text articles into semantically structured HTML content using OpenAI's GPT model.

## Prerequisites

- Node.js (version ^18.18.0)
- OpenAI API key
- npm or yarn package manager

## Installation

1. Clone the repository:
```bash
git clone https://github.com/MeHow25/oxido-recruitment-task.git
cd oxido-recruitment-task
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Create a `.env` file in the root directory and add your OpenAI API key:
```bash
API_KEY=your_openai_api_key_here
```
Note: If you skip this step, you will be prompted to enter your API key when running the application.

## Usage

Run the application using:
```bash
npm start
```

or

```bash
node --env-file=.env script.js
```

If no API key is found in the `.env` file, you will be prompted to enter it during runtime.

## Output Files
- `artykul.html`: Contains the raw HTML structure
- `podglad.html`: Includes the same content with added styling for preview purposes

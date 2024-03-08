# RPZ Checker

This application allows users to check if one or more domain names are listed on an RPZ blacklist, including the reason for blacklisting. Users can input domains separated by commas or new lines.

## Prerequisites

Ensure you have Python installed on your system. This application was developed with Python 3. You can download Python [here](https://www.python.org/downloads/).

## Installation

1. **Download the Project**

   Download the project files to a directory of your choice.

2. **Install Dependencies**

   Open Command Prompt and navigate to the project directory where you've saved the files. Run the following command to install the required Python packages:

   ```
   pip install Flask dnspython
   ```

## Running the Application

1. In the Command Prompt (ensure you're still in the project directory), start the application by running:

   ```
   python app.py
   ```

2. Open a web browser and go to `http://127.0.0.1:5000/` to access the RPZ Checker.

## Usage

- Enter the domain name(s) you wish to check in the text area provided on the webpage. You can enter multiple domains separated by commas or new lines.
- Click the "Check" button to submit your query.
- The application will display whether each domain is blacklisted and the reason for its status.
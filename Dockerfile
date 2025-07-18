# Use an official Python runtime as a base image
FROM python:3.11

# Set the working directory in the container to /app
WORKDIR /app

# Copy the requirements.txt file into the container at /app
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of your application's source code from your host to your container filesystem
COPY user_db ./user_db

# Copy the start.sh script into the container
COPY start.sh .

# Add execute permissions to the start.sh script
RUN chmod +x start.sh

# Command to run the application
CMD ["./start.sh"]

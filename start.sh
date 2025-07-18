#!/bin/sh

# Start the uvicorn server in the background
uvicorn user_db.main:app --host 0.0.0.0 --port 8000 --reload &

# Wait for the server to start
until curl -s http://localhost:8000 > /dev/null; do
  echo "Waiting for the server to start..."
  sleep 2
done

# Run the Python script
# python /app/demo/demo.py

# Keep the container running
wait

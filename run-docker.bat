@echo off
echo Logging in to Docker Hub...
docker login -u 22i0857

echo Building Docker Images...
docker build -t 22i0857/user-service ./user-service
docker build -t 22i0857/event-service ./event-service
docker build -t 22i0857/booking-service ./booking-service
docker build -t 22i0857/notification-service ./notification-service
docker build -t 22i0857/frontend ./frontend

echo Pushing Images to Docker Hub...
docker push 22i0857/user-service
docker push 22i0857/event-service
docker push 22i0857/booking-service
docker push 22i0857/notification-service
docker push 22i0857/frontend

echo Running Services with Docker Compose...
docker-compose up -d

echo All services are up and running!

import requests
import json

BASE_URL = "http://localhost:5000/events"

def create_event():
    name = input("Enter event name: ")
    date = input("Enter event date (YYYY-MM-DD): ")
    venue = input("Enter event venue: ")
    data = {"name": name, "date": date, "venue": venue}
    response = requests.post(BASE_URL, json=data)
    print(response.json())

def get_all_events():
    response = requests.get(BASE_URL)
    print(json.dumps(response.json(), indent=2))

def get_event_by_id():
    event_id = input("Enter event ID: ")
    response = requests.get(f"{BASE_URL}/{event_id}")
    print(response.json())

def update_event():
    event_id = input("Enter event ID: ")
    name = input("Enter new event name (leave blank to skip): ")
    date = input("Enter new event date (YYYY-MM-DD, leave blank to skip): ")
    venue = input("Enter new event venue (leave blank to skip): ")
    data = {k: v for k, v in {"name": name, "date": date, "venue": venue}.items() if v}
    response = requests.put(f"{BASE_URL}/{event_id}", json=data)
    print(response.json())

def delete_event():
    event_id = input("Enter event ID: ")
    response = requests.delete(f"{BASE_URL}/{event_id}")
    print(response.json())

def menu():
    while True:
        print("\nEvent Management CLI")
        print("1. Create Event")
        print("2. Get All Events")
        print("3. Get Event by ID")
        print("4. Update Event")
        print("5. Delete Event")
        print("6. Exit")
        choice = input("Enter choice: ")
        
        if choice == "1":
            create_event()
        elif choice == "2":
            get_all_events()
        elif choice == "3":
            get_event_by_id()
        elif choice == "4":
            update_event()
        elif choice == "5":
            delete_event()
        elif choice == "6":
            break
        else:
            print("Invalid choice. Try again.")

if __name__ == "__main__":
    menu()

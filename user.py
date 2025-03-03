import requests
import json

def register():
    name = input("Enter your name: ")
    email = input("Enter your email: ")
    password = input("Enter your password: ")
    data = {"name": name, "email": email, "password": password}
    response = requests.post("http://localhost:8000/register/", json=data)
    print(response.json())

def login():
    email = input("Enter your email: ")
    password = input("Enter your password: ")
    data = {"email": email, "password": password}
    response = requests.post("http://localhost:8000/login/", json=data)
    res_data = response.json()
    if response.status_code == 200:
        print("Login successful!")
        return res_data["access_token"]
    else:
        print(res_data["detail"])
        return None

def update_user(token):
    email = input("Enter your email: ")
    name = input("Enter new name (leave empty to keep current): ")
    password = input("Enter new password (leave empty to keep current): ")
    data = {"name": name if name else None, "password": password if password else None}
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.put(f"http://localhost:8000/update/?email={email}", json=data, headers=headers)
    print(response.json())

def main():
    while True:
        print("\n1. Register")
        print("2. Login")
        print("3. Update User Details")
        print("4. Exit")
        choice = input("Select an option: ")
        
        if choice == "1":
            register()
        elif choice == "2":
            token = login()
        elif choice == "3":
            if 'token' in locals() and token:
                update_user(token)
            else:
                print("You need to login first.")
        elif choice == "4":
            break
        else:
            print("Invalid choice, please try again.")

if __name__ == "__main__":
    main()
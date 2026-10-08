import urllib.request
import json

API_KEY = "AIzaSyCyoWJfSq7ppubeiNj3cIpvtERMmtsoDn4"
PROJECT_ID = "smart-campus-services-f1857"

test_accounts = [
    {
        "email": "student.test@campus.com",
        "password": "Password123!",
        "displayName": "Alex Student",
        "role": "user",
        "approved": True
    },
    {
        "email": "food.test@campus.com",
        "password": "Password123!",
        "displayName": "Campus Canteen",
        "role": "food",
        "approved": True
    },
    {
        "email": "xerox.test@campus.com",
        "password": "Password123!",
        "displayName": "Campus Xerox Point",
        "role": "xerox",
        "approved": True
    },
    {
        "email": "delivery.test@campus.com",
        "password": "Password123!",
        "displayName": "Campus Fast Delivery",
        "role": "delivery",
        "approved": True
    },
    {
        "email": "admin@gmail.com",
        "password": "Password123!",
        "displayName": "Campus Admin",
        "role": "admin",
        "approved": True
    }
]

def signup_or_signin(acc):
    email = acc["email"]
    password = acc["password"]
    
    # Try sign up
    url = f"https://identitytoolkit.googleapis.com/v1/accounts:signUp?key={API_KEY}"
    payload = json.dumps({"email": email, "password": password, "returnSecureToken": True}).encode("utf-8")
    req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"})
    
    try:
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode())
            print(f"[CREATED] Auth user created: {email}")
            return data["localId"], data["idToken"]
    except urllib.error.HTTPError as e:
        err_body = e.read().decode()
        if "EMAIL_EXISTS" in err_body:
            print(f"[EXISTS] User {email} already exists. Attempting sign in or reset...")
            # Try sign in with Password123!
            signin_url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={API_KEY}"
            sreq = urllib.request.Request(signin_url, data=payload, headers={"Content-Type": "application/json"})
            try:
                with urllib.request.urlopen(sreq) as sresp:
                    sdata = json.loads(sresp.read().decode())
                    print(f"[LOGGED IN] {email} with Password123!")
                    return sdata["localId"], sdata["idToken"]
            except urllib.error.HTTPError as se:
                print(f"[SIGNIN FAILED] for {email}: {se.read().decode()}")
                # If password different, let's see
                return None, None
        else:
            print(f"[ERROR] {email}: {err_body}")
            return None, None

def set_firestore_user(uid, id_token, acc):
    # Set document in Firestore via REST API
    doc_url = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents/users/{uid}"
    
    fields = {
        "uid": {"stringValue": uid},
        "email": {"stringValue": acc["email"]},
        "displayName": {"stringValue": acc["displayName"]},
        "photoURL": {"stringValue": f"https://ui-avatars.com/api/?name={acc['displayName'].replace(' ', '+')}&background=a476f5&color=fff"},
        "role": {"stringValue": acc["role"]},
        "approved": {"booleanValue": acc["approved"]},
        "createdAt": {"stringValue": "2026-10-07T00:00:00.000Z"}
    }
    
    body = json.dumps({"fields": fields}).encode("utf-8")
    req = urllib.request.Request(doc_url, data=body, headers={"Content-Type": "application/json", "Authorization": f"Bearer {id_token}"}, method="PATCH")
    
    try:
        with urllib.request.urlopen(req) as resp:
            print(f"[FIRESTORE SET] {acc['email']} (role: {acc['role']}) doc updated in Firestore.")
    except urllib.error.HTTPError as e:
        print(f"[FIRESTORE ERROR] for {acc['email']}: {e.read().decode()}")

print("=== Generating test login credentials ===")
results = []
for acc in test_accounts:
    uid, id_token = signup_or_signin(acc)
    if uid and id_token:
        set_firestore_user(uid, id_token, acc)
        results.append(acc)
    else:
        print(f"Skipped firestore setup for {acc['email']}")

print("\n=== Summary ===")
for r in results:
    print(f"Role: {r['role'].upper():<10} | Email: {r['email']:<26} | Password: {r['password']}")

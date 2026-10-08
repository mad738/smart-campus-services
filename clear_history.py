import urllib.request
import json

API_KEY = "AIzaSyCyoWJfSq7ppubeiNj3cIpvtERMmtsoDn4"
PROJECT_ID = "smart-campus-services-f1857"

def clear_orders_history():
    # Authenticate as admin to get token
    signin_url = f"https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key={API_KEY}"
    payload = json.dumps({"email": "admin.test@campus.com", "password": "Password123!", "returnSecureToken": True}).encode("utf-8")
    req = urllib.request.Request(signin_url, data=payload, headers={"Content-Type": "application/json"})

    with urllib.request.urlopen(req) as resp:
        data = json.loads(resp.read().decode())
        id_token = data["idToken"]

    # List documents in 'orders' collection
    orders_url = f"https://firestore.googleapis.com/v1/projects/{PROJECT_ID}/databases/(default)/documents/orders?pageSize=300"
    req_orders = urllib.request.Request(orders_url, headers={"Authorization": f"Bearer {id_token}"})

    try:
        with urllib.request.urlopen(req_orders) as o_resp:
            orders_data = json.loads(o_resp.read().decode())
            docs = orders_data.get("documents", [])
            print(f"Found {len(docs)} order(s) in database.")
            for d in docs:
                doc_name = d["name"]
                del_req = urllib.request.Request(
                    f"https://firestore.googleapis.com/v1/{doc_name}",
                    headers={"Authorization": f"Bearer {id_token}"},
                    method="DELETE"
                )
                with urllib.request.urlopen(del_req) as del_resp:
                    doc_id = doc_name.split("/")[-1]
                    print(f"Deleted order: {doc_id}")
            print("Successfully cleared all order history from database!")
    except urllib.error.HTTPError as e:
        print("Error clearing orders:", e.read().decode())

if __name__ == "__main__":
    clear_orders_history()

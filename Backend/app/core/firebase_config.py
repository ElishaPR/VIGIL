import firebase_admin
from firebase_admin import credentials
from firebase_admin import messaging
import os
from dotenv import load_dotenv

load_dotenv()  

VITE_FIREBASE_PUBLIC_VAPID_KEY=os.getenv("VITE_FIREBASE_PUBLIC_VAPID_KEY")
if not VITE_FIREBASE_PUBLIC_VAPID_KEY:
     raise RuntimeError("VITE_FIREBASE_PUBLIC_VAPID_KEY is not set.")

cred = credentials.Certificate("serviceAccountKey.json")

firebase_admin.initialize_app(cred, {
    'projectId': 'vigil-31e47',
    'storageBucket': 'vigil-31e47.appspot.com',
    'vapidKey': VITE_FIREBASE_PUBLIC_VAPID_KEY
})

print(f"\nFirebase initialized with VAPID Key: {VITE_FIREBASE_PUBLIC_VAPID_KEY[:30]}...\n")
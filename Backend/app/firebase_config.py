import firebase_admin
from firebase_admin import credentials
from firebase_admin import messaging

cred = credentials.Certificate("app/serviceAccountKey.json")

firebase_admin.initialize_app(cred, {
    'projectId': 'vigil-31e47',
    'storageBucket': 'vigil-31e47.appspot.com',
})
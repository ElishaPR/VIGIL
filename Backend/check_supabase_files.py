from app.modules.user.services.supabase_service import supabase

print("Files in documents bucket:")
files = supabase.storage.from_('documents').list()
for f in files:
    print(f"  {f}")

print("\nChecking file details...")
if files:
    for file_info in files:
        if 'name' in file_info and file_info['name'] != 'documents':
            print(f"\nFile: {file_info['name']}")
            try:
                # Try to get file info
                file_details = supabase.storage.from_('documents').list(path=file_info['name'])
                if file_details:
                    for detail in file_details:
                        if 'metadata' in detail and detail['metadata']:
                            print(f"  MIME type: {detail['metadata'].get('mimetype', 'Unknown')}")
                            print(f"  Size: {detail['metadata'].get('size', 'Unknown')}")
                            print(f"  Content Type: {detail['metadata'].get('content-type', 'Unknown')}")
            except Exception as e:
                print(f"  Error getting details: {e}")

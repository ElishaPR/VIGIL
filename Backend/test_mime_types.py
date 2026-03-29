from app.modules.user.services.document_service import ALLOWED_MIME_TYPES

print("Allowed MIME types:")
for mime in ALLOWED_MIME_TYPES:
    print(f"  {mime}")

print("\nDOCX MIME type should be:")
print("  application/vnd.openxmlformats-officedocument.wordprocessingml.document")

print("\nTesting file extension extraction...")
test_filenames = [
    "document.docx",
    "report.pdf", 
    "image.png",
    "test.txt",
    "no_extension"
]

for filename in test_filenames:
    extension = filename.rsplit(".", 1)[-1] if "." in filename else "bin"
    print(f"  {filename} -> {extension}")

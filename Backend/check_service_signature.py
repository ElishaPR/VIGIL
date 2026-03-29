import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.modules.user.services.document_service import create_document_service
import inspect

# Check the create_document_service signature
sig = inspect.signature(create_document_service)
print('create_document_service parameters:')
for param_name, param in sig.parameters.items():
    if param.annotation != inspect.Parameter.empty:
        annotation = param.annotation.__name__ if hasattr(param.annotation, '__name__') else str(param.annotation)
    else:
        annotation = "Any"
    
    default = param.default if param.default != inspect.Parameter.empty else "Required"
    print(f'  {param_name}: {annotation} = {default}')

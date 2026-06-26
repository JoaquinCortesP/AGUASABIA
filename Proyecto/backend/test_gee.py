import json
import traceback
from app.core.config import settings
from google.oauth2 import service_account
import ee

if settings.EE_SERVICE_ACCOUNT_JSON:
    json_str = settings.EE_SERVICE_ACCOUNT_JSON
    if json_str.startswith("'") and json_str.endswith("'"):
        json_str = json_str[1:-1]
    
    # REEMPLAZO DIRECTO
    json_str = json_str.replace('\\\\n', '\\n')
    
    try:
        credentials_dict = json.loads(json_str)
        creds = service_account.Credentials.from_service_account_info(
            credentials_dict, scopes=['https://www.googleapis.com/auth/earthengine']
        )
        ee.Initialize(credentials=creds, project=settings.EE_PROJECT_ID)
        print('GEE Init Success!')
    except Exception as e:
        traceback.print_exc()
else:
    print('No EE_SERVICE_ACCOUNT_JSON')

import asyncio, httpx

async def test():
    async with httpx.AsyncClient(timeout=60) as client:
        # Login
        r = await client.post('http://127.0.0.1:8000/api/v1/usuarios/login', json={'email':'testpro@aguasabia.cl', 'password':'password'})
        token = r.json().get('access_token')
        if not token:
            print('Login failed:', r.text)
            return
        print('Login OK')
        
        # Analizar
        payload = {
            'nombre': 'Test',
            'poligono': [{'latitud':-34.5,'longitud':-71.5}, {'latitud':-34.5,'longitud':-71.4}, {'latitud':-34.4,'longitud':-71.4}],
            'modo': 'avanzado',
            'guardar': False
        }
        resp = await client.post('http://127.0.0.1:8000/api/v1/territorio/consultas/analizar', json=payload, headers={'Authorization': f'Bearer {token}'})
        print('Analizar Status:', resp.status_code)
        if resp.status_code != 200:
            print('Error:', resp.text[:1000])
        else:
            data = resp.json()
            mods = data.get('modulos', {})
            print('Modulos:', list(mods.keys()))
            for k, v in mods.items():
                print(f'  {k}: estado={v.get("estado")}')

asyncio.run(test())

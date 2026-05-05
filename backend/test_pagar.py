import urllib.request
import urllib.error
import json

payload = json.dumps([{"metodo_pago": "Efectivo", "monto": 3315.00}]).encode('utf-8')
req = urllib.request.Request("http://localhost:8003/pedidos/3/pagar", data=payload, method='POST')
req.add_header('Content-Type', 'application/json')

try:
    res = urllib.request.urlopen(req)
    print("Success:", res.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code)
    print("Body:", e.read().decode('utf-8'))

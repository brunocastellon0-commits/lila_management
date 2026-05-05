import urllib.request
import urllib.error

try:
    res = urllib.request.urlopen("http://localhost:7000/servicio/pedidos/kds")
    print(res.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code)
    print("Response Body:", e.read().decode('utf-8'))

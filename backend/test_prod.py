import urllib.request
import urllib.error
import sys

try:
    res = urllib.request.urlopen("http://localhost:8002/products/1")
    print(res.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print("HTTP Error:", e.code)
    print("Response Body:", e.read().decode('utf-8'))
except Exception as e:
    print("Error:", e)

import requests

url = "http://127.0.0.1:5000/compress"
with open("ancient_0016444.jpg", "rb") as f:
    response = requests.post(url, files={"image": f})

print("Status Code:", response.status_code)
print("Server Response:", response.text)
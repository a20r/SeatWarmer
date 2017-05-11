
from flask import Response, Flask, request
import os.path

app = Flask(__name__)


@app.route("/<filename>", methods=["GET"])
def get_static(filename):
    with open(filename) as f:
        res = Response(f.read())
        return res


@app.route("/", methods=["GET"])
def get_index():
    with open("index.html") as f:
        res = Response(f.read())
        return res


@app.route("/data", methods=["POST"])
def post_data():
    if not os.path.isfile("data.csv"):
        with open("data.csv", "w") as f:
            f.write(",".join(request.form.keys()) + "\n")
    with open("data.csv", "a") as f:
        f.write(",".join(request.form.values()) + "\n")
    return ("", 200)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)

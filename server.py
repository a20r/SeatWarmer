
import pandas as pd
from flask import Flask, jsonify
from flask_assets import Environment

app = Flask(__name__)
assets = Environment(app)
cities = pd.read_csv("static/data/city-list-geos.csv")


@app.route("/", methods=["GET"])
def get_index():
    with open("templates/index.html") as f:
        return f.read()


@app.route("/search", methods=["GET"])
def get_search():
    with open("templates/search.html") as f:
        return f.read()


@app.route("/cities", methods=["GET"])
def get_cities():
    city_list = list()
    geos = list()
    for i, row in cities.iterrows():
        city_list.append(row["city"] + ", " + row["state"])
        geos.append({"lat": row["lat"], "lng": row["lng"]})
    return jsonify(cities=city_list, geos=geos)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)

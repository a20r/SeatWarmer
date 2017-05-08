
import pandas as pd
from flask import Flask, render_template, jsonify
from flask_assets import Environment

app = Flask(__name__)
assets = Environment(app)
cities = pd.read_csv("static/data/city-list-geos.csv")


@app.route("/", methods=["GET"])
def get_index():
    with open("templates/index.html") as f:
        return f.read()


@app.route("/search/<ori>/<dst>/<date>", methods=["GET"])
def get_search(ori, dst, date):
    print ori, dst, date
    return "", 200


@app.route("/card", methods=["GET"])
def get_card():
    return render_template(
        "card.html",
        img="static/cars/ford-fiesta.jpg",
        name="Alex Wallar",
        rating=3,
        car_name="Ford Fiesta",
        seats_remaining=4,
        time="10:00 am")


@app.route("/cities", methods=["GET"])
def get_cities():
    city_list = list()
    for i, row in cities.iterrows():
        city_list.append(row["city"] + ", " + row["state"])
    return jsonify(cities=city_list)

# @app.route("/cities", methods=["GET"])
# def get_cities():
#     city_dict = dict()
#     for i, row in cities.iterrows():
#         city_dict[row["city"]] = None
#     return jsonify(city_dict)
#

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)


import warnings
import glob
import json
import random
import pandas
from geopy.distance import great_circle
from tqdm import tqdm

FACES_PATH = "static/faces"
CARS_PATH = "static/cars"
CITY_LIST_PATH = "static/data/city-list-geos.csv"

geos = dict()
cities = pandas.read_csv(CITY_LIST_PATH)


def get_name_from_path(face_path):
    return " ".join(face_path.split("/")[-1].split("_"))


def get_image_from_path(face_path):
    return glob.glob(face_path + "/*.jpg")[0]


def get_random_car(cars):
    car_img = random.choice(cars)
    car_name = " ".join(car_img.split(".")[0].split("/")[-1].split("-"))
    return car_name, car_img


def get_rating_str(rating):
    rating_str = rating * "<span>&starf;</span>"
    rating_str += (5 - rating) * "<span>&star;</span>"
    return rating_str


def get_geo(row):
    return [row["lat"].iloc[0], row["lng"].iloc[0]]


def get_city_name(row):
    return row["city"].iloc[0] + ", " + row["state"].iloc[0]


def create_trip(ori, dst):
    n_waypoints = random.randint(0, 2)
    waypoints = list()
    wp_rows = list()
    ori_name = get_city_name(ori)
    dst_name = get_city_name(ori)
    while len(waypoints) < n_waypoints:
        next_wp = cities.sample(1)
        wp_name = get_city_name(next_wp)
        if wp_name != ori_name and wp_name != dst_name \
                and wp_name not in waypoints:
            waypoints.append(wp_name)
            wp_rows.append(next_wp)
    trip = [get_city_name(ori)] + waypoints + [get_city_name(dst)]
    wp_rows = [ori] + wp_rows + [dst]
    dist = 0
    for i in xrange(len(trip) - 1):
        src = get_geo(wp_rows[i])
        sink = get_geo(wp_rows[i + 1])
        dist += great_circle(src, sink).miles
    return trip, dist


def create_data():
    faces = glob.glob(FACES_PATH + "/*")
    cars = glob.glob(CARS_PATH + "/*")
    data = list()
    for face_path in tqdm(faces):
        car_name, car_img = get_random_car(cars)
        for i in xrange(1, 10):
            ori = cities.sample(1)
            dst = cities.sample(1)
            ori_name = ori["city"].iloc[0] + ", " + ori["state"].iloc[0]
            dst_name = dst["city"].iloc[0] + ", " + dst["state"].iloc[0]
            ori_geo = get_geo(ori)
            dst_geo = get_geo(dst)
            # ori_geo = (42.36, 71.06)
            # dst_geo = (25.76, 80.19)
            trip, dist = create_trip(ori, dst)
            dur = dist / random.uniform(10, 50)
            cost = dist * random.uniform(0.1, 0.4)
            depart = "{}:{} {}".format(
                random.randint(1, 12),
                random.choice(["00", "30"]),
                random.choice(["am", "pm"]))
            datum = {
                "name": get_name_from_path(face_path),
                "img": get_image_from_path(face_path),
                "ori": ori_name,
                "dst": dst_name,
                "ori_geo": list(ori_geo),
                "dst_geo": list(dst_geo),
                "distance": dist,
                "duration": dur,
                "trip": trip,
                "cost": cost,
                "car_name": car_name.title(),
                "car_img": car_img,
                "car_year": random.randint(2007, 2017),
                "seats_remaining": random.randint(1, 4),
                "total_seats": 4,
                "smoker": -1 if random.random() < 0.9 else 1,
                "time": depart,
                "day": i,
                "rating": random.randint(0, 5)}
            data.append(datum)
    return data


if __name__ == "__main__":
    warnings.simplefilter("ignore")
    data = create_data()
    print json.dumps(data)

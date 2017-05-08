
import geocoder
import pandas as pd

CITY_LIST_PATH = "static/data/city-list.csv"
CITY_LIST_GEOS_PATH = "static/data/city-list-geos.csv"


def get_geo(city):
    return geocoder.google(city).latlng


def main():
    df = pd.read_csv(CITY_LIST_PATH)
    lats, lngs = [], []
    for i, row in df.iterrows():
        geo = get_geo(row["city"])
        lats.append(geo[0])
        lngs.append(geo[1])
    df["lat"] = lats
    df["lngs"] = lngs
    df.to_csv(CITY_LIST_GEOS_PATH)


if __name__ == "__main__":
    main()

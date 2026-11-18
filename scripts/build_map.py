"""Build src/data/mapGeo.ts inputs: land, water lines, roads and stop positions.

Usage: python scripts/build_map.py scripts/coastline_raw.json <earth-lands-250m map.geo.json> scripts/roads_raw.json out.json
Coastline and roads: Overpass exports already in the repo (OpenStreetMap, ODbL).
Coarse outer land: npm package @geo-maps/earth-lands-250m.
Then convert out.json to mapGeo.ts (see SPEC section 10).
"""
import json, math, sys
from shapely.geometry import LineString, Point, box, shape
from shapely.ops import polygonize, unary_union, linemerge
S, W, N, E = 42.24, 18.48, 42.52, 18.92
XS, XW, XN, XE = 41.98, 18.30, 42.68, 19.10
KX = math.cos(math.radians((S+N)/2)); SC = 1000/((E-W)*KX)
frame = box(W, S, E, N); ext = box(XW, XS, XE, XN)
def P(lon, lat): return ((lon-W)*KX*SC, (N-lat)*SC)
coast = json.load(open(sys.argv[1]))['elements']
lines = [LineString([(p['lon'], p['lat']) for p in w['geometry']]) for w in coast if len(w.get('geometry') or []) > 1]
polys = [p for p in polygonize(unary_union([*lines, frame.exterior])) if frame.contains(p.representative_point())]
sea_in = unary_union([p for p in polys if p.contains(Point(18.60, 42.28))])
land_in = frame.difference(sea_in).buffer(0)
# coarse land outside the detailed frame
data = json.load(open(sys.argv[2])); parts = []
for f in data['features'] if 'features' in data else [data]:
    g = shape(f['geometry'] if 'geometry' in f else f)
    for p in getattr(g, 'geoms', [g]):
        if p.intersects(ext):
            ix = p.intersection(ext)
            for q in getattr(ix, 'geoms', [ix]):
                if q.geom_type in ('Polygon', 'MultiPolygon'): parts.append(q)
coarse = unary_union(parts)
outer = coarse.difference(frame)
land = unary_union([land_in, outer.buffer(0)]).buffer(0.0002, join_style=2).buffer(-0.0002, join_style=2)
sea = ext.difference(land)
def path(g, tol, closed=True, minlen=0):
    g = g.simplify(tol, preserve_topology=True); out = []
    def emit(cs):
        pts = [P(*c) for c in cs]
        if len(pts) < 2: return
        if minlen and LineString(pts).length < minlen: return
        out.append("M" + "L".join(f"{x:.1f} {y:.1f}" for x, y in pts) + ("Z" if closed else ""))
    def walk(g):
        t = g.geom_type
        if t == 'Polygon': emit(g.exterior.coords); [emit(r.coords) for r in g.interiors]
        elif t in ('LineString', 'LinearRing'): emit(g.coords)
        elif hasattr(g, 'geoms'): [walk(x) for x in g.geoms]
    walk(g); return "".join(out)
land_d = path(land, 0.00005)
wl = []
for d in (0.0018, 0.0045, 0.008):
    r = land.buffer(d, join_style=1).boundary.intersection(sea).intersection(ext.buffer(-0.002))
    wl.append(path(r, 0.00025, closed=False, minlen=10))
rl = []
for w in json.load(open(sys.argv[3]))['elements']:
    g = w.get('geometry') or []
    if len(g) < 2 or w.get('tags', {}).get('highway') not in ('trunk', 'primary'): continue
    l = LineString([(p['lon'], p['lat']) for p in g]).intersection(frame)
    if not l.is_empty: rl.append(l)
roads_d = path(linemerge(unary_union(rl)), 0.0002, closed=False)
x0, y0 = P(XW, XN); x1, y1 = P(XE, XS)
pts = {
 'p1': (18.7924, 42.3931), 'p2': (18.6872, 42.4853), 'p3': (18.5780, 42.3973),
 'p4': (18.5598, 42.4555), 'p5': (18.8378, 42.2777), 'p6': (18.6940, 42.4350),
 'Herceg Novi': (18.5375, 42.4531), 'Perast': (18.6985, 42.4865), 'Kotor': (18.7712, 42.4247),
 'Tivat': (18.7010, 42.4300), 'Budva': (18.8370, 42.2780), 'Sveti Stefan': (18.8925, 42.2556),
 'TIV': (18.7233, 42.4047), 'Luštica': (18.6300, 42.3800), 'Bay of Kotor': (18.6200, 42.4500),
 'Adriatic Sea': (18.6000, 42.2900), 'Lovćen': (18.8350, 42.3990), 'Dubrovnik': (18.3400, 42.5700),
}
out = {"land": land_d, "water": wl, "roads": roads_d, "ext": [round(x0,1), round(y0,1), round(x1,1), round(y1,1)],
       "pts": {k: [round(v, 1) for v in P(*c)] for k, c in pts.items()}}
json.dump(out, open(sys.argv[4], 'w'))
print(out['ext'], len(land_d), [len(x) for x in wl], len(roads_d)); print(out['pts'])
